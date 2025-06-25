<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Explorador Interativo: Catálogo de Serviços</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Chart.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Placeholders para o processo de geração -->
    <!-- Chosen Palette: Slate & Sky Blue -->
    <!-- Application Structure Plan: A dashboard-style single-page application designed for comprehension. It's structured into three main sections: 1. **Visão Geral:** Presents the high-level architecture and core entities. 2. **Explorador de Funcionalidades:** An interactive tabbed view to detail each key page of the source application with mockups and functionality descriptions. 3. **Modelo de Dados & API:** A detailed breakdown of data structures and an interactive list of API endpoints. This structure guides the user from a macro (architecture) to a micro (API endpoint) level, facilitating a comprehensive understanding of the system's design and capabilities. -->
    <!-- Visualization & Content Choices:
        - Architecture Diagram: Goal: Inform. Method: HTML/Tailwind diagram. Interaction: None. Justification: Provides a clear, immediate understanding of the tech stack.
        - Core Entities: Goal: Organize. Method: Interactive cards. Interaction: Click to reveal details. Justification: Introduces key concepts in a digestible format.
        - Feature Explorer: Goal: Inform & Organize. Method: Tabbed interface with HTML/CSS wireframes. Interaction: Tab switching. Justification: Deconstructs the application's UI/UX logically without overwhelming the user.
        - API Endpoints: Goal: Detail & Compare. Method: Interactive collapsible list + Chart.js bar chart for method distribution. Interaction: Click to expand details. Justification: Offers both granular endpoint data and a high-level summary of the API's nature.
        - Data Models: Goal: Inform. Method: Structured HTML tables. Interaction: None. Justification: Clearly presents the data schema for key entities.
    -->
    <!-- CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc; /* slate-50 */
            color: #334155; /* slate-700 */
        }
        .active-tab {
            border-color: #0ea5e9; /* sky-500 */
            color: #0ea5e9;
            background-color: #f0f9ff; /* sky-50 */
        }
        .content-section {
            display: none;
        }
        .content-section.active {
            display: block;
        }
        .chart-container {
            position: relative;
            height: 300px;
            width: 100%;
            max-width: 500px;
            margin: auto;
        }
        .api-endpoint {
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .api-endpoint-details {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.5s ease-in-out, padding 0.5s ease-in-out;
        }
        .api-endpoint.open .api-endpoint-details {
            max-height: 500px;
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .api-endpoint.open svg {
            transform: rotate(180deg);
        }
    </style>
</head>
<body class="antialiased">

    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <!-- Header -->
        <header class="text-center mb-12">
            <h1 class="text-4xl font-bold text-slate-800">Explorador Interativo</h1>
            <p class="mt-2 text-xl text-sky-600">Catálogo de Serviços</p>
            <p class="mt-4 max-w-3xl mx-auto text-lg text-slate-600">Uma análise aprofundada da arquitetura, funcionalidades e fluxos de dados da aplicação de catálogo de serviços. Interaja com os elementos abaixo para explorar o sistema.</p>
        </header>

        <!-- Navegação Principal -->
        <nav class="flex justify-center border-b border-slate-200 mb-12">
            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center">
                <li class="mr-2">
                    <button class="main-nav-link inline-block p-4 border-b-2 rounded-t-lg active-tab" data-target="overview">Visão Geral</button>
                </li>
                <li class="mr-2">
                    <button class="main-nav-link inline-block p-4 border-b-2 rounded-t-lg" data-target="features">Explorador de Funcionalidades</button>
                </li>
                <li>
                    <button class="main-nav-link inline-block p-4 border-b-2 rounded-t-lg" data-target="api">Modelo de Dados & API</button>
                </li>
            </ul>
        </nav>

        <main>
            <!-- Secção: Visão Geral -->
            <section id="overview" class="content-section active">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <!-- Diagrama de Arquitetura -->
                    <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                        <h3 class="text-xl font-semibold text-slate-800 mb-4">Diagrama de Arquitetura</h3>
                        <p class="text-slate-600 mb-6">A aplicação é conteinerizada com Docker, garantindo portabilidade e consistência entre ambientes. A estrutura separa claramente as responsabilidades.</p>
                        <div class="space-y-4">
                            <!-- Frontend -->
                            <div class="bg-sky-50 p-4 rounded-lg border border-sky-200">
                                <p class="font-bold text-sky-800">Frontend (Cliente)</p>
                                <p class="text-sm text-sky-700">React servido por Nginx</p>
                            </div>
                            <div class="flex justify-center">
                                <span class="text-2xl text-slate-400">↓</span>
                                <span class="ml-4 self-center text-slate-500 font-medium">Requisição HTTP (/api)</span>
                            </div>
                            <!-- Backend -->
                            <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                <p class="font-bold text-indigo-800">Backend (Servidor)</p>
                                <p class="text-sm text-indigo-700">API em Python com FastAPI</p>
                            </div>
                            <div class="flex justify-center">
                                <span class="text-2xl text-slate-400">↓</span>
                                <span class="ml-4 self-center text-slate-500 font-medium">Operações CRUD</span>
                            </div>
                            <!-- Database -->
                            <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                <p class="font-bold text-emerald-800">Base de Dados</p>
                                <p class="text-sm text-emerald-700">MongoDB (Não Relacional)</p>
                            </div>
                        </div>
                    </div>
                    <!-- Entidades Principais -->
                    <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                        <h3 class="text-xl font-semibold text-slate-800 mb-4">Entidades Principais</h3>
                        <p class="text-slate-600 mb-6">O sistema gira em torno de três conceitos fundamentais. Clique para saber mais.</p>
                        <div class="space-y-4">
                            <details class="group bg-slate-50 p-4 rounded-lg cursor-pointer">
                                <summary class="font-semibold text-slate-700 group-hover:text-sky-600">Recurso</summary>
                                <p class="mt-2 text-slate-600">A entidade central. Representa qualquer serviço no catálogo (ex: aplicação, servidor, base de dados). Possui nome, descrição, tags, um histórico de eventos e pode se relacionar com outros recursos, formando uma árvore de dependências.</p>
                            </details>
                            <details class="group bg-slate-50 p-4 rounded-lg cursor-pointer">
                                <summary class="font-semibold text-slate-700 group-hover:text-sky-600">Utilizador</summary>
                                <p class="mt-2 text-slate-600">Controla o acesso à aplicação. Cada utilizador possui uma permissão (role) que define as suas capacidades: Administrador (controlo total), Utilizador (pode gerir recursos) ou Visualizador (apenas leitura).</p>
                            </details>
                            <details class="group bg-slate-50 p-4 rounded-lg cursor-pointer">
                                <summary class="font-semibold text-slate-700 group-hover:text-sky-600">Evento</summary>
                                <p class="mt-2 text-slate-600">Um registo de uma ocorrência num determinado momento para um recurso específico. Exemplos incluem DEPLOY, BUILD, RESTART. Forma o ciclo de vida e a timeline de cada serviço.</p>
                            </details>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Secção: Explorador de Funcionalidades -->
            <section id="features" class="content-section">
                 <h2 class="text-2xl font-bold text-center text-slate-800 mb-8">Análise das Páginas Principais</h2>
                 <div class="flex flex-col md:flex-row gap-8">
                    <!-- Menu de Navegação das Funcionalidades -->
                    <div class="w-full md:w-1/4">
                        <ul class="space-y-2">
                           <li><button class="feature-nav-link w-full text-left p-3 rounded-lg font-medium bg-white shadow-sm border border-slate-200 hover:bg-sky-50 hover:text-sky-600" data-target="feature-map">🗺️ Mapa de Serviços</button></li>
                           <li><button class="feature-nav-link w-full text-left p-3 rounded-lg font-medium bg-white shadow-sm border border-slate-200 hover:bg-sky-50 hover:text-sky-600" data-target="feature-list">📋 Lista de Recursos</button></li>
                           <li><button class="feature-nav-link w-full text-left p-3 rounded-lg font-medium bg-white shadow-sm border border-slate-200 hover:bg-sky-50 hover:text-sky-600" data-target="feature-crud">📝 Gestão de Recursos</button></li>
                           <li><button class="feature-nav-link w-full text-left p-3 rounded-lg font-medium bg-white shadow-sm border border-slate-200 hover:bg-sky-50 hover:text-sky-600" data-target="feature-timeline">⏳ Timeline de Eventos</button></li>
                           <li><button class="feature-nav-link w-full text-left p-3 rounded-lg font-medium bg-white shadow-sm border border-slate-200 hover:bg-sky-50 hover:text-sky-600" data-target="feature-users">👥 Gestão de Utilizadores</button></li>
                        </ul>
                    </div>
                    <!-- Conteúdo das Funcionalidades -->
                    <div class="w-full md:w-3/4 bg-white p-6 rounded-xl shadow-md border border-slate-100">
                        <div id="feature-content-area">
                            <!-- Conteúdo será injetado aqui pelo JavaScript -->
                        </div>
                    </div>
                 </div>
            </section>

            <!-- Secção: Modelo de Dados & API -->
            <section id="api" class="content-section">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 mb-4">Modelo de Dados dos Recursos</h2>
                        <p class="text-slate-600 mb-6">A estrutura de dados para a entidade `Recurso` é flexível, desenhada para capturar os detalhes essenciais e as suas relações.</p>
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                            <pre class="text-sm text-slate-700 bg-slate-50 p-4 rounded-md overflow-x-auto"><code>{
  "id": "string (ObjectID)",
  "name": "string",
  "description": "string (optional)",
  "tags": [
    { "key": "string", "value": "string" }
  ],
  "related_resources": [
    "string (ObjectID)"
  ],
  "events": [
    {
      "type": "string",
      "timestamp": "datetime",
      "message": "string (optional)"
    }
  ]
}</code></pre>
                        </div>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 mb-4">Endpoints da API de Recursos</h2>
                        <p class="text-slate-600 mb-6">A API RESTful fornece uma interface clara para interagir com os recursos. Clique num endpoint para ver os detalhes. As permissões são aplicadas por role.</p>
                        <div id="api-list" class="space-y-2">
                             <!-- Endpoints da API serão injetados aqui -->
                        </div>
                    </div>
                </div>
                <div class="mt-12">
                     <h2 class="text-2xl font-bold text-center text-slate-800 mb-4">Distribuição de Métodos da API</h2>
                     <div class="chart-container bg-white p-4 rounded-xl shadow-md border border-slate-100">
                         <canvas id="apiChart"></canvas>
                     </div>
                </div>
            </section>
        </main>

    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {

            // Dados para as funcionalidades
            const featureData = {
                'feature-map': {
                    title: '🗺️ Mapa de Serviços',
                    description: 'Esta é a principal ferramenta de visualização. Ela renderiza um diagrama interativo que mostra todos os recursos e as suas relações de dependência. É crucial para entender o impacto de uma falha ou alteração.',
                    functionality: [
                        'Visualização de dependências (pais) e impactados (filhos).',
                        'Destaque de caminhos críticos com um clique.',
                        'Menu de contexto para isolar e analisar árvores de dependência.',
                        'Filtros por nome e tags para reduzir a complexidade visual.',
                        'Exportação do diagrama para a linguagem DOT (Graphviz).'
                    ],
                    tech: ['React', 'ReactFlow', 'Dagre', 'Axios']
                },
                'feature-list': {
                    title: '📋 Lista de Recursos',
                    description: 'Fornece uma visão tabular de todos os recursos cadastrados. É a interface principal para o gerenciamento em massa e para encontrar rapidamente um serviço específico.',
                    functionality: [
                        'Listagem paginada de todos os recursos.',
                        'Filtros por nome e por múltiplos pares de chave/valor de tags.',
                        'Exibição de nomes de pais e filhos para contexto rápido.',
                        'Ações diretas na linha: Editar, Clonar e Excluir.',
                        'Acesso rápido para criar um novo recurso.'
                    ],
                    tech: ['React', 'React Router', 'Axios', 'Tailwind CSS']
                },
                'feature-crud': {
                    title: '📝 Gestão de Recursos (Criar/Editar)',
                    description: 'O formulário de gestão é o coração da entrada de dados. Ele permite criar novos recursos ou modificar existentes com um alto nível de detalhe.',
                    functionality: [
                        'Campos para nome e descrição.',
                        'Interface dinâmica para adicionar/remover tags chave/valor.',
                        'Autocomplete para chaves de tags já existentes.',
                        'Seletor de múltiplos recursos para definir as relações de dependência (filhos).',
                        'Modo de criação e edição na mesma interface.'
                    ],
                    tech: ['React', 'React Router', 'Axios']
                },
                'feature-timeline': {
                    title: '⏳ Timeline de Eventos',
                    description: 'Uma ferramenta de auditoria e diagnóstico que exibe o histórico completo de eventos para um recurso selecionado. Essencial para investigar incidentes e entender o ciclo de vida de um serviço.',
                    functionality: [
                        'Seleção de um recurso específico a partir de uma lista.',
                        'Filtros por intervalo de datas (início e fim).',
                        'Visualização cronológica dos eventos (DEPLOY, BUILD, RESTART, etc.).',
                        'Exibição de detalhes de cada evento, como a mensagem opcional.'
                    ],
                    tech: ['React', 'Axios']
                },
                'feature-users': {
                    title: '👥 Gestão de Utilizadores',
                    description: 'Área restrita para administradores, onde é possível gerir as contas e permissões de acesso à aplicação.',
                    functionality: [
                        'Listagem de todos os utilizadores.',
                        'Criação de novos utilizadores com definição de nome, email, senha e permissão.',
                        'Edição dos dados e permissões de utilizadores existentes.',
                        'Exclusão de utilizadores (exceto o utilizador "root").',
                        'Controlo de acesso baseado em roles (administrador, usuario, visualizador).'
                    ],
                    tech: ['React', 'Axios', 'Headless UI (Modal)']
                }
            };

            const apiEndpoints = [
                { method: 'POST', path: '/resources', description: 'Cria um novo recurso.', roles: ['administrador', 'usuario'] },
                { method: 'GET', path: '/resources', description: 'Obtém a lista de todos os recursos, com filtros e relações processadas.', roles: ['administrador', 'usuario', 'visualizador'] },
                { method: 'GET', path: '/resources/map', description: 'Obtém os dados formatados para o mapa de serviços (nós e arestas).', roles: ['administrador', 'usuario', 'visualizador'] },
                { method: 'GET', path: '/resources/{id}', description: 'Obtém os detalhes de um único recurso.', roles: ['administrador', 'usuario', 'visualizador'] },
                { method: 'PUT', path: '/resources/{id}', description: 'Atualiza um recurso existente.', roles: ['administrador', 'usuario'] },
                { method: 'DELETE', path: '/resources/{id}', description: 'Exclui um recurso.', roles: ['administrador'] },
                { method: 'POST', path: '/resources/{id}/clone', description: 'Cria uma cópia de um recurso existente.', roles: ['administrador', 'usuario'] },
                { method: 'POST', path: '/resources/{id}/events', description: 'Adiciona um novo evento à timeline de um recurso.', roles: ['administrador', 'usuario'] },
                { method: 'GET', path: '/resources/{id}/timeline', description: 'Obtém o histórico de eventos de um recurso, com filtros de data.', roles: ['administrador', 'usuario', 'visualizador'] },
                { method: 'GET', path: '/meta/config', description: 'Obtém configurações da aplicação, como tipos de eventos e chaves de tags existentes.', roles: ['administrador', 'usuario', 'visualizador'] }
            ];

            // Navegação principal
            const mainNavLinks = document.querySelectorAll('.main-nav-link');
            const contentSections = document.querySelectorAll('.content-section');
            mainNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const target = link.dataset.target;

                    mainNavLinks.forEach(navLink => navLink.classList.remove('active-tab'));
                    link.classList.add('active-tab');

                    contentSections.forEach(section => {
                        if (section.id === target) {
                            section.classList.add('active');
                        } else {
                            section.classList.remove('active');
                        }
                    });
                });
            });

            // Navegação das funcionalidades
            const featureNavLinks = document.querySelectorAll('.feature-nav-link');
            const featureContentArea = document.getElementById('feature-content-area');

            function updateFeatureContent(target) {
                 const data = featureData[target];
                 if (data) {
                    featureContentArea.innerHTML = `
                        <h3 class="text-2xl font-bold text-slate-800 mb-2">${data.title}</h3>
                        <p class="text-slate-600 mb-6">${data.description}</p>
                        <h4 class="font-semibold text-slate-700 mb-2">Funcionalidades Chave:</h4>
                        <ul class="list-disc list-inside space-y-2 mb-6 text-slate-600">
                            ${data.functionality.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                        <div class="flex items-center space-x-2">
                             <h4 class="font-semibold text-slate-700">Tecnologias:</h4>
                             <div class="flex flex-wrap gap-2">
                                ${data.tech.map(t => `<span class="bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full">${t}</span>`).join('')}
                             </div>
                        </div>
                    `;
                 }
            }

            featureNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const target = link.dataset.target;
                    featureNavLinks.forEach(navLink => navLink.classList.remove('bg-sky-50', 'text-sky-600'));
                    link.classList.add('bg-sky-50', 'text-sky-600');
                    updateFeatureContent(target);
                });
            });

            // Inicializar o conteúdo da primeira funcionalidade
            if (featureNavLinks.length > 0) {
                featureNavLinks[0].classList.add('bg-sky-50', 'text-sky-600');
                updateFeatureContent(featureNavLinks[0].dataset.target);
            }

            // Injetar API Endpoints
            const apiList = document.getElementById('api-list');
            const methodColors = { GET: 'bg-sky-100 text-sky-800', POST: 'bg-emerald-100 text-emerald-800', PUT: 'bg-amber-100 text-amber-800', DELETE: 'bg-red-100 text-red-800' };

            apiEndpoints.forEach(endpoint => {
                const endpointEl = document.createElement('div');
                endpointEl.className = 'api-endpoint bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden';
                endpointEl.innerHTML = `
                    <div class="flex justify-between items-center p-4">
                        <div class="flex items-center">
                            <span class="font-mono text-sm font-semibold w-16 text-center py-1 rounded ${methodColors[endpoint.method]}">${endpoint.method}</span>
                            <span class="ml-4 font-mono text-slate-700">${endpoint.path}</span>
                        </div>
                        <svg class="w-5 h-5 text-slate-400 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                    </div>
                    <div class="api-endpoint-details bg-slate-50 px-4">
                        <p class="text-slate-600">${endpoint.description}</p>
                        <div class="mt-2">
                            <span class="font-medium text-slate-700 text-sm">Permissões:</span>
                            <div class="flex flex-wrap gap-2 mt-1">
                               ${endpoint.roles.map(role => `<span class="bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full">${role}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
                apiList.appendChild(endpointEl);
            });
            
            apiList.addEventListener('click', (e) => {
                const header = e.target.closest('.api-endpoint');
                if (header) {
                    header.classList.toggle('open');
                }
            });


            // Gráfico de API
            const ctx = document.getElementById('apiChart').getContext('2d');
            const methodCounts = apiEndpoints.reduce((acc, ep) => {
                acc[ep.method] = (acc[ep.method] || 0) + 1;
                return acc;
            }, {});
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(methodCounts),
                    datasets: [{
                        label: 'Nº de Endpoints',
                        data: Object.values(methodCounts),
                        backgroundColor: [
                            'rgba(56, 189, 248, 0.6)', // sky
                            'rgba(16, 185, 129, 0.6)', // emerald
                            'rgba(245, 158, 11, 0.6)', // amber
                            'rgba(239, 68, 68, 0.6)'   // red
                        ],
                        borderColor: [
                            'rgb(14, 165, 233)',
                            'rgb(5, 150, 105)',
                            'rgb(217, 119, 6)',
                            'rgb(220, 38, 38)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        });
    </script>
</body>
</html>
