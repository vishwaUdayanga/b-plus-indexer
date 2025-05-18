from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from app.config.settings import settings

auth_scheme = HTTPBearer()

def verify_jwt_token(token: str) -> dict:
    """
    Verify the JWT token and return the payload.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload  # Token is valid
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
async def auth_wrapper(token: HTTPAuthorizationCredentials = Depends(auth_scheme)) -> dict:
    return verify_jwt_token(token.credentials)
    

    
