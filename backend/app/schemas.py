# schemas.py
"""
Define os schemas Pydantic que representam os dados na interface da API.

Estes schemas são usados pelo FastAPI para:
1. Validar os dados de entrada (corpo das requisições POST/PUT).
2. Definir o formato dos dados de saída (respostas das requisições GET).
3. Gerar a documentação automática da API (Swagger UI / ReDoc).

Eles atuam como a "camada de contrato" entre o frontend e o backend.
"""
from pydantic import BaseModel, Field, BeforeValidator
from typing import List, Optional, Annotated
from datetime import datetime
from bson import ObjectId

# Importa modelos internos que podem ser reutilizados nos schemas.
from .models import Tag, Event, EmailStr

# --- Helper Function e Tipos Anotados ---

def object_id_to_str(v: any) -> str:
    """
    Função auxiliar que converte um valor para string se ele for um ObjectId.
    Utilizada com `BeforeValidator` para garantir que os IDs sejam strings
    antes da validação do Pydantic.
    """
    if isinstance(v, ObjectId):
        return str(v)
    return v

# Tipo anotado que aplica a conversão de ObjectId para string.
# Usado nos campos 'id' dos modelos de saída (Out) para garantir a serialização correta.
ObjectIdStr = Annotated[str, BeforeValidator(object_id_to_str)]

# --- Schemas da Aplicação ---

class ResourceOut(BaseModel):
    """Schema para a resposta ao obter um ou mais recursos."""
    id: ObjectIdStr
    name: str
    description: Optional[str] = None
    tags: List[Tag] = []
    related_resources: List[str] = []
    events: List[Event] = []

class ResourceWithRelationsOut(ResourceOut):
    """
    Schema estendido para a listagem de recursos.
    Inclui listas com os nomes dos recursos pai e filho para exibição na tabela.
    """
    parents: List[str] = []
    children: List[str] = []

class ResourceCreate(BaseModel):
    """Schema para os dados de entrada ao criar um novo recurso."""
    name: str = Field(..., description="Nome do recurso")
    description: Optional[str] = Field(None, description="Descrição detalhada do recurso")
    tags: List[Tag] = []
    related_resources: List[str] = Field([], description="Lista de IDs de recursos relacionados")

class ResourceUpdate(BaseModel):
    """Schema para os dados de entrada ao atualizar um recurso. Todos os campos são opcionais."""
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[Tag]] = None
    related_resources: Optional[List[str]] = None

class EventCreate(BaseModel):
    """Schema para os dados de entrada ao adicionar um novo evento a um recurso."""
    event_type: str
    message: Optional[str] = None

class Node(BaseModel):
    """Schema que representa um 'nó' no formato esperado pela biblioteca ReactFlow."""
    id: str
    type: str = 'default'
    data: dict
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})

class Edge(BaseModel):
    """Schema que representa uma 'aresta' (ligação) no formato esperado pela biblioteca ReactFlow."""
    id: str
    source: str
    target: str
    animated: bool = True
    style: dict = Field(default_factory=lambda: {"stroke": "#6b7280"})

class ServiceMap(BaseModel):
    """Schema para a resposta do endpoint do mapa de serviços, contendo nós e arestas."""
    nodes: List[Node]
    edges: List[Edge]

class UserOut(BaseModel):
    """Schema para a resposta ao obter dados de um utilizador (sem a senha)."""
    id: ObjectIdStr
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    disabled: bool

class UserCreate(BaseModel):
    """Schema para os dados de entrada ao criar um novo utilizador."""
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    password: str
    role: str = "visualizador"

class UserUpdate(BaseModel):
    """Schema para os dados de entrada ao atualizar um utilizador. Todos os campos são opcionais."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    disabled: Optional[bool] = None
    password: Optional[str] = None
