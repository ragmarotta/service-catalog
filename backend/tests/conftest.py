# tests/conftest.py
"""
Ficheiro de configuração do Pytest (fixtures).
"""
import pytest_asyncio
import mongomock_motor
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch

from app.main import app

@pytest_asyncio.fixture(scope="function")
async def test_client():
    """
    Fixture que cria e configura um ambiente de teste para a aplicação.
    """
    mock_mongo_client = mongomock_motor.AsyncMongoMockClient()
    
    with patch("app.database.client", mock_mongo_client), \
         patch("app.database.db", mock_mongo_client.service_catalog_test):
        
        # A nova abordagem com lifespan não requer chamadas explícitas aqui,
        # pois o próprio AsyncClient irá gerir o ciclo de vida da app.
        
        # Corrigido: O argumento correto é 'app', e não 'application'.
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client
