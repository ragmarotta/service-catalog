# main.py
"""
Ponto de entrada principal da aplicação FastAPI (backend).

Este ficheiro é responsável por:
1. Criar e configurar a instância principal da aplicação FastAPI.
2. Definir e aplicar middlewares, como o CORS para permitir a comunicação com o frontend.
3. Orquestrar os eventos de ciclo de vida da aplicação (startup e shutdown).
4. Incluir e organizar os diferentes módulos de rotas (auth, users, resources).
"""
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
import google.generativeai as genai
import redis.asyncio as redis
import os

from .database import connect_to_mongo, close_mongo_connection, setup_root_user
from .routers import auth, users, resources, config
from . import crud
from .models import AppConfig

from fastapi_limiter import FastAPILimiter


# --- Eventos de Ciclo de Vida (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestor de contexto que executa código na inicialização e no encerramento da aplicação.
    """
    # Código executado na inicialização
    await connect_to_mongo()
    await setup_root_user()

    # Initialize FastAPI-Limiter
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_instance = redis.from_url(redis_url, encoding="utf8", decode_responses=True)
    await FastAPILimiter.init(redis_instance)
    
    yield # A aplicação fica em execução aqui.
    
    # Código executado no encerramento
    await close_mongo_connection()
    await FastAPILimiter.close() # Close Redis connection

# Cria a instância da aplicação FastAPI, agora com o gestor de ciclo de vida.
app = FastAPI(
    title="Service Catalog API",
    description="API para gerenciar um catálogo de serviços e seus relacionamentos.",
    version="1.0.0",
    lifespan=lifespan
)

# Configuração do CORS (Cross-Origin Resource Sharing).
origins = [
    "http://localhost",
    "http://localhost:3000",  # Porta padrão do React
    "http://localhost:8080",  # Porta padrão do Nginx no Docker
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Restrict methods
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"], # Restrict headers
)

# Middleware para adicionar cabeçalhos de segurança
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
    return response

# Inclusão dos Routers da API.
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(resources.router, prefix="/api", tags=["Resources"])
app.include_router(config.router, prefix="/api", tags=["Configuration"])

class AIPrompt(BaseModel):
    prompt: str

@app.post("/api/ai/analyse", tags=["AI"])
async def analyse_prompt(prompt: AIPrompt, config: AppConfig = Depends(crud.get_app_config)):
    if not config.gemini_api_key:
        raise HTTPException(status_code=500, detail="API key for Google Gemini is not configured.")

    genai.configure(api_key=config.gemini_api_key)
    model = genai.GenerativeModel(config.gemini_model)

    resources = await crud.get_all_resources()
    events = await crud.get_all_events()

    full_prompt = f"""Você é um assistente de IA especialista em análise de dados de um catálogo de serviços de TI.
    Sua resposta deve ser em português do Brasil e em linguagem natural.
    
    Aqui está o contexto da aplicação:
    Recursos: {resources}
    Eventos: {events}
    
    Pergunta do usuário: {prompt.prompt}
    """

    try:
        response = model.generate_content(full_prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def read_root():
    """Endpoint raiz que retorna uma mensagem de boas-vindas."""
    return {"message": "Bem-vindo à API do Catálogo de Serviços!"}


@app.get("/api/health")
async def health_check():
    """Endpoint simples para verificar a saúde da API."""
    return {"status": "ok", "message": "Service Catalog API is running!"}
