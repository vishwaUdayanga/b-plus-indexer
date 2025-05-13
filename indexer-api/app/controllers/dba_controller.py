from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from jose import jwt
from datetime import datetime, timedelta, timezone
import json
import uuid
from fastapi import HTTPException

from app.config.settings import settings
from app.utils.hashing import verify_password
from app.schemas.dba import LoginRequest, LoginResponse

def get_keyvault_secrets():
    """
    Fetch secrets from Azure Key Vault.
    """
    credential = DefaultAzureCredential()
    secret_client = SecretClient(vault_url=settings.AZURE_KEYVAULT_URL, credential=credential)
    
    try: 
        secret = secret_client.get_secret(settings.AZURE_KEYVAULT_SECRET_NAME)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching secret: {str(e)}")
    
    # Check if the secret is empty
    if not secret.value:
        raise HTTPException(status_code=500, detail="Secret is empty")

    return json.loads(secret.value)

def authenticate_dba(dba: LoginRequest) -> LoginResponse | HTTPException:
    """
    Authenticate user using the provided credentials.
    """
    # Fetch secret from Azure Key Vault
    secret = get_keyvault_secrets()

    # Check if the username exists
    if dba.username not in secret:
        raise HTTPException(status_code=401, detail="Invalid username")
    
    # Verify the password
    try:
        actual_password = secret[dba.username]
    except KeyError:
        raise HTTPException(status_code=401, detail="Incorrect format in key vault secret")
    if not verify_password(dba.password, actual_password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Create a JWT token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + access_token_expires
    payload = {
        "sub": dba.username,
        "exp": expire,
        "scope": "user"
    }
    access_token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=int(access_token_expires.total_seconds()),
        refresh_token=str(uuid.uuid4()),
        scope="user"
    )