from app.services.email_service import send_verification_email


send_verification_email(
    recipient_email="kishangupta02000@gmail.com",
    recipient_name="Kishan Gupta",
    verification_url="http://localhost:5173/verify-email?token=test123"
)

print("Email sent successfully!")