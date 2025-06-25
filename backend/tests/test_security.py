# tests/test_security.py
"""Testes para as funcionalidades de segurança (security.py)."""
import pytest
from app.security import get_password_hash, verify_password, create_access_token
from jose import jwt
from app.security import SECRET_KEY, ALGORITHM

def test_password_hashing():
    """
    Testa a geração e verificação de hashes de senha.

    Garante que a função `verify_password` retorna True para a senha correta
    e False para uma senha incorreta.
    """
    password = "a_senha_secreta_123"
    hashed_password = get_password_hash(password)

    # O hash nunca deve ser igual à senha original
    assert password != hashed_password
    # A verificação deve ser bem-sucedida com a senha correta
    assert verify_password(password, hashed_password)
    # A verificação deve falhar com uma senha incorreta
    assert not verify_password("senha_errada", hashed_password)

def test_jwt_token_creation():
    """
    Testa a criação de tokens JWT.

    Verifica se o token é criado e se os dados contidos nele (payload)
    correspondem aos dados fornecidos.
    """
    data = {"sub": "testuser", "role": "usuario"}
    token = create_access_token(data)
    
    # Decodifica o token para verificar o seu conteúdo
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    
    # Afirma que o 'subject' e a 'role' no payload são os mesmos que foram inseridos
    assert payload.get("sub") == "testuser"
    assert payload.get("role") == "usuario"
    # Afirma que a chave de expiração ('exp') existe no token
    assert "exp" in payload
