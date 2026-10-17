from datetime import UTC, datetime , timedelta
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from pydantic import BaseModel
from .config import settings
from passlib.context import CryptContext
from typing import Annotated
from fastapi import Depends, HTTPException , status
from .modals import User
from .database import get_db

auth_schema = OAuth2PasswordBearer(tokenUrl="/api/token")

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plainPassword:str,hashPassword:str ) -> bool:
    return pwd_context.verify(plainPassword, hashPassword)




def create_access_token(data: dict , expires_delta:timedelta | None = None):
     encode = data.copy()
     if expires_delta:
          expire= datetime.now(UTC) + expires_delta
     else:
          expire = datetime.now(UTC) + timedelta(
            minutes= settings.access_token_expires_minute
        )
    
     encode.update({"exp":expire})
     encoded_jwt = jwt.encode(
         encode,
         settings.secret_key.get_secret_value(),
         algorithm=settings.algoritham
     )
     return encoded_jwt
 
 
 
def verify_jwt(token: str)-> str | None:
     try:
         payload = jwt.decode(
             token,
             settings.secret_key.get_secret_value(),
             algorithms=[settings.algoritham],
             options= {"require": ["exp", "sub"]}
         )
     except jwt.InvalidTokenError:
         return None
     else:
         return payload.get("sub")



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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid User",
            headers={"WWW-Authnticated":"Bearer"}
        )
    return user
    
    
current_user = Annotated[User, Depends(get_login_user)]