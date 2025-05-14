from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from datetime import datetime, timezone
from app.config.settings import settings

auth_scheme = HTTPBearer()

def verify_jwt_token(token: str) -> dict:
    """
    Verify the JWT token and return the payload.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        # Check if the token is expired
        if "exp" in payload:
            exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
            if exp < datetime.now(tz=timezone.utc):
                raise HTTPException(status_code=401, detail="Token has expired")
        
        return payload
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
async def auth_wrapper(token: HTTPAuthorizationCredentials = Depends(auth_scheme)) -> dict:
    return verify_jwt_token(token.credentials)
    

    
