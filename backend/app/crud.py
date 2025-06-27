# crud.py
"""
Módulo CRUD (Create, Read, Update, Delete).

Este ficheiro contém todas as funções que interagem diretamente com o banco de dados MongoDB.
Ele abstrai a lógica de acesso ao banco, permitindo que as rotas (routers) permaneçam
limpas e focadas na lógica da API, sem se preocuparem com os detalhes do banco de dados.
"""
from bson import ObjectId
from typing import List, Optional, Dict, Any
from .database import get_database
from . import schemas
from .models import Event, UserInDB, ResourceInDB
from .security import get_password_hash
from datetime import datetime, timezone

# --- Função Auxiliar para Tags ---
def _normalize_tags(tags: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Função auxiliar que recebe uma lista de tags e a retorna com chaves e valores em maiúsculas.
    
    Args:
        tags (List[Dict[str, str]]): A lista de dicionários de tags.
        
    Returns:
        List[Dict[str, str]]: A lista de tags com valores normalizados.
    """
    if not tags: return []
    return [{"key": tag.get("key", "").upper(), "value": tag.get("value", "").upper()} for tag in tags]

# --- Funções de conveniência para obter coleções ---
def get_resource_collection():
    """Retorna a coleção 'resources' do MongoDB."""
    return get_database().get_collection("resources") 

def get_user_collection():
    """Retorna a coleção 'users' do MongoDB."""
    return get_database().get_collection("users")

# --- CRUD para Recursos ---

async def get_resource_by_name(name: str) -> Optional[ResourceInDB]:
    """
    Busca um único recurso pelo seu nome (case-insensitive).
    
    Args:
        name (str): O nome do recurso a ser procurado.
        
    Returns:
        Optional[ResourceInDB]: O objeto do recurso se encontrado, caso contrário None.
    """
    resource_data = await get_resource_collection().find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if resource_data:
        if 'related_resources' in resource_data:
            resource_data['related_resources'] = [str(res_id) for res_id in resource_data['related_resources']]
        return ResourceInDB(**resource_data)
    return None

async def create_resource(resource: schemas.ResourceCreate) -> ResourceInDB:
    """
    Cria um novo documento de recurso, normalizando as tags e inicializando os eventos.
    
    Args:
        resource (schemas.ResourceCreate): O objeto Pydantic com os dados do recurso a ser criado.
        
    Returns:
        ResourceInDB: O objeto do recurso recém-criado, validado pelo Pydantic.
    """
    resource_dict = resource.model_dump()
    resource_dict["tags"] = _normalize_tags(resource_dict.get("tags", []))
    resource_dict["events"] = []
    if "related_resources" in resource_dict:
        resource_dict["related_resources"] = [ObjectId(rid) for rid in resource.related_resources if ObjectId.is_valid(rid)]
    new_resource = await get_resource_collection().insert_one(resource_dict)
    created_resource_data = await get_resource_collection().find_one({"_id": new_resource.inserted_id})
    if 'related_resources' in created_resource_data:
        created_resource_data['related_resources'] = [str(res_id) for res_id in created_resource_data['related_resources']]
    return ResourceInDB(**created_resource_data)

async def update_resource(resource_id: str, resource_data: schemas.ResourceUpdate) -> Optional[ResourceInDB]:
    """
    Atualiza um documento de recurso, normalizando as tags.
    
    Args:
        resource_id (str): O ID do recurso a ser atualizado.
        resource_data (schemas.ResourceUpdate): Os campos a serem atualizados.
        
    Returns:
        Optional[ResourceInDB]: O objeto do recurso atualizado, ou None se não for encontrado.
    """
    if not ObjectId.is_valid(resource_id): return None
    update_data = resource_data.model_dump(exclude_unset=True) 
    if "tags" in update_data and update_data["tags"] is not None:
        update_data["tags"] = _normalize_tags(update_data["tags"])
    if "related_resources" in update_data and update_data["related_resources"] is not None:
        update_data["related_resources"] = [ObjectId(rid) for rid in update_data["related_resources"] if ObjectId.is_valid(rid)]
    if len(update_data) >= 1:
        await get_resource_collection().update_one({"_id": ObjectId(resource_id)}, {"$set": update_data})
    return await get_resource(resource_id)

async def clone_resource(resource_id: str) -> Optional[ResourceInDB]:
    """
    Clona um recurso, criando uma cópia com um novo nome e sem o histórico de eventos.
    
    Args:
        resource_id (str): O ID do recurso a ser clonado.
        
    Returns:
        Optional[ResourceInDB]: O objeto do recurso clonado, ou None se o original não for encontrado.
    """
    original_resource = await get_resource(resource_id)
    if not original_resource: return None
    
    cloned_data = schemas.ResourceCreate(
        name=f"{original_resource.name} - Cópia",
        description=original_resource.description,
        tags=original_resource.tags,
        related_resources=original_resource.related_resources,
    )
    return await create_resource(cloned_data)

async def import_resources(resources_to_import: List[schemas.ResourceImport]) -> Dict[str, Any]:
    """
    Importa uma lista de recursos, criando novos ou atualizando existentes.
    Preserva os eventos dos recursos que são atualizados.
    
    Args:
        resources_to_import (List[schemas.ResourceImport]): Uma lista de objetos de recurso para importar.
        
    Returns:
        Dict[str, Any]: Um sumário da operação, com contagem de criados, atualizados e erros.
    """
    summary = {"created": 0, "updated": 0, "errors": []}
    name_to_id_map: Dict[str, str] = {}
    
    # Passagem 1: Criar/atualizar dados básicos e construir o mapa nome -> ID.
    for res_import in resources_to_import:
        try:
            base_payload = {"name": res_import.name, "description": res_import.description, "tags": res_import.tags}
            
            existing_resource = await get_resource_by_name(res_import.name)
            if existing_resource:
                update_schema = schemas.ResourceUpdate(**base_payload)
                updated_resource = await update_resource(str(existing_resource.id), update_schema)
                name_to_id_map[res_import.name] = str(updated_resource.id)
                summary["updated"] += 1
            else:
                create_schema = schemas.ResourceCreate(**base_payload)
                new_resource = await create_resource(create_schema)
                name_to_id_map[res_import.name] = str(new_resource.id)
                summary["created"] += 1
        except Exception as e:
            summary["errors"].append(f"Item '{res_import.name}': {str(e)}")

    # Passagem 2: Atualizar apenas as relações ('related_resources').
    for res_import in resources_to_import:
        res_name = res_import.name
        res_id = name_to_id_map.get(res_name)
        if not res_id: continue
        try:
            related_ids = [name_to_id_map[name] for name in res_import.related_resources if name in name_to_id_map]
            await get_resource_collection().update_one(
                {"_id": ObjectId(res_id)},
                {"$set": {"related_resources": [ObjectId(rid) for rid in related_ids]}}
            )
        except Exception as e:
            summary["errors"].append(f"Item '{res_name}': Falha ao atualizar relações - {str(e)}")

    return summary

async def get_resource(resource_id: str) -> Optional[ResourceInDB]:
    """
    Busca um único recurso pelo seu ID.
    
    Args:
        resource_id (str): O ID do recurso a ser procurado.
        
    Returns:
        Optional[ResourceInDB]: O objeto do recurso se encontrado, caso contrário None.
    """
    if not ObjectId.is_valid(resource_id): return None
    resource_data = await get_resource_collection().find_one({"_id": ObjectId(resource_id)})
    if resource_data:
        if 'related_resources' in resource_data:
            resource_data['related_resources'] = [str(res_id) for res_id in resource_data['related_resources']]
        return ResourceInDB(**resource_data)
    return None

async def get_all_resources(name: Optional[str] = None, tags: Optional[str] = None) -> List[ResourceInDB]:
    """
    Busca todos os recursos, com filtros opcionais por nome e tags.
    
    Args:
        name (Optional[str]): Filtra recursos cujo nome contenha este valor.
        tags (Optional[str]): Filtra recursos que contenham as tags no formato "chave:valor,chave2:valor2".
        
    Returns:
        List[ResourceInDB]: Uma lista de objetos de recurso.
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

async def delete_resource(resource_id: str) -> bool:
    """Deleta um recurso e remove as suas referências de outros recursos."""
    if not ObjectId.is_valid(resource_id): return False
    await get_resource_collection().update_many({"related_resources": ObjectId(resource_id)}, {"$pull": {"related_resources": ObjectId(resource_id)}})
    delete_result = await get_resource_collection().delete_one({"_id": ObjectId(resource_id)})
    return delete_result.deleted_count > 0

async def delete_multiple_resources(resource_ids: List[str]) -> int:
    """Deleta múltiplos recursos e remove as suas referências."""
    object_ids = [ObjectId(rid) for rid in resource_ids if ObjectId.is_valid(rid)]
    if not object_ids: return 0
    await get_resource_collection().update_many({"related_resources": {"$in": object_ids}}, {"$pull": {"related_resources": {"$in": object_ids}}})
    delete_result = await get_resource_collection().delete_many({"_id": {"$in": object_ids}})
    return delete_result.deleted_count

async def add_event_to_resource(resource_id: str, event: schemas.EventCreate) -> Optional[ResourceInDB]:
    """Adiciona um evento ao array 'events' de um documento de recurso."""
    if not ObjectId.is_valid(resource_id): return None
    event_dict = event.model_dump()
    event_dict['timestamp'] = datetime.now(timezone.utc)
    await get_resource_collection().update_one({"_id": ObjectId(resource_id)}, {"$push": {"events": event_dict}})
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
    if not ObjectId.is_valid(user_id): return None
    user_data = await get_user_collection().find_one({"_id": ObjectId(user_id)})
    if user_data:
        return UserInDB(**user_data)
    return None

async def update_user(user_id: str, user_data: schemas.UserUpdate) -> Optional[UserInDB]:
    """Atualiza um utilizador. Se uma nova senha for fornecida, ela é hasheada."""
    if not ObjectId.is_valid(user_id): return None
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
    if not user_to_delete: return False
    if user_to_delete.username == "root": return False
    delete_result = await get_user_collection().delete_one({"_id": ObjectId(user_to_delete.id)})
    return delete_result.deleted_count > 0
