# security.py
"""
Módulo responsável por todas as funcionalidades de segurança e autenticação.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# A importação do 'crud' foi removida do topo para quebrar o ciclo.
# from . import crud
from .models import UserInDB, TokenData

load_dotenv()

# --- Constantes de Segurança ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# --- Configuração de Hashing de Senhas ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se uma senha em texto plano corresponde a um hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gera o hash para uma senha em texto plano usando bcrypt."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria um novo token de acesso JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    """Dependência FastAPI para decodificar um token e obter os dados do utilizador."""
    # A importação é feita aqui, dentro da função, para evitar o ciclo.
    from . import crud
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = await crud.get_user_by_username(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """Dependência que verifica se o utilizador autenticado não está desabilitado."""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_admin_user(current_user: UserInDB = Depends(get_current_active_user)) -> UserInDB:
    """Dependência que verifica se o utilizador autenticado é um administrador ativo."""
    if current_user.role != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user

async def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    """Autentica um utilizador."""
    # A importação também é feita aqui para garantir o acesso ao crud.
    from . import crud

    user = await crud.get_user_by_username(username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
