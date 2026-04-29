#!/bin/bash

if [ -z "$1" ]; then
  echo "Uso: ./logs.sh <nome_do_servico>"
  echo "Exemplo: ./logs.sh frontend"
  echo "Serviços comuns: frontend, backend, mongo, redis"
  exit 1
fi

SERVICE=$1

# Busca o ID do container que contenha o nome passado como argumento
# 'head -n 1' garante que, se houver mais de um resultado, pegamos apenas o primeiro.
CONTAINER_ID=$(docker ps -qf "name=$SERVICE" | head -n 1)

if [ -z "$CONTAINER_ID" ]; then
  echo "Erro: Nenhum container em execução encontrado contendo '$SERVICE' no nome."
  echo "Verifique se o serviço está rodando utilizando o comando 'docker ps'."
  exit 1
fi

# Descobre o nome real completo do container para mostrar na tela
CONTAINER_NAME=$(docker inspect --format="{{.Name}}" "$CONTAINER_ID" | sed 's/^\///')

echo "================================================================"
echo "Exibindo logs para o container: $CONTAINER_NAME (ID: $CONTAINER_ID)"
echo "Pressione [Ctrl+C] para sair da visualização."
echo "================================================================"
echo ""

# Chama o docker logs com o parâmetro -f (follow) para ver em tempo real
# e --tail 100 para não poluir a tela com logs muito antigos.
docker logs -f --tail 100 "$CONTAINER_ID"
