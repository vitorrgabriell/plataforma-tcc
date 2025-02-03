#!/bin/bash
echo "Deploy para produção iniciado..."
docker-compose down
docker-compose up -d
