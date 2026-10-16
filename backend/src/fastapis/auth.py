from datetime import UTC, datetime , timedelta
import jwt
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from .config import settings
from passlib.context import CryptContext


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

