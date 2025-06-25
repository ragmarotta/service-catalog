# crud.py
"""
Módulo CRUD (Create, Read, Update, Delete).

Este ficheiro contém todas as funções que interagem diretamente com o banco de dados MongoDB.
Ele abstrai a lógica de acesso ao banco, permitindo que as rotas (routers) permaneçam
limpas e focadas na lógica da API, sem se preocuparem com os detalhes do banco de dados.
"""
from bson import ObjectId
from typing import List, Optional
from .database import get_database
from . import schemas
from .models import Event, UserInDB, ResourceInDB
from .security import get_password_hash
from datetime import datetime, timezone

# --- Funções de conveniência para obter coleções ---
def get_resource_collection():
    """Retorna a coleção 'resources' do MongoDB."""
    return get_database().get_collection("resources") 

def get_user_collection():
    """Retorna a coleção 'users' do MongoDB."""
    return get_database().get_collection("users")

# --- CRUD para Recursos ---
async def create_resource(resource: schemas.ResourceCreate) -> ResourceInDB:
    """
    Cria um novo documento de recurso no banco de dados.
    Converte os IDs de string para ObjectId antes de inserir.
    """
    resource_dict = resource.model_dump()
    resource_dict["events"] = []
    if "related_resources" in resource_dict:
        resource_dict["related_resources"] = [ObjectId(rid) for rid in resource.related_resources if ObjectId.is_valid(rid)]
    new_resource = await get_resource_collection().insert_one(resource_dict)
    created_resource_data = await get_resource_collection().find_one({"_id": new_resource.inserted_id})
    if 'related_resources' in created_resource_data:
        created_resource_data['related_resources'] = [str(res_id) for res_id in created_resource_data['related_resources']]
    return ResourceInDB(**created_resource_data)

async def get_resource(resource_id: str) -> Optional[ResourceInDB]:
    """
    Busca um único recurso pelo seu ID.
    Converte os IDs de recursos relacionados para string antes de retornar.
    """
    if not ObjectId.is_valid(resource_id):
        return None
    resource_data = await get_resource_collection().find_one({"_id": ObjectId(resource_id)})
    if resource_data:
        if 'related_resources' in resource_data:
            resource_data['related_resources'] = [str(res_id) for res_id in resource_data['related_resources']]
        return ResourceInDB(**resource_data)
    return None

async def get_all_resources(name: Optional[str] = None, tags: Optional[str] = None) -> List[ResourceInDB]:
    """
    Busca todos os recursos, com filtros opcionais por nome e tags.
    Retorna uma lista de objetos Pydantic `ResourceInDB`.
    """
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    if tags:
        tag_list = []
        for pair in tags.split(','):
            if ':' in pair:
                key, value = pair.split(':', 1)
                tag_list.append({"key": key, "value": {"$regex": value, "$options": "i"}})
        if tag_list:
            query["tags"] = {"$elemMatch": {"$or": tag_list}}
    resources = []
    cursor = get_resource_collection().find(query)
    async for resource_data in cursor:
        if 'related_resources' in resource_data:
            resource_data['related_resources'] = [str(res_id) for res_id in resource_data['related_resources']]
        resources.append(ResourceInDB(**resource_data))
    return resources

async def update_resource(resource_id: str, resource_data: schemas.ResourceUpdate) -> Optional[ResourceInDB]:
    """Atualiza um documento de recurso existente no banco de dados."""
    if not ObjectId.is_valid(resource_id):
        return None
    update_data = resource_data.model_dump(exclude_unset=True) # Apenas atualiza campos fornecidos
    if "related_resources" in update_data and update_data["related_resources"] is not None:
        update_data["related_resources"] = [ObjectId(rid) for rid in update_data["related_resources"] if ObjectId.is_valid(rid)]
    if len(update_data) >= 1:
        await get_resource_collection().update_one({"_id": ObjectId(resource_id)}, {"$set": update_data})
    return await get_resource(resource_id)

async def clone_resource(resource_id: str) -> Optional[ResourceInDB]:
    """Clona um recurso, criando uma cópia com um novo nome."""
    original_resource = await get_resource(resource_id)
    if not original_resource:
        return None
    cloned_data = schemas.ResourceCreate(
        name=f"{original_resource.name} - Cópia",
        description=original_resource.description,
        tags=original_resource.tags,
        related_resources=original_resource.related_resources,
    )
    return await create_resource(cloned_data)

async def delete_resource(resource_id: str) -> bool:
    """Deleta um recurso e remove as suas referências de outros recursos."""
    if not ObjectId.is_valid(resource_id):
        return False
    # Remove as referências deste recurso em outros documentos.
    await get_resource_collection().update_many({"related_resources": ObjectId(resource_id)}, {"$pull": {"related_resources": ObjectId(resource_id)}})
    delete_result = await get_resource_collection().delete_one({"_id": ObjectId(resource_id)})
    return delete_result.deleted_count > 0

# --- CRUD para Eventos ---
async def add_event_to_resource(resource_id: str, event: schemas.EventCreate) -> Optional[ResourceInDB]:
    """Adiciona um evento ao array 'events' de um documento de recurso."""
    if not ObjectId.is_valid(resource_id):
        return None
    event_dict = event.model_dump()
    # Usa um timestamp ciente do fuso horário UTC para consistência.
    event_dict['timestamp'] = datetime.now(timezone.utc)
    await get_resource_collection().update_one(
        {"_id": ObjectId(resource_id)},
        {"$push": {"events": event_dict}}
    )
    return await get_resource(resource_id)

# --- CRUD para Utilizadores ---
async def get_user_by_username(username: str) -> Optional[UserInDB]:
    """Busca um único utilizador pelo seu nome de utilizador."""
    user_data = await get_user_collection().find_one({"username": username})
    if user_data:
        return UserInDB(**user_data)
    return None

async def create_user(user: schemas.UserCreate) -> UserInDB:
    """Cria um novo utilizador, hasheando a sua senha antes de salvar."""
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump(exclude={"password"})
    user_dict["hashed_password"] = hashed_password
    user_dict["disabled"] = False
    new_user = await get_user_collection().insert_one(user_dict)
    created_user_data = await get_user_collection().find_one({"_id": new_user.inserted_id})
    return UserInDB(**created_user_data)

async def get_all_users() -> List[UserInDB]:
    """Busca todos os utilizadores e retorna-os como uma lista de modelos Pydantic."""
    users = []
    cursor = get_user_collection().find()
    async for user_data in cursor:
        users.append(UserInDB(**user_data))
    return users

async def get_user(user_id: str) -> Optional[UserInDB]:
    """Busca um único utilizador pelo seu ID."""
    if not ObjectId.is_valid(user_id):
        return None
    user_data = await get_user_collection().find_one({"_id": ObjectId(user_id)})
    if user_data:
        return UserInDB(**user_data)
    return None

async def update_user(user_id: str, user_data: schemas.UserUpdate) -> Optional[UserInDB]:
    """Atualiza um utilizador. Se uma nova senha for fornecida, ela é hasheada."""
    if not ObjectId.is_valid(user_id):
        return None
    update_data = user_data.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
    if len(update_data) >= 1:
        await get_user_collection().update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    return await get_user(user_id)

async def delete_user(user_id: str) -> bool:
    """Deleta um utilizador, impedindo a exclusão do utilizador 'root'."""
    user_to_delete = await get_user(user_id)
    if not user_to_delete:
        return False
    if user_to_delete.username == "root":
        return False
    delete_result = await get_user_collection().delete_one({"_id": ObjectId(user_to_delete.id)})
    return delete_result.deleted_count > 0
