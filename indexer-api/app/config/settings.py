from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ORG_DATABASE_URL: str
    B_PLUS_INDEXER_DATABASE_URL: str

    class Config:
        env_file = ".env"
        
settings = Settings()