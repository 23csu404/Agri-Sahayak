
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    APP_NAME: str = "AgriSahayak"
    APP_VERSION: str = "1.0.0"

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file="backend/.env",
        extra="ignore"
    )


settings = Settings()
