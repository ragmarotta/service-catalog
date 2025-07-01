# models.py
"""
Define os modelos de dados Pydantic que representam as entidades da aplicação.

Estes modelos são usados internamente para estruturar os dados que são
armazenados e manipulados no banco de dados. Eles fornecem tipagem estática
e validação, mas não são diretamente expostos na API (para isso, usamos os 'schemas').
"""
from pydantic import (
    BaseModel, Field, EmailStr, BeforeValidator, ConfigDict, field_validator
)
from pydantic.functional_serializers import PlainSerializer
from typing import List, Optional, Annotated
from datetime import datetime, timezone
from bson import ObjectId

# --- Tipo Personalizado para ObjectId do MongoDB ---
def validate_object_id(v):
    """Função validadora que garante que um valor é um ObjectId válido do MongoDB."""
    if not ObjectId.is_valid(v):
        raise ValueError("Invalid ObjectId")
    return v

# PyObjectId é um tipo anotado que combina validação e serialização.
# - BeforeValidator: Garante que a entrada seja um ObjectId válido.
# - PlainSerializer: Converte o ObjectId para string ao serializar para JSON.
PyObjectId = Annotated[
    ObjectId,
    BeforeValidator(validate_object_id),
    PlainSerializer(lambda x: str(x), return_type=str)
]

# --- Modelos da Aplicação ---
class Tag(BaseModel):
    """Representa uma tag simples de chave-valor."""
    key: str
    value: str

class Event(BaseModel):
    """Representa um evento ocorrido com um recurso, com tipo, data e mensagem."""
    event_type: str
    # Corrigido: datetime.utcnow() substituído por datetime.now(timezone.utc) para evitar DeprecationWarning.
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message: Optional[str] = None
    
    @field_validator('timestamp', mode='before')
    @classmethod
    def set_timezone_to_utc(cls, v):
        """Se a data for 'ingénua' (sem fuso), assume que é UTC e torna-a 'ciente'."""
        if isinstance(v, datetime) and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

class ResourceBase(BaseModel):
    """Modelo base com os campos comuns de um Recurso."""
    name: str
    description: Optional[str] = None
    tags: List[Tag] = []
    related_resources: List[str] = []

class ResourceInDB(ResourceBase):
    """
    Representa um Recurso da forma como ele é armazenado no MongoDB.
    """
    id: PyObjectId = Field(..., alias="_id")
    events: List[Event] = []
    
    # Corrigido: 'json_encoders' removido para usar o serializador definido em PyObjectId.
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class UserBase(BaseModel):
    """Modelo base com os campos comuns de um Utilizador."""
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str

class UserCreate(UserBase):
    """Modelo usado ao criar um novo utilizador, inclui a senha em texto plano."""
    password: str

class UserInDB(UserBase):
    """
    Representa um Utilizador da forma como ele é armazenado no MongoDB.
    """
    id: PyObjectId = Field(..., alias="_id")
    hashed_password: str
    disabled: bool = False
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class Token(BaseModel):
    """Modelo para a resposta do endpoint de login, representando um token de acesso JWT."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Modelo para os dados contidos dentro de um token JWT, usado para validação."""
    username: Optional[str]

class AppConfig(BaseModel):
    icon_url: Optional[str] = None
    oauth2_enabled: bool = False
    oauth2_provider_url: Optional[str] = None
    oauth2_client_id: Optional[str] = None
    oauth2_client_secret: Optional[str] = None
    oauth2_scope: Optional[str] = "openid email profile"
    oauth2_redirect_uri: Optional[str] = None
    oauth2_userinfo_url: Optional[str] = None
    oauth2_username_attribute: Optional[str] = "preferred_username"
    oauth2_email_attribute: Optional[str] = "email"
    oauth2_login_button_text: Optional[str] = "Login with OAuth2"

class BulkDeleteRequest(BaseModel):
    ids: List[str]
