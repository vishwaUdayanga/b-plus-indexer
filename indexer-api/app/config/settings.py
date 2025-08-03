from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ORG_DATABASE_URL: str
    B_PLUS_INDEXER_DATABASE_URL: str

    AZURE_KEYVAULT_URL: str
    AZURE_KEYVAULT_SECRET_NAME: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int

    ORG_DB_LOG_VOLUME_NAME: str

    IS_DEV_MODE: bool = True

    USER: str

    class Config:
        env_file = ".env"
        
settings = Settings()