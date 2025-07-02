# Sobre este projeto

Este é um aplicativo de catálogo de serviços full-stack com um frontend em React e um backend em Python/FastAPI. Ele permite que os usuários visualizem e gerenciem um catálogo de serviços de TI, incluindo seus relacionamentos e metadados.

O backend fornece uma API RESTful para gerenciar recursos, usuários e autenticação. O frontend fornece uma interface de usuário para interagir com a API, incluindo um mapa visual dos serviços e suas interconexias.

# Comandos

- `docker-compose up --build`: Builda e inicia o backend e o frontend com o Docker.
- `sh run-tests.sh`: Executa os testes de backend.
- `sh redeploy.sh`: Para, remove, builda e reinicia os contêineres do Docker.

# Bibliotecas e Frameworks

## Backend

- **FastAPI**: Framework web para a criação de APIs.
- **SQLAlchemy**: ORM para interação com o banco de dados.
- **Pydantic**: Para validação de dados.
- **pytest**: Para testes.

## Frontend

- **React**: Biblioteca para a construção de interfaces de usuário.
- **React Router**: Para roteamento no lado do cliente.
- **ReactFlow**: Para a criação de gráficos e diagramas interativos.
- **Tailwind CSS**: Framework de CSS para estilização.

# Convenções de Código

## Backend

- Siga as convenções do **PEP 8**.
- Use type hints do Python.
- Mantenha a separação de interesses entre os módulos:
    - `main.py`: Ponto de entrada da aplicação e definição dos endpoints da API.
    - `crud.py`: Funções para interagir com o banco de dados (Criar, Ler, Atualizar, Deletar).
    - `models.py`: Definições dos modelos do SQLAlchemy.
    - `schemas.py`: Definições dos esquemas do Pydantic.
    - `database.py`: Configuração da conexão com o banco de dados.
    - `security.py`: Funções relacionadas à autenticação e segurança.

## Frontend

- Siga as convenções do **Create React App**.
- Use componentes funcionais com Hooks.
- Organize os arquivos por funcionalidade (por exemplo, `components`, `pages`, `services`).
- Use o `AuthContext` para gerenciamento de estado de autenticação.
- Utilize o `api.js` para todas as chamadas à API do backend.
