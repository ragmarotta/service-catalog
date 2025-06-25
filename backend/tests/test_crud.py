# tests/test_crud.py
"""Testes para as funções CRUD (crud.py)."""
import pytest
from app import crud, schemas
from bson import ObjectId

@pytest.mark.asyncio
async def test_create_and_get_user(test_client):
    """Testa a criação e a busca de um utilizador."""
    user_in = schemas.UserCreate(
        username="testuser",
        email="test@example.com",
        password="testpassword",
        role="usuario"
    )
    # Cria o utilizador
    created_user = await crud.create_user(user_in)
    assert created_user.username == "testuser"
    
    # Busca o utilizador pelo username
    db_user = await crud.get_user_by_username("testuser")
    assert db_user is not None
    assert db_user.email == "test@example.com"
    
    # Busca o utilizador pelo ID
    db_user_by_id = await crud.get_user(str(db_user.id))
    assert db_user_by_id is not None
    assert db_user_by_id.username == "testuser"

@pytest.mark.asyncio
async def test_create_and_get_resource(test_client):
    """Testa a criação e a busca de um recurso."""
    resource_in = schemas.ResourceCreate(
        name="API Principal",
        description="A API principal do sistema."
    )
    # Cria o recurso
    created_resource = await crud.create_resource(resource_in)
    assert created_resource.name == "API Principal"
    assert created_resource.events == []
    
    # Busca o recurso pelo ID
    db_resource = await crud.get_resource(str(created_resource.id))
    assert db_resource is not None
    assert db_resource.description == "A API principal do sistema."

@pytest.mark.asyncio
async def test_add_event_to_resource(test_client):
    """Testa a adição de um evento a um recurso."""
    resource_in = schemas.ResourceCreate(name="Servidor Web")
    created_resource = await crud.create_resource(resource_in)
    
    event_in = schemas.EventCreate(
        event_type="DEPLOY",
        message="Versão 1.0 implantada."
    )
    # Adiciona o evento
    updated_resource = await crud.add_event_to_resource(str(created_resource.id), event_in)
    
    # Verifica se o evento foi adicionado
    assert len(updated_resource.events) == 1
    assert updated_resource.events[0].event_type == "DEPLOY"
    assert updated_resource.events[0].message == "Versão 1.0 implantada."
