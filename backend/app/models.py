# models.py
"""
Define os modelos de dados Pydantic que representam as entidades da aplicação.
"""
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict, field_validator
from typing import List, Optional, Annotated
from datetime import datetime, timezone
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
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message: Optional[str] = None

    # A correção está aqui: Este validador garante que, ao ler a data do MongoDB,
    # ela seja sempre tratada como um datetime ciente do fuso horário UTC.
    @field_validator('timestamp', mode='before')
    @classmethod
    def set_timezone_to_utc(cls, v):
        """Se a data for 'ingénua' (sem fuso), assume que é UTC e torna-a 'ciente'."""
        if isinstance(v, datetime) and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

class ResourceBase(BaseModel):
    """Modelo base com os campos comuns de um Recurso."""
    name: str = Field(..., description="Nome do recurso")
    description: Optional[str] = Field(None, description="Descrição detalhada do recurso")
    tags: List[Tag] = []
    # No modelo de dados interno, armazenamos os IDs relacionados como strings para consistência.
    # A conversão de/para ObjectId é feita na camada de CRUD.
    related_resources: List[str] = Field([], description="Lista de IDs de recursos relacionados")

class ResourceInDB(ResourceBase):
    """Representa um Recurso da forma como ele é armazenado no MongoDB."""
    id: PyObjectId = Field(..., alias="_id")
    events: List[Event] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserBase(BaseModel):
    """Modelo base com os campos comuns de um Utilizador."""
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str = Field("visualizador", description="Pode ser 'administrador', 'usuario', 'visualizador'")

class UserCreate(UserBase):
    """Modelo usado ao criar um novo utilizador, inclui a senha em texto plano."""
    password: str

class UserInDB(UserBase):
    """Representa um Utilizador da forma como ele é armazenado no MongoDB."""
    id: PyObjectId = Field(..., alias="_id")
    hashed_password: str
    disabled: bool = False

    class Config:
        """Configuração do modelo Pydantic para interoperabilidade com o MongoDB."""
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Token(BaseModel):
    """Modelo para a resposta do endpoint de login."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Modelo para os dados contidos dentro de um token JWT."""
    username: Optional[str] = None
