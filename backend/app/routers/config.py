from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from ..models import AppConfig
from ..schemas import UserOut
from .. import crud
from ..security import get_current_active_admin_user

router = APIRouter()

@router.get("/config", response_model=AppConfig)
async def get_app_configuration():
    """Obtém a configuração atual da aplicação."""
    return await crud.get_app_config()

@router.put("/config", response_model=AppConfig)
async def update_app_configuration(
    config: AppConfig,
    current_user: UserOut = Depends(get_current_active_admin_user)
):
    """Atualiza a configuração da aplicação (apenas para administradores)."""
    updated_config = await crud.update_app_config(config)
    return updated_config
