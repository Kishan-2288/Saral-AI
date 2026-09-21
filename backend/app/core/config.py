from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Saral AI"
    ENVIRONMENT: str = "development"
    API_PREFIX: str = "/api/v1"
    DATABASE_URL: str

    # ============================================================
    # Supabase
    # ============================================================

    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_JWKS_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""

    # ============================================================
    # JWT
    # ============================================================

    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ============================================================
    # WhatsApp
    # ============================================================

    WHATSAPP_VERIFY_TOKEN: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""

    # ============================================================
    # Instagram
    # ============================================================

    INSTAGRAM_VERIFY_TOKEN: str = ""
    INSTAGRAM_ACCESS_TOKEN: str = ""

    # ============================================================
    # Razorpay
    # ============================================================

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # ============================================================
    # AI
    # ============================================================

    OPENAI_API_KEY: str = ""

    # ============================================================
    # Email / SMTP
    # ============================================================

    EMAIL_FROM: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""

    VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24

    # ============================================================
    # Frontends
    # ============================================================

    FRONTEND_URL: str = "http://localhost:5173"
    ADMIN_FRONTEND_URL: str = "http://localhost:5173"
    RECEPTIONIST_FRONTEND_URL: str = "http://localhost:5175"

    # ============================================================
    # Booking
    # ============================================================

    BOOKING_FRONTEND_URL: str = "http://localhost:5174"
    BOOKING_LINK_EXPIRE_MINUTES: int = 15

    # ============================================================
    # n8n
    # ============================================================

    N8N_WEBHOOK_SECRET: str = ""
    N8N_APPOINTMENT_CONFIRMED_WEBHOOK_URL: str = ""

    # ============================================================
    # Pydantic Settings
    # ============================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()