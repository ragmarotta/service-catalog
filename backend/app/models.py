# models.py
"""
Define os modelos de dados Pydantic que representam as entidades da aplicação.

Estes modelos são usados internamente para estruturar os dados que são
armazenados e manipulados no banco de dados. Eles fornecem tipagem estática
e validação, mas não são diretamente expostos na API (para isso, usamos os 'schemas').
"""
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict
from typing import List, Optional, Annotated
from datetime import datetime
from bson import ObjectId

# --- Tipo Personalizado para ObjectId do MongoDB ---
# O Pydantic v2 requer uma abordagem explícita para validar e serializar tipos customizados.
# Usamos `Annotated` e `BeforeValidator` para instruir o Pydantic a tratar ObjectIds.

def validate_object_id(v):
    """Função validadora que garante que um valor é um ObjectId válido do MongoDB."""
    if not ObjectId.is_valid(v):
        raise ValueError("Invalid ObjectId")
    return v

# PyObjectId é um tipo anotado. Qualquer campo com este tipo passará primeiro pela
# função `validate_object_id` antes de outras validações.
PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

# --- Modelos da Aplicação ---

class Tag(BaseModel):
    """Representa uma tag simples de chave-valor."""
    key: str
    value: str

class Event(BaseModel):
    """Representa um evento ocorrido com um recurso, com tipo, data e mensagem."""
    event_type: str = Field(..., description="Tipo do evento (ex: DEPLOY, BUILD, RESTART)")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: Optional[str] = None

class ResourceBase(BaseModel):
    """Modelo base com os campos comuns de um Recurso."""
    name: str = Field(..., description="Nome do recurso")
    description: Optional[str] = Field(None, description="Descrição detalhada do recurso")
    tags: List[Tag] = []
    # No modelo de dados interno, armazenamos os IDs relacionados como strings para consistência.
    # A conversão de/para ObjectId é feita na camada de CRUD.
    related_resources: List[str] = Field([], description="Lista de IDs de recursos relacionados")

class ResourceInDB(ResourceBase):
    """
    Representa um Recurso da forma como ele é armazenado no MongoDB.
    Herda de ResourceBase e adiciona campos específicos do banco de dados, como o 'id'.
    """
    # O Pydantic mapeia o campo '_id' do MongoDB para o atributo 'id' do modelo.
    id: PyObjectId = Field(..., alias="_id")
    events: List[Event] = []

    class Config:
        """Configuração do modelo Pydantic."""
        # Permite que o Pydantic popule o modelo usando o alias (ex: '_id').
        populate_by_name = True
        # Necessário para que o Pydantic aceite tipos que não são JSON padrão, como ObjectId.
        arbitrary_types_allowed = True
        # Define um 'encoder' customizado para serializar ObjectId para string em saídas JSON.
        json_encoders = {ObjectId: str}

class UserBase(BaseModel):
    """Modelo base com os campos comuns de um Utilizador."""
    username: str
    email: EmailStr  # Usa validação de e-mail do Pydantic.
    full_name: Optional[str] = None
    role: str = Field("visualizador", description="Pode ser 'administrador', 'usuario', 'visualizador'")

class UserCreate(UserBase):
    """Modelo usado ao criar um novo utilizador, inclui a senha em texto plano."""
    password: str

class UserInDB(UserBase):
    """
    Representa um Utilizador da forma como ele é armazenado no MongoDB.
    Adiciona o 'id', a senha hasheada e o status 'disabled'.
    """
    id: PyObjectId = Field(..., alias="_id")
    hashed_password: str
    disabled: bool = False

    class Config:
        """Configuração do modelo Pydantic para interoperabilidade com o MongoDB."""
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Token(BaseModel):
    """Modelo para a resposta do endpoint de login, representando um token de acesso JWT."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Modelo para os dados contidos dentro de um token JWT, usado para validação."""
    username: Optional[str] = None
