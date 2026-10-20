from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )
    
    secret_key:SecretStr
    algoritham:str = "HS256"
    access_token_expires_minute:int = 30
    
    max_file_upload_bytes: int = 5 * 1024 * 1024
    products_per_page:int = 10
    
    reset_token_expires_minutes = 60
    smtp_server:str = "localhost"
    smtp_port:int = 587
    smtp_username:str=""
    smtp_password:SecretStr = SecretStr("")
    mail_from:str = "hadiquershi08@gmail.com"
    mail_use_tls = True
    frontend_url = 'tpp://localhost:5173'
    
    
    
settings = Settings() #Loadedfrom .env file