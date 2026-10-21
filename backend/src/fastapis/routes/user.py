from fastapi import APIRouter, HTTPException, status, Depends , BackgroundTasks
from typing import Annotated
from sqlalchemy import select,func
from sqlalchemy import delete as sql_delete
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from datetime import timedelta, UTC,datetime
from fastapi.security import OAuth2PasswordRequestForm
from ..schema import Token, UserResponseModel, UserCreateModel, ForgotPasswordRequest , ChangePasswordRequest , ResetPasswordRequest
from ..modals import User, PasswordResetToken
from ..database import get_db
from ..config import settings
from ..auth import create_access_token  , verify_password , auth_schema , verify_jwt, current_user, generate_password_reset_token,generate_password_reset_token_hash
from ..email import send_password_reset_email
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
    login_user:current_user
)->User:
    if not login_user:
       raise HTTPException(
           status_code=status.HTTP_401_UNAUTHORIZED,
           detail="Login user not found"
       )
    
    return login_user


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_passwrd(request_data:ForgotPasswordRequest , background_task:BackgroundTasks, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(User).where(func.lower(User.email)== request_data.email.lower()))
    user = result.scalars().first()
    
    if user:
        await db.execute(sql_delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))
        token = generate_password_reset_token()
        token_hash = generate_password_reset_token_hash(token)
        expires_at = datetime.now(UTC) + timedelta(minutes= settings.reset_token_expires_minutes)
        
        reset_token = PasswordResetToken(
            user_id= user.id,
            token_hash = token_hash,
            expires_at= expires_at
        )
        
        db.add(reset_token)
        await db.commit()
        
        background_task.add_task(
            send_password_reset_email,
            to_email=user.email,
            username= user.userName,
            token=token
        )
        
    return {
        "message":"if an account with this email exist you will recieve the email for password reset "
    }

@router.post("/reset-password", status_code = status.HTTP_200_OK)
async def reset_password(
    request_data:ResetPasswordRequest,
    db:Annotated[AsyncSession, Depends(get_db)]
):
    token_hash = generate_password_reset_token_hash(request_data.token)
    result = await db.execute(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )
    reset_token = result.scalars().first()
    if not reset_token:
        raise HTTPException(
            status_code= status.HTTP_400_BAD_REQUEST,
            detail= "Invalid or expired reset token"
        )
    
    if reset_token.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
        await db.delete(reset_token)
        await db.commit()
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    result = await db.execute(
        select(User).where(User.id == reset_token.user_id)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = "Invalid or expired reset token"
        )
    user.password = get_password_hash(request_data.new_password)
    await db.execute(
        sql_delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id)
    )
    await db.commit()
    return {
        "message":"Password Resert Successfully , you can login with your new password"
    }
    
    


@router.post("/change-password", status_code = status.HTTP_200_OK)
async def change_paassword(passsword_data: ChangePasswordRequest , loggedIn_user: current_user , db: Annotated[AsyncSession , Depends(get_db)]):
    if not verify_password(passsword_data.current_password , loggedIn_user.password):
        raise HTTPException(
            status_code= status.HTTP_400_BAD_REQUEST,
            detail = "Current password is incorrect"
        )
    loggedIn_user.password = get_password_hash(passsword_data.new_password)
    await db.execute(
        sql_delete(PasswordResetToken).where(PasswordResetToken.user_id == loggedIn_user.id)
    )
    await db.commit()
    return {"message":"Password Changed Successfully"}



@router.get("/user/{user_id}", response_model=UserResponseModel)
async def getUserById(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    existing_user = result.scalars().first()
    
    if existing_user:
        return existing_user
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
