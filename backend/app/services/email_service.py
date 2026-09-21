import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USERNAME)


def send_verification_email(
    recipient_email: str,
    recipient_name: str,
    verification_url: str
):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_USERNAME or SMTP_PASSWORD is missing"
        )

    message = EmailMessage()

    message["Subject"] = "Verify your Saral AI account"
    message["From"] = EMAIL_FROM
    message["To"] = recipient_email

    message.set_content(
        f"""Hello {recipient_name},

Welcome to Saral AI.

Your account has been created by an administrator.

Please verify your email address by clicking the link below:

{verification_url}

This verification link will expire in 24 hours.

If you did not request this account, you can safely ignore this email.

Regards,
Saral AI Team
"""
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()

        server.login(
            SMTP_USERNAME,
            SMTP_PASSWORD
        )

        server.send_message(message)