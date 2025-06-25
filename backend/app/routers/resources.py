# routers/resources.py
"""
Define todos os endpoints (rotas) da API relacionados ao gerenciamento de Recursos.
Inclui rotas para criar, listar, atualizar, deletar, clonar, e obter metadados de recursos.
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from bson import ObjectId
from .. import crud, schemas, security
from ..crud import get_resource_collection 
from ..models import UserInDB, ResourceInDB
# Corrigido: Adicionado 'timezone' para garantir a comparação correta.
from datetime import datetime, timezone

router = APIRouter()

# Permissões:
# 'visualizador' pode apenas ler.
# 'usuario' pode ler, criar, editar.
# 'administrador' pode tudo.

def require_role(required_roles: List[str]):
    """
    Função de dependência que cria um verificador de permissões.
    Garante que o usuário atual tenha uma das permissões listadas para acessar a rota.

    Args:
        required_roles (List[str]): Lista de permissões permitidas (ex: ["administrador", "usuario"]).

    Returns:
        Uma função de dependência que pode ser usada pelo FastAPI para proteger um endpoint.
    """
    async def role_checker(current_user: UserInDB = Depends(security.get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role"
            )
        return current_user
    return role_checker

@router.post("/resources", response_model=schemas.ResourceOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(["administrador", "usuario"]))])
async def create_new_resource(resource: schemas.ResourceCreate):
    """Cria um novo recurso no banco de dados. Acessível por administradores e usuários."""
    created_resource = await crud.create_resource(resource)
    return schemas.ResourceOut.model_validate(created_resource, from_attributes=True)

@router.get("/resources", response_model=List[schemas.ResourceWithRelationsOut], dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_all_resources_list(name: Optional[str] = None, tags: Optional[str] = None):
    """
    Retorna uma lista de recursos, enriquecida com os nomes dos pais e filhos.
    Acessível por todos os tipos de usuários. Pode ser filtrada por nome e tags.
    """
    # 1. Busca todos os recursos filtrados do CRUD.
    resources = await crud.get_all_resources(name=name, tags=tags)
    
    # 2. Cria um mapa de ID para nome para busca rápida de nomes de filhos.
    resource_map = {str(res.id): res.name for res in await crud.get_all_resources()}

    # 3. Processa as relações para cada recurso.
    results = []
    for resource in resources:
        # Encontra os pais iterando sobre o mapa completo de recursos.
        parent_names = []
        all_resources_for_mapping = await crud.get_all_resources()
        for potential_parent in all_resources_for_mapping:
            if str(resource.id) in potential_parent.related_resources:
                parent_names.append(potential_parent.name)

        # Encontra os filhos usando o mapa de busca.
        child_names = [resource_map.get(child_id) for child_id in resource.related_resources if resource_map.get(child_id)]

        # Cria o objeto de resposta final.
        resource_out = schemas.ResourceWithRelationsOut(
            **resource.model_dump(),
            parents=parent_names,
            children=child_names
        )
        results.append(resource_out)

    return results

@router.get("/resources/map", response_model=schemas.ServiceMap, dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_service_map(name: Optional[str] = None, tags: Optional[str] = None):
    """
    Retorna os dados formatados para a biblioteca ReactFlow, gerando a estrutura
    de 'nós' (nodes) e 'arestas' (edges) para a renderização do mapa de serviços.
    """
    resources = await crud.get_all_resources(name=name, tags=tags)
    nodes = []
    edges = []
    
    for res in resources:
        res_id_str = str(res.id)
        nodes.append(schemas.Node(
            id=res_id_str,
            data={"label": res.name, "description": res.description or "", "tags": [t.model_dump() for t in res.tags]},
            position={"x": 0, "y": 0} 
        ))
        
        for related_id in res.related_resources:
            related_id_str = str(related_id)
            if any(str(r.id) == related_id_str for r in resources):
                edges.append(schemas.Edge(
                    id=f"{res_id_str}-{related_id_str}",
                    source=res_id_str,
                    target=related_id_str
                ))
    
    return schemas.ServiceMap(nodes=nodes, edges=edges)

@router.get("/resources/{resource_id}", response_model=schemas.ResourceOut, dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_single_resource(resource_id: str):
    """Busca e retorna um único recurso pelo seu ID."""
    resource = await crud.get_resource(resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return schemas.ResourceOut.model_validate(resource, from_attributes=True)

@router.put("/resources/{resource_id}", response_model=schemas.ResourceOut, dependencies=[Depends(require_role(["administrador", "usuario"]))])
async def update_existing_resource(resource_id: str, resource: schemas.ResourceUpdate):
    """Atualiza os dados de um recurso existente. Acessível por administradores e usuários."""
    updated_resource = await crud.update_resource(resource_id, resource)
    if updated_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return schemas.ResourceOut.model_validate(updated_resource, from_attributes=True)

@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role(["administrador"]))])
async def delete_existing_resource(resource_id: str):
    """Deleta um recurso. Apenas administradores podem executar esta ação."""
    success = await crud.delete_resource(resource_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource not found")
    return

@router.post("/resources/{resource_id}/events", response_model=schemas.ResourceOut, dependencies=[Depends(require_role(["administrador", "usuario"]))])
async def add_event(resource_id: str, event: schemas.EventCreate):
    """Adiciona um novo evento ao histórico de um recurso."""
    resource = await crud.add_event_to_resource(resource_id, event)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return schemas.ResourceOut.model_validate(resource, from_attributes=True)

@router.get("/resources/{resource_id}/timeline", response_model=List[schemas.Event], dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_event_timeline(
    resource_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Retorna a timeline de eventos para um recurso, com filtros opcionais de data."""
    resource = await crud.get_resource(resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    events = [schemas.Event.model_validate(e, from_attributes=True) for e in resource.events]
    
    events.sort(key=lambda x: x.timestamp, reverse=True)
    
    # Filtra os eventos por data, garantindo que a comparação de datetimes seja segura
    # entre um objeto 'aware' (com fuso horário, vindo do filtro) e um 'naive' (do banco).
    if start_date:
        # Garante que a data do evento (e.timestamp) seja tratada como UTC antes de comparar.
        events = [e for e in events if e.timestamp.replace(tzinfo=timezone.utc) >= start_date]
    if end_date:
        # Faz o mesmo para a data de fim.
        events = [e for e in events if e.timestamp.replace(tzinfo=timezone.utc) <= end_date]
        
    return events

@router.get("/meta/config", response_model=dict, dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_app_config():
    """Retorna dados de configuração para o frontend, como tipos de eventos e chaves de tags existentes para autocomplete."""
    event_types = ["DEPLOY", "BUILD", "RESTART", "UPDATE", "DOWN", "UP", "INFO"]
    
    all_tags = await get_resource_collection().distinct("tags.key")
    
    return {
        "event_types": event_types,
        "tag_keys": all_tags
    }
