from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from sqlalchemy import select,func

from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from ..schema import Token, UserResponseModel, UserCreateModel
from ..modals import User
from ..database import get_db
from ..config import settings
from ..auth import create_access_token  , verify_password , auth_schema , verify_jwt

router = APIRouter()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/create/user", status_code=status.HTTP_201_CREATED, response_model=UserResponseModel)
async def create_user(user: UserCreateModel, db: Annotated[AsyncSession, Depends(get_db)]):
    results = await db.execute(select(User).where(func.lower(User.userName) == func.lower(user.userName)))
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




@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    result = await db.execute(
        select(User).where(
            func.lower(User.email) == form_data.username.strip().lower()
        )
    )
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UnAuthorize, incorrect email or password"
            
        )
    access_token_expires= timedelta(minutes= settings.access_token_expires_minute)
    access_token = create_access_token(
        data={"sub":str(user.id)},
        expires_delta=access_token_expires
        
    )
    return Token(access_token=access_token , token_type="bearer")



@router.get("/login/user" , response_model=UserResponseModel)
async def get_login_user(
    token: Annotated[str, Depends(auth_schema)],
    db: Annotated[AsyncSession , Depends(get_db)]
):
    user_id = verify_jwt(token=token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expire token")
    
    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED
            )
    result = await db.execute(select(User).where(User.id == user_id_int))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND
        )
    return user
    
    


@router.get("/user/{user_id}", response_model=UserResponseModel)
async def getUserById(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    existing_user = result.scalars().first()
    
    if existing_user:
        return existing_user
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
