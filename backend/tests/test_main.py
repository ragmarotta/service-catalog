# tests/test_main.py
"""Testes para o ficheiro principal da aplicação (main.py)."""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_read_root(test_client: AsyncClient):
    """
    Testa se o endpoint raiz ("/") está a funcionar corretamente.

    Verifica se a resposta tem o status code 200 (OK) e se o corpo (body)
    da resposta é o JSON esperado.
    """
    # Faz uma requisição GET para a rota /api
    response = await test_client.get("/api")
    
    # Afirma que o status code da resposta é 200 (Sucesso)
    assert response.status_code == 200
    
    # Afirma que o JSON da resposta é o esperado
    assert response.json() == {"message": "Bem-vindo à API do Catálogo de Serviços!"}
