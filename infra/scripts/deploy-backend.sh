#!/bin/bash

echo "parando o serviço atual"
sudo systemctl stop plataforma-backend.service

echo "atualizando repositorio do git"
cd /home/ubuntu/plataforma-tcc/back-end || exit 1
git pull origin main

echo "ativando env"
source venv/bin/activate

echo "instalando dependencias"
pip install -r requirements.txt

echo "subindo o backend atualizado"
sudo systemctl start plataforma-backend.service

echo "Deploy realizado com sucesso"
