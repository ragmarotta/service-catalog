# Catálogo de Serviços Interativo

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Nginx](https://img.shields.io/badge/Nginx-1.29-269539?style=for-the-badge&logo=nginx)](https://www.nginx.com/)

Um sistema completo para catalogar, gerenciar e visualizar serviços e as suas dependências, exibindo todo o ciclo de vida através de um mapa de relacionamentos interativo e uma timeline de eventos.

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
- [Segurança](#segurança)
- [Como Executar o Projeto](#como-executar-o-projeto)
  - [Pré-requisitos](#pré-requisitos)
  - [Configuração do Ambiente](#configuração-do-ambiente)
  - [Iniciando a Aplicação](#iniciando-a-aplicação)
- [Executando os Testes](#executando-os-testes)
  - [Testes do Backend](#testes-do-backend)
  - [Testes do Frontend](#testes-do-frontend)
- [Documentação da API](#documentação-da-api)
  - [Autenticação](#autenticação)
  - [Recursos (Resources)](#recursos-resources)
  - [Utilizadores (Users)](#utilizadores-users)
- [Licença](#licença)

## Visão Geral

O **Catálogo de Serviços** é uma aplicação web desenhada para arquitetos de software, equipas de DevOps e gestores de TI. A plataforma permite o cadastro de qualquer tipo de serviço (aplicações, servidores, bancos de dados, links de internet, etc.) como um "Recurso". Estes recursos podem ser relacionados entre si num padrão "muitos para muitos", formando uma árvore completa de dependências.

O principal diferencial da aplicação é a capacidade de visualizar e editar estas dependências diretamente num mapa de serviços interativo, analisar o caminho crítico de impacto, e acompanhar o ciclo de vida de cada serviço através de uma timeline de eventos (como `DEPLOY`, `BUILD`, `RESTART`, etc.).

A aplicação é totalmente conteinerizada com Docker, garantindo um setup de desenvolvimento e produção rápido, consistente e portável.

## Funcionalidades Principais

-   **Mapa de Serviços Interativo**:
    -   Visualização gráfica de todos os recursos e suas relações.
    -   **Edição "Drag-and-Drop"** para criar e remover relações de dependência visualmente.
    -   Destaque dinâmico de toda a árvore de dependências (pais) e de impacto (filhos) com um clique.
    -   Menu de contexto para filtrar a visualização e focar no caminho crítico de um serviço.
-   **Gestão Completa de Recursos**:
    -   CRUD completo com **validação de nomes únicos** para evitar duplicados.
    -   Funcionalidade de **clonagem** para agilizar o cadastro de serviços similares.
    -   Listagem tabular com filtros avançados, ordenação por nome e exibição de nomes de pais/filhos.
    -   Ações em massa, como exclusão de múltiplos recursos.
-   **Importação e Exportação**:
    -   Botões para **exportar** a lista de recursos para um ficheiro JSON.
    -   Funcionalidade para **importar** recursos a partir de um ficheiro JSON, criando novos ou atualizando existentes.
-   **Timeline de Eventos**:
    -   Histórico detalhado de todos os eventos para cada recurso, com **cores dinâmicas por tipo**.
    -   Filtros por intervalo de datas e por múltiplos tipos de evento.
-   **Controle de Acesso por Permissões (RBAC)**:
    -   **Administrador**: Controlo total sobre a aplicação, incluindo gestão de utilizadores.
    -   **Utilizador**: Pode criar, editar e gerir recursos.
    -   **Visualizador**: Acesso apenas para leitura das informações.
-   **Menu de Configurações Avançadas**:
    -   Permite a configuração de parâmetros globais da aplicação, como a URL do ícone.
    -   Integração com provedores OAuth2 para autenticação externa, incluindo URL do provedor, Client ID, Client Secret, escopos e mapeamento de atributos de utilizador.
    -   Personalização do texto do botão de login para OAuth2.

## Arquitetura e Tecnologias

A aplicação segue uma arquitetura de microserviços moderna e desacoplada, orquestrada com Docker Compose.

| Camada          | Tecnologia              | Descrição                                                                                          |
| :-------------- | :---------------------- | :------------------------------------------------------------------------------------------------- |
| **Frontend** | **React 19** | Construído com componentes funcionais e Hooks para uma UI reativa e moderna.                       |
|                 | **ReactFlow 11** | Utilizado para a renderização e interatividade do mapa de serviços.                                |
|                 | **Tailwind CSS** | Framework CSS "utility-first" para uma estilização rápida e responsiva.                            |
|                 | **Nginx 1.29** | Servidor web de alta performance que serve a aplicação React e atua como proxy reverso para a API. |
| **Backend** | **Python 3.13** | Linguagem principal para a lógica de negócio da API.                                               |
|                 | **FastAPI** | Framework web moderno e de alta performance para a construção da API RESTful.                      |
|                 | **Pydantic** | Utilizado para validação de dados, serialização e geração automática da documentação da API.       |
|                 | **Uvicorn** | Servidor ASGI (Asynchronous Server Gateway Interface) que executa a aplicação FastAPI.             |
|                 | **Redis** | Utilizado para cache e rate limiting no backend.                                                   |
| **Base de Dados**| **MongoDB** | Banco de dados NoSQL, ideal para a estrutura flexível e hierárquica dos recursos.                  |
|                 | **Motor** | Driver assíncrono oficial para interagir com o MongoDB a partir do FastAPI.                        |
| **Containerização** | **Docker & Docker Compose** | A aplicação inteira (frontend, backend, base de dados) é executada em contêineres isolados. |
| **Ambiente de Build** | **Node.js 24** | Utilizado para construir a aplicação React para produção. |
| **Testes** | **Pytest**, **Jest** | Frameworks para execução de testes unitários do backend e frontend, respetivamente. |

## Segurança

Este projeto incorpora diversas medidas de segurança para proteger a aplicação e os dados.

-   **Rate Limiting (Backend)**: Implementado no endpoint de autenticação (`/api/token`) para mitigar ataques de força bruta.
-   **CORS Policy Refinada (Backend)**: As políticas de Cross-Origin Resource Sharing (CORS) foram ajustadas para permitir apenas métodos e cabeçalhos necessários, reduzindo a superfície de ataque.
-   **Security Headers (Backend)**: O backend envia cabeçalhos de segurança HTTP (e.g., `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`) para proteger contra ataques comuns como XSS e clickjacking.
-   **Content Security Policy (Frontend)**: Uma CSP foi adicionada ao frontend para mitigar ataques de Cross-Site Scripting (XSS) e controlar os recursos que o navegador pode carregar.
-   **Hardening de Dockerfiles**: Os Dockerfiles do backend e frontend foram configurados para rodar os processos como utilizadores não-root, minimizando o impacto de potenciais vulnerabilidades.
-   **Logging de Segurança**: Tentativas de login falhas são registadas para monitorização e auditoria.

## Como Executar o Projeto

Siga os passos abaixo para configurar e executar a aplicação no seu ambiente local.

### Pré-requisitos

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (geralmente incluído no Docker Desktop)

### Configuração do Ambiente

1.  **Clone este repositório**:
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```

2.  **Crie o arquivo de ambiente para o backend**:
    -   Navegue até a pasta `backend/`.
    -   Renomeie ou copie o ficheiro `.env.example` para `.env`.

3.  **Edite o ficheiro `.env` com todas as variáveis necessárias**:

    ```env
    # Detalhes de Conexão com o MongoDB
    # IMPORTANTE: Use 'mongo' como host, que é o nome do serviço no docker-compose.yml.
    MONGO_DETAILS=mongodb://mongo:27017
    
    # Nome do Banco de Dados
    DATABASE_NAME=service_catalog
    
    # Configurações de Segurança para Tokens JWT
    # Use uma chave longa e aleatória para produção.
    SECRET_KEY=sua_chave_secreta_super_segura_aqui
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    
    # Senha do Utilizador 'root'
    # IMPORTANTE: Gere um hash bcrypt para a sua senha e cole o hash aqui.
    # Exemplo de hash: $2b$12$EixZa4X4O2E2wMkxDqYyLOlF1yHw7i2pGkRkG.DqD7RzJ.E2h3i3S
    ROOT_USER_PASSWORD=seu_hash_bcrypt_aqui

    # URL de Conexão com o Redis (para Rate Limiting)
    # IMPORTANTE: Use 'redis' como host, que é o nome do serviço no docker-compose.yml.
    REDIS_URL=redis://redis:6379
    ```

    -   **Como gerar o hash**: Pode usar uma ferramenta online (como o [Bcrypt Generator](https://bcrypt-generator.com/)) ou executar o seguinte comando Python no seu terminal (requer `pip install "passlib[bcrypt]"`):
        ```bash
        python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('sua_senha_segura_aqui'))"
        ```
        -   Copie o resultado e cole-o no ficheiro `.env`.

### Iniciando a Aplicação

Com o Docker em execução, abra um terminal na raiz do projeto e execute:

```bash
docker-compose up --build
```

-   O comando `--build` força a reconstrução das imagens Docker na primeira execução ou após alterações nos `Dockerfiles` ou `requirements.txt`.
-   Aguarde até que todos os serviços (`mongo`, `redis`, `backend`, `frontend`) estejam de pé.

**Acessos:**

-   **Aplicação Frontend**: `http://localhost:3000`
-   **Documentação da API (Swagger)**: `http://localhost:8000/docs`

**Credenciais Padrão:**

-   **Utilizador**: `root`
-   **Senha**: A senha que você usou para gerar o hash na etapa de configuração.

Para parar todos os contêineres, pressione `Ctrl + C` no terminal e depois execute:
```bash
docker-compose down
```

## Executando os Testes

Este projeto inclui suítes de testes unitários tanto para o backend quanto para o frontend.

### Testes do Backend

A suíte de testes do backend utiliza `pytest` e uma base de dados em memória (`mongomock`).

**Para executar a suíte de testes do backend:**

```bash
docker-compose up backend-tests
```

### Testes do Frontend

A suíte de testes do frontend utiliza `Jest` e `React Testing Library`, com as chamadas à API sendo simuladas (mockadas).

**Para executar a suíte de testes do frontend:**

```bash
docker-compose up frontend-tests
```

## Documentação da API

A documentação completa e interativa da API está disponível em `http://localhost:8000/docs`. Abaixo está um resumo dos principais endpoints.

### Autenticação

| Método | Endpoint        | Descrição                                                  |
| :----- | :-------------- | :--------------------------------------------------------- |
| `POST` | `/api/token`    | Autentica um utilizador e retorna um token de acesso JWT.  |
| `GET`  | `/api/users/me` | Retorna os dados do utilizador atualmente autenticado.     |

### Recursos (Resources)

| Método | Endpoint                          | Descrição                                                  |
| :----- | :-------------------------------- | :--------------------------------------------------------- |
| `GET`  | `/api/resources`                  | Lista todos os recursos, com filtros e relações (pais/filhos). |
| `POST` | `/api/resources`                  | Cria um novo recurso, validando se o nome é único.         |
| `POST` | `/api/resources/import`           | Importa recursos a partir de um ficheiro JSON.             |
| `DELETE`| `/api/resources`                 | Exclui múltiplos recursos com base numa lista de IDs.      |
| `GET`  | `/api/resources/{id}`             | Obtém os detalhes de um recurso específico.                |
| `PUT`  | `/api/resources/{id}`             | Atualiza um recurso existente, validando se o nome é único.  |
| `DELETE`| `/api/resources/{id}`            | Exclui um único recurso.                                   |
| `POST` | `/api/resources/{id}/clone`       | Clona um recurso existente.                                |
| `GET`  | `/api/resources/{id}/timeline`    | Obtém a timeline de eventos de um recurso.                 |
| `POST` | `/api/resources/{id}/events`      | Adiciona um novo evento a um recurso pelo seu ID.          |
| `POST` | `/api/resources/by-name/{name}/events`| Adiciona um evento a um recurso pelo seu nome.  |
| `GET`  | `/api/resources/map`              | Obtém os dados formatados para o mapa de serviços.         |
| `GET`  | `/api/meta/config`                | Obtém dados de configuração para o frontend.               |
| `PUT`  | `/api/meta/config`                | Atualiza a configuração da aplicação (requer admin).       |


### Utilizadores (Users)

*Todas as rotas de utilizadores requerem permissão de **administrador**.*

| Método | Endpoint           | Descrição                                        |
| :----- | :----------------- | :----------------------------------------------- |
| `GET`  | `/api/users`       | Lista todos os utilizadores.                     |
| `POST` | `/api/users`       | Cria um novo utilizador.                         |
| `GET`  | `/api/users/{id}`  | Obtém os detalhes de um utilizador específico.   |
| `PUT`  | `/api/users/{id}`  | Atualiza um utilizador existente.                |
| `DELETE`| `/api/users/{id}` | Exclui um utilizador.                            |

## Licença

Este projeto está licenciado sob a Licença MIT.