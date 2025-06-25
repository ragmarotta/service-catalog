# --- ESTÁGIO 1: Build (Construção) ---
# O objetivo deste estágio é compilar o código React para produção.
# Usamos uma imagem oficial do Node.js como base, que contém todas as ferramentas (npm) necessárias.
FROM node:16-alpine as build

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia apenas o package.json primeiro. O Docker armazena em cache esta camada.
# Se este arquivo não mudar, o Docker reutilizará o cache da instalação das dependências,
# tornando os builds futuros muito mais rápidos.
COPY package.json ./

# Instala todas as dependências do projeto definidas no package.json.
RUN npm install

# Copia todos os outros arquivos do projeto (código-fonte, pasta public, etc.) para o contêiner.
# Este passo acontece depois do 'npm install' para otimizar o cache.
COPY . .

# Argumento de build que pode ser passado pelo docker-compose.yml.
# Não foi utilizado neste projeto, mas é útil para injetar configurações no momento do build.
ARG REACT_APP_API_URL=/api

# Executa o script de build do React. Este comando compila o código JSX,
# otimiza os arquivos (CSS, JS) e cria uma pasta 'build' com os arquivos estáticos prontos para produção.
RUN npm run build

# --- ESTÁGIO 2: Production (Produção) ---
# O objetivo deste estágio é servir os arquivos estáticos gerados no estágio anterior.
# Usamos uma imagem oficial e super leve do Nginx, um servidor web de alta performance.
FROM nginx:1.21-alpine

# Remove o arquivo de configuração padrão do Nginx para usarmos o nosso.
RUN rm /etc/nginx/conf.d/default.conf

# Copia o nosso arquivo de configuração personalizado (nginx.conf) para a pasta de configuração do Nginx no contêiner.
COPY nginx.conf /etc/nginx/conf.d

# Copia a pasta 'build' (que contém os arquivos estáticos otimizados do React) do estágio 'build' anterior
# para a pasta raiz do Nginx, de onde os arquivos serão servidos.
COPY --from=build /app/build /usr/share/nginx/html

# Informa ao Docker que o contêiner irá escutar na porta 80.
EXPOSE 80

# Comando final para iniciar o servidor Nginx em "primeiro plano" (foreground).
# O Docker precisa que o processo principal não termine, e 'daemon off;' garante isso.
CMD ["nginx", "-g", "daemon off;"]