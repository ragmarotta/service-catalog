# database.py
"""
Módulo responsável pela gestão da conexão com o banco de dados MongoDB.

Este ficheiro centraliza toda a lógica de conexão, desconexão e configuração
inicial do banco de dados, incluindo a criação do utilizador 'root' do sistema.
"""
import motor.motor_asyncio
from dotenv import load_dotenv
import os
from .security import get_password_hash

# Carrega as variáveis de ambiente a partir de um ficheiro .env.
# Essencial para manter configurações sensíveis (como senhas e strings de conexão) fora do código.
load_dotenv()

# Obtém as configurações do banco de dados a partir das variáveis de ambiente.
# Usa valores padrão caso as variáveis não estejam definidas.
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "service_catalog_dev")
ROOT_USER_PASSWORD_HASH = os.getenv("ROOT_USER_PASSWORD")

# Variáveis globais para armazenar o cliente de conexão e a instância do banco.
client: motor.motor_asyncio.AsyncIOMotorClient = None
db: motor.motor_asyncio.AsyncIOMotorDatabase = None

async def connect_to_mongo():
    """
    Estabelece a conexão assíncrona com o servidor MongoDB.

    Esta função é chamada durante o evento de 'startup' da aplicação FastAPI.
    Utiliza a biblioteca 'motor', que é o driver assíncrono oficial para MongoDB,
    sendo ideal para aplicações baseadas em asyncio como o FastAPI.
    """
    global client, db
    print("Conectando ao MongoDB...")
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
        db = client[DATABASE_NAME]
        print("Conexão com MongoDB estabelecida com sucesso!")
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")


async def close_mongo_connection():
    """
    Fecha a conexão com o servidor MongoDB de forma segura.

    Esta função é chamada durante o evento de 'shutdown' da aplicação,
    garantindo que os recursos sejam liberados corretamente.
    """
    global client
    if client:
        client.close()
        print("Conexão com MongoDB fechada.")

def get_database() -> motor.motor_asyncio.AsyncIOMotorDatabase:
    """
    Função de conveniência que retorna a instância do banco de dados conectado.

    Returns:
        A instância do banco de dados 'motor' para ser usada em outras partes da aplicação (como no CRUD).
    """
    return db

async def setup_root_user():
    """
    Verifica se o utilizador 'root' existe e, caso contrário, cria-o.

    Esta função de configuração inicial é crucial para garantir que a aplicação
    tenha sempre um utilizador administrador padrão ao iniciar pela primeira vez.
    A senha do utilizador 'root' é lida como um hash a partir das variáveis de ambiente,
    o que é uma prática de segurança importante.
    """
    database = get_database()
    if database is not None:
        users_collection = database.get_collection("users")
        # Procura por um utilizador com o username 'root'.
        root_user = await users_collection.find_one({"username": "root"})
        if not root_user:
            print("Criando usuário 'root' inicial...")
            if not ROOT_USER_PASSWORD_HASH:
                raise ValueError("A variável de ambiente ROOT_USER_PASSWORD não está definida.")

            new_user = {
                "username": "root",
                "email": "root@example.com",
                "full_name": "System Administrator",
                "hashed_password": ROOT_USER_PASSWORD_HASH,
                "role": "administrador",
                "disabled": False
            }
            await users_collection.insert_one(new_user)
            print("Usuário 'root' criado com sucesso.")
