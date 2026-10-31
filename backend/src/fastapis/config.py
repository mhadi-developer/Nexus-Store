from pathlib import Path

from pydantic import AliasChoices, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

PACKAGE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PACKAGE_DIR / ".env",
        env_file_encoding="utf-8",
    )
    
    secret_key:SecretStr
    database_url: str
    algoritham:str = "HS256"
    access_token_expires_minute:int = 30
    
    max_file_upload_bytes: int = 5 * 1024 * 1024
    products_per_page:int = 10
    
    reset_token_expires_minutes: int = 60
    smtp_server:str = "localhost"
    smtp_port:int = 587
    smtp_username:str=""
    smtp_password:SecretStr = SecretStr("")
    mail_from:str = "hadiquershi08@gmail.com"
    mail_use_tls: bool = True
    frontend_url: str = "http://localhost:5173"
    
    stripe_public_key: str = Field(
        validation_alias=AliasChoices("stripe_public_key", "stripe_published_key")
    )
    stripe_secret_key:SecretStr
    stripe_webhook_secret: SecretStr
    
    
    
    
settings = Settings() #Loadedfrom .env file