# 1. Imagem Base: Começa a partir de uma imagem oficial do Python, versão 3.13,
#    na variante 'slim', que é uma versão leve e otimizada.
FROM python:3.13-slim

# 2. Diretório de Trabalho: Define o diretório padrão dentro do contêiner como /app.
#    Todos os comandos subsequentes (COPY, RUN, CMD) serão executados a partir deste diretório.
WORKDIR /app

# 3. Copiar Dependências: Copia o arquivo requirements.txt da sua máquina local para
#    o diretório de trabalho (/app) dentro do contêiner.
COPY requirements.txt .

# 4. Instalar Dependências: Executa o 'pip' dentro do contêiner para instalar todas as
#    bibliotecas listadas no requirements.txt. O '--no-cache-dir' evita
#    armazenar o cache do pip, mantendo a imagem menor.
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiar Código da Aplicação: Copia a subpasta 'app' (que contém o código Python)
#    da sua máquina local para a subpasta 'app' dentro do contêiner (/app/app).
COPY ./app /app/app

# 6. Expor a Porta: Informa ao Docker que o contêiner irá escutar na porta 8000.
#    Isso não publica a porta, apenas a documenta. O mapeamento real é feito no docker-compose.yml.
EXPOSE 8000

# O comando para iniciar a aplicação (CMD) não é necessário aqui,
# pois ele é fornecido dinamicamente pelo docker-compose.yml, o que oferece mais flexibilidade.
