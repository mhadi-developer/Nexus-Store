from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from ..schema import UserResponseModel, UserCreateModel
from ..modals import User
from ..database import get_db

router = APIRouter()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/create/user", status_code=status.HTTP_201_CREATED, response_model=UserResponseModel)
async def create_user(user: UserCreateModel, db: Annotated[AsyncSession, Depends(get_db)]):
    results = await db.execute(select(User).where(User.userName == user.userName))
    if results.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exist")
    
    result = await db.execute(select(User).where(User.email == user.email))
    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exist")
        
    hashed_password = get_password_hash(user.password)
    new_user = User(
        userName=user.userName,
        email=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        password=hashed_password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@router.get("/user/{user_id}", response_model=UserResponseModel)
async def getUserById(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    existing_user = result.scalars().first()
    
    if existing_user:
        return existing_user
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")