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
from .database import connect_to_mongo, close_mongo_connection, setup_root_user
from .routers import auth, users, resources

# Cria a instância da aplicação FastAPI, fornecendo metadados que serão
# exibidos na documentação automática da API (ex: /docs).
app = FastAPI(
    title="Service Catalog API",
    description="API para gerenciamento de um catálogo de serviços e seus ciclos de vida.",
    version="1.0.0"
)

# Define a lista de origens (domínios) que têm permissão para fazer requisições a esta API.
# Essencial para que o frontend (rodando em outra porta/domínio) possa se comunicar com o backend.
origins = [
    "http://localhost",
    "http://localhost:3000",
]

# Adiciona o middleware de CORS (Cross-Origin Resource Sharing) à aplicação.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Permite as origens listadas.
    allow_credentials=True,      # Permite o envio de credenciais (como cookies ou tokens de autenticação).
    allow_methods=["*"],         # Permite todos os métodos HTTP (GET, POST, PUT, DELETE, etc.).
    allow_headers=["*"],         # Permite todos os cabeçalhos nas requisições.
)

# --- Eventos de Ciclo de Vida ---

@app.on_event("startup")
async def startup_event():
    """
    Função assíncrona executada uma única vez quando a aplicação FastAPI inicia.

    É o local ideal para tarefas de inicialização, como estabelecer conexões
    com bancos de dados ou carregar modelos de machine learning.
    """
    await connect_to_mongo()
    await setup_root_user() # Garante que o usuário 'root' inicial seja criado se não existir.


@app.on_event("shutdown")
async def shutdown_event():
    """
    Função assíncrona executada uma única vez quando a aplicação está a ser encerrada.

    Utilizada para tarefas de limpeza, como fechar conexões de forma segura para
    liberar recursos.
    """
    await close_mongo_connection()

# --- Inclusão das Rotas da API ---

# Inclui os "routers" (conjuntos de rotas) definidos em outros ficheiros.
# Esta abordagem modular mantém o código principal limpo e organizado por funcionalidade.
# O 'prefix' adiciona um caminho base para todas as rotas daquele router.
# As 'tags' agrupam os endpoints na documentação automática da API.
app.include_router(auth.router, tags=["Authentication"], prefix="/api")
app.include_router(users.router, tags=["Users"], prefix="/api")
app.include_router(resources.router, tags=["Resources"], prefix="/api")

@app.get("/api", tags=["Root"])
async def read_root():
    """
    Endpoint raiz da API.

    Serve como uma verificação de saúde ("health check") básica para confirmar
    que a API está online e a responder a requisições.
    """
    return {"message": "Bem-vindo à API do Catálogo de Serviços!"}