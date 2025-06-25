# routers/auth.py
"""
Define os endpoints da API relacionados à autenticação.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from .. import schemas, security
from ..models import Token, UserInDB

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint de login.

    Recebe 'username' e 'password' via formulário, autentica o utilizador
    e, se for bem-sucedido, retorna um token de acesso JWT.
    Este é o endpoint padrão para o fluxo OAuth2 "Password Flow".
    """
    user = await security.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Define a duração do token e cria-o.
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.UserOut)
async def read_users_me(current_user: UserInDB = Depends(security.get_current_active_user)):
    """
    Endpoint para obter os dados do utilizador atualmente autenticado.

    O frontend chama esta rota após o login para obter as informações
    do utilizador, como nome e permissões, para personalizar a UI.
    A dependência `get_current_active_user` faz todo o trabalho de validação do token.
    """
    # Valida o objeto do banco de dados para o schema de saída da API.
    return schemas.UserOut.model_validate(current_user, from_attributes=True)
