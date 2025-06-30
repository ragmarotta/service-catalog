# main.py
"""
Ponto de entrada principal da aplicação FastAPI (backend).

Este ficheiro é responsável por:
1. Criar e configurar a instância principal da aplicação FastAPI.
2. Definir e aplicar middlewares, como o CORS para permitir a comunicação com o frontend.
3. Orquestrar os eventos de ciclo de vida da aplicação (startup e shutdown).
4. Incluir e organizar os diferentes módulos de rotas (auth, users, resources).
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import connect_to_mongo, close_mongo_connection, setup_root_user
from .routers import auth, users, resources
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis
import os

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


@app.get("/api/health")
async def health_check():
    """Endpoint simples para verificar a saúde da API."""
    return {"status": "ok", "message": "Service Catalog API is running!"}
