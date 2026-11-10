import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load local environment files if present
_root_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(_root_dir / ".env.local")
load_dotenv(_root_dir / "backend" / ".env")
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "BATON"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres@127.0.0.1:5435/baton"
    )
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "baton_production_super_secret_key_change_in_prod_99887766")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    
    # AI Adapters
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openrouter")  # openrouter, gemini, claude, local
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

