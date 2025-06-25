# routers/users.py
"""
Define todos os endpoints da API para o gerenciamento de Utilizadores.
Todas as rotas aqui requerem permissão de administrador.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from .. import crud, schemas, security
from ..models import UserInDB

router = APIRouter()

# --- Dependência de Permissão ---
async def get_admin_user(current_user: UserInDB = Depends(security.get_current_active_user)):
    """
    Dependência que garante que apenas utilizadores com a permissão 'administrador'
    possam acessar a rota.
    """
    if current_user.role != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted",
        )
    return current_user

# O `dependencies=[Depends(get_admin_user)]` aplica a verificação de permissão a todas as rotas abaixo.
@router.post("/users", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_admin_user)])
async def create_new_user(user: schemas.UserCreate):
    """Cria um novo utilizador (Apenas para administradores)."""
    db_user = await crud.get_user_by_username(user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    created_user = await crud.create_user(user)
    return schemas.UserOut.model_validate(created_user, from_attributes=True)


@router.get("/users", response_model=List[schemas.UserOut], dependencies=[Depends(get_admin_user)])
async def read_users():
    """Retorna uma lista de todos os utilizadores (Apenas para administradores)."""
    users = await crud.get_all_users()
    return [schemas.UserOut.model_validate(user, from_attributes=True) for user in users]


@router.get("/users/{user_id}", response_model=schemas.UserOut, dependencies=[Depends(get_admin_user)])
async def read_user(user_id: str):
    """Retorna um utilizador específico pelo seu ID (Apenas para administradores)."""
    db_user = await crud.get_user(user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserOut.model_validate(db_user, from_attributes=True)


@router.put("/users/{user_id}", response_model=schemas.UserOut, dependencies=[Depends(get_admin_user)])
async def update_existing_user(user_id: str, user: schemas.UserUpdate):
    """Atualiza um utilizador existente (Apenas para administradores)."""
    updated_user = await crud.update_user(user_id, user)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserOut.model_validate(updated_user, from_attributes=True)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_admin_user)])
async def delete_existing_user(user_id: str):
    """Deleta um utilizador (Apenas para administradores). O utilizador 'root' não pode ser deletado."""
    success = await crud.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found or cannot be deleted")
    return
