# main.py
"""
Ponto de entrada principal da aplicação FastAPI (backend).

Este ficheiro é responsável por:
1. Criar e configurar a instância principal da aplicação FastAPI.
2. Definir e aplicar middlewares, como o CORS para permitir a comunicação com o frontend.
3. Orquestrar os eventos de ciclo de vida da aplicação (startup e shutdown).
4. Incluir e organizar os diferentes módulos de rotas (auth, users, resources).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import connect_to_mongo, close_mongo_connection, setup_root_user
from .routers import auth, users, resources

# --- Eventos de Ciclo de Vida (Lifespan) ---
# A nova abordagem para eventos de startup e shutdown no FastAPI.
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestor de contexto que executa código na inicialização e no encerramento da aplicação.
    """
    # Código executado na inicialização
    await connect_to_mongo()
    await setup_root_user()
    
    yield # A aplicação fica em execução aqui.
    
    # Código executado no encerramento
    await close_mongo_connection()

# Cria a instância da aplicação FastAPI, agora com o gestor de ciclo de vida.
app = FastAPI(
    title="Service Catalog API",
    description="API para gerenciamento de um catálogo de serviços e seus ciclos de vida.",
    version="1.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Inclusão das Rotas da API ---
app.include_router(auth.router, tags=["Authentication"], prefix="/api")
app.include_router(users.router, tags=["Users"], prefix="/api")
app.include_router(resources.router, tags=["Resources"], prefix="/api")

@app.get("/api", tags=["Root"])
async def read_root():
    """Endpoint raiz da API."""
    return {"message": "Bem-vindo à API do Catálogo de Serviços!"}
