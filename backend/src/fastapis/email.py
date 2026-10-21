from email.message import EmailMessage
import aiosmtplib
from .config import settings
from fastapi.templating import Jinja2Templates

# Initialize Jinja2 templates (pointing to your templates directory)
TEMPLATES_DIR = Jinja2Templates(directory="templates")

async def send_email(
    to_mail: str,
    subject: str,
    plain_text: str,
    html_content: str | None = None
):
    message = EmailMessage()
    message["From"] = settings.mail_from
    message["To"] = to_mail
    message["Subject"] = subject
    
    # Set fallback plain text content
    message.set_content(plain_text)
    
    # FIX: Change subject="html" to subtype="html"
    if html_content:
        message.add_alternative(html_content, subtype="html")

    await aiosmtplib.send(
        message, 
        username=settings.smtp_username if settings.smtp_username else None, 
        hostname=settings.smtp_server, 
        port=settings.smtp_port, 
        password=settings.smtp_password.get_secret_value() if settings.smtp_password else None, 
        start_tls=settings.mail_use_tls
    )
    
async def send_password_reset_email(to_email: str, username: str, token: str):
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    
    # Render the HTML template
    template = TEMPLATES_DIR.env.get_template("email/password-reset.html")
    html_content = template.render(reset_url=reset_url, username=username)
    
    plain_text = f"""Hi {username}, Good to know you!
     
 Your email reset link: {reset_url}
 This link will expire in one hour.
     
 If you don't want to reset your password, please ignore this email.
     
 Best Regards,
 Team Nexus Store
 """
    
    await send_email(
        to_mail=to_email,
        subject="Password Reset Email -- Nexus Store IT Management",
        plain_text=plain_text,
        html_content=html_content
    )