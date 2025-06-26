# routers/resources.py
"""
Define todos os endpoints (rotas) da API relacionados ao gerenciamento de Recursos.
Inclui rotas para criar, listar, atualizar, deletar, clonar, e obter metadados de recursos.
"""
from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile
import json
from typing import List, Optional
from datetime import datetime

from .. import crud, schemas, security
from ..crud import get_resource_collection 
from ..models import UserInDB

router = APIRouter()

def require_role(required_roles: List[str]):
    """
    Função de dependência que cria um verificador de permissões.
    Garante que o usuário atual tenha uma das permissões listadas para acessar a rota.

    Args:
        required_roles (List[str]): Lista de permissões permitidas (ex: ["administrador", "usuario"]).

    Returns:
        Uma função de dependência que pode ser usada pelo FastAPI.
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
    """Cria um novo recurso, validando se o nome já existe."""
    db_resource = await crud.get_resource_by_name(resource.name)
    if db_resource:
        raise HTTPException(status_code=409, detail=f"Um recurso com o nome '{resource.name}' já existe.")
    created_resource = await crud.create_resource(resource)
    return schemas.ResourceOut.model_validate(created_resource, from_attributes=True)

@router.get("/resources", response_model=List[schemas.ResourceWithRelationsOut], dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_all_resources_list(name: Optional[str] = None, tags: Optional[str] = None):
    """
    Retorna uma lista de recursos.
    A lógica aqui é enriquecer os dados dos recursos com os nomes de seus pais e filhos
    para exibição na tabela do frontend.
    """
    # 1. Busca todos os recursos para mapeamento completo das relações.
    all_resources_for_mapping = await crud.get_all_resources()
    parent_map = {}
    for parent_resource in all_resources_for_mapping:
        for child_id_str in parent_resource.related_resources:
            if child_id_str not in parent_map:
                parent_map[child_id_str] = []
            parent_map[child_id_str].append(parent_resource.name)

    # 2. Busca os recursos que correspondem aos filtros da query.
    filtered_resources = await crud.get_all_resources(name=name, tags=tags)
    
    # 3. Monta a resposta, adicionando os nomes de pais e filhos.
    response_list = []
    for resource in filtered_resources:
        child_names = [r.name for r in all_resources_for_mapping if str(r.id) in resource.related_resources]
        parent_names = parent_map.get(str(resource.id), [])
        
        resource_out = schemas.ResourceWithRelationsOut(
            **resource.model_dump(),
            parents=parent_names,
            children=child_names
        )
        response_list.append(resource_out)
        
    return response_list

@router.get("/resources/map", response_model=schemas.ServiceMap, dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_service_map(name: Optional[str] = None, tags: Optional[str] = None):
    """
    Retorna os dados formatados para a biblioteca ReactFlow,
    gerando a estrutura de 'nós' (nodes) e 'arestas' (edges) para o mapa.
    """
    resources = await crud.get_all_resources(name=name, tags=tags)
    nodes = []
    edges = []
    resource_ids_in_filter = {str(r.id) for r in resources}
    for res in resources:
        res_id_str = str(res.id)
        nodes.append(schemas.Node(
            id=res_id_str,
            data={"label": res.name, "description": res.description or "", "tags": [t.model_dump() for t in res.tags]},
            position={"x": 0, "y": 0} 
        ))
        for related_id in res.related_resources:
            related_id_str = str(related_id)
            if related_id_str in resource_ids_in_filter:
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
    """Atualiza um recurso, validando se o novo nome entra em conflito com outro recurso."""
    if resource.name:
        db_resource = await crud.get_resource_by_name(resource.name)
        # Se um recurso com o novo nome foi encontrado, e o seu ID é diferente do que estamos a editar...
        if db_resource and str(db_resource.id) != resource_id:
            raise HTTPException(status_code=409, detail=f"Um recurso com o nome '{resource.name}' já existe.")
    updated_resource = await crud.update_resource(resource_id, resource)
    if updated_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return schemas.ResourceOut.model_validate(updated_resource, from_attributes=True)

@router.post("/resources/import", dependencies=[Depends(require_role(["administrador", "usuario"]))])
async def import_resources_from_file(resources: List[schemas.ResourceImport]):
    """
    Importa recursos a partir de um corpo JSON.
    O FastAPI valida automaticamente se a entrada é uma lista do tipo ResourceImport.
    """
    summary = await crud.import_resources(resources)
    return summary

@router.post("/resources/{resource_id}/clone", response_model=schemas.ResourceOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(["administrador", "usuario"]))])
async def clone_existing_resource(resource_id: str):
    """Clona um recurso existente, criando uma cópia com um novo nome."""
    cloned_resource = await crud.clone_resource(resource_id)
    if cloned_resource is None:
        raise HTTPException(status_code=404, detail="Recurso não encontrado para clonar")
    return schemas.ResourceOut.model_validate(cloned_resource, from_attributes=True)

@router.delete("/resources", status_code=status.HTTP_200_OK, dependencies=[Depends(require_role(["administrador"]))])
async def delete_multiple_resources(payload: schemas.BulkDeleteRequest):
    """Deleta múltiplos recursos de uma vez. Apenas para administradores."""
    deleted_count = await crud.delete_multiple_resources(payload.ids)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Nenhum dos recursos fornecidos foi encontrado.")
    return {"detail": f"{deleted_count} recursos foram excluídos com sucesso."}

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

@router.post("/resources/by-name/{resource_name}/events", response_model=schemas.ResourceOut, dependencies=[Depends(require_role(["administrador", "usuario"]))])
async def add_event_by_name(resource_name: str, event: schemas.EventCreate):
    """
    Adiciona um novo evento ao histórico de um recurso, buscando-o pelo seu nome.
    Útil para automações e scripts onde o nome é mais acessível que o ID.
    """
    # 1. Busca o recurso pelo nome para obter o seu ID.
    resource = await crud.get_resource_by_name(resource_name)
    if resource is None:
        raise HTTPException(status_code=404, detail=f"Recurso com o nome '{resource_name}' não foi encontrado.")
    
    # 2. Usa o ID encontrado para chamar a função CRUD existente.
    updated_resource = await crud.add_event_to_resource(str(resource.id), event)
    if updated_resource is None:
        # Esta verificação é redundante se a anterior passou, mas é uma boa prática.
        raise HTTPException(status_code=404, detail="Resource not found after update attempt.")

    return schemas.ResourceOut.model_validate(updated_resource, from_attributes=True)

@router.get("/resources/{resource_id}/timeline", response_model=List[schemas.Event], dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_event_timeline(resource_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    """Retorna a timeline de eventos para um recurso, com filtros opcionais de data."""
    resource = await crud.get_resource(resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    events = [schemas.Event.model_validate(e, from_attributes=True) for e in resource.events]
    events.sort(key=lambda x: x.timestamp, reverse=True)
    if start_date:
        events = [e for e in events if e.timestamp >= start_date]
    if end_date:
        events = [e for e in events if e.timestamp <= end_date]
    return events

@router.get("/meta/config", response_model=dict, dependencies=[Depends(require_role(["administrador", "usuario", "visualizador"]))])
async def get_app_config():
    """Retorna dados de configuração para o frontend, como tipos de eventos e chaves de tags existentes."""
    event_types = ["DEPLOY", "BUILD", "RESTART", "UPDATE", "DOWN", "UP", "INFO", "WARNING", "ERROR", "CRITICAL", "DISASTER"]
    all_tags = await get_resource_collection().distinct("tags.key")
    return {"event_types": event_types, "tag_keys": all_tags}
