from email.message import EmailMessage
import aiosmtplib
from .config import settings
from fastapi.templating import Jinja2Templates
from pathlib import Path


PACKAGE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = Jinja2Templates(directory=str(PACKAGE_DIR / "templates"))

async def send_email(
    to_mail:str,
    subject:str,
    plain_text:str,
    html_content:str | None = None
):
    message = EmailMessage()
    message["From"]=settings.mail_from
    message["To"]= to_mail
    message["Subject"]= subject
    
    
    message.set_content(plain_text)
    
    if html_content:
        message.add_alternative(html_content , subtype="html")

    await aiosmtplib.send(message, username=settings.smtp_username if settings.smtp_username else None, hostname=settings.smtp_server , port=settings.smtp_port , password=settings.smtp_password.get_secret_value() or None , start_tls=settings.mail_use_tls)
    
    
    
async def send_password_reset_email(to_email:str , username:str , token:str , subject="Password Reset Email --Nexus Store IT Managment",):
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    templates = TEMPLATES_DIR.env.get_template("email/password-reset.html")
    html_content = templates.render(
        reset_url=reset_url,
        username=username,
        expires_minutes=settings.reset_token_expires_minutes,
    )
    
    plain_text = f"""HI {username} Good to Know you ,
     
     your email reset link: {reset_url},
     This link will expire in {settings.reset_token_expires_minutes} minutes
     
     if you don't want to reset you password ignore this mail
     
     Best Regards
     Team Nexus Store
     
    """
    
    await send_email(
        to_mail=to_email,
        subject=subject,
        plain_text=plain_text,
        html_content=html_content
        
    )
    