from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api_router
from app.db.session import Base, engine

# Import all models before create_all so SQLAlchemy knows every table.
import app.models  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    version="0.2.0",
    description="Saral AI healthcare automation backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",


        # Production
        "https://saral.me",
        "https://www.saral.me",
        "https://admin.saral.me",
        "https://receptionist.saral.me",
        "https://booking.saral.me",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def create_tables():
    # Useful for the MVP/demo environment. Use Alembic migrations in production.
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"name": settings.APP_NAME, "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}
