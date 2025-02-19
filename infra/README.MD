# Infraestrutura do Projeto

Esta pasta contém todos os arquivos e configurações necessários para configurar e orquestrar a infraestrutura do projeto **Plataforma de Agendamento de Serviços**.

## Estrutura da Pasta
```
/infra
├── docker/                # Configurações relacionadas ao Docker
│   ├── docker-compose.yml # Orquestração dos serviços
│   ├── Dockerfile.backend # Configuração da imagem Docker do backend
│   ├── Dockerfile.frontend # Configuração da imagem Docker do frontend
├── aws/                   # Configurações para deploy na AWS
│   ├── amplify/           # Configurações para o AWS Amplify (Frontend)
│   ├── ecs/               # Configurações para rodar o backend no AWS ECS
│   ├── rds/               # Configurações do banco de dados no AWS RDS
├── scripts/               # Scripts auxiliares para automação
│   ├── build.sh           # Script para build local
│   ├── deploy.sh          # Script para deploy
└── README.md              # Documentação da pasta infra
```

---

## Configuração do Docker

### `docker-compose.yml`
Este arquivo orquestra os serviços necessários para o projeto:
- **Backend**: API Python usando FastAPI
- **Frontend**: Interface em Next.js.
- **PostgreSQL**: Banco de dados relacional.
- **MongoDB**: Banco de dados não relacional para logs e notificações.

### Comandos Básicos
- **Iniciar os serviços:**
  ```bash
  docker-compose up -d
  ```
- **Parar os serviços:**
  ```bash
  docker-compose down
  ```
- **Recriar os serviços:**
  ```bash
  docker-compose up --build -d
  ```

---

## AWS

### `amplify/`
Configurações para deploy do frontend utilizando o AWS Amplify.

### `ecs/`
Arquivos necessários para rodar o backend no **AWS ECS (Elastic Container Service)**.
- **`task-definition.json`**: Definições das tasks do ECS.
- **`cluster-config.json`**: Configurações do cluster ECS.

### `rds/`
Parâmetros de configuração para o banco de dados relacional (PostgreSQL) no **AWS RDS**.

---

## Scripts Auxiliares

### `build.sh`
Script para fazer build localmente:
```bash
#!/bin/bash
docker-compose down
docker-compose build
docker-compose up -d
```

### `deploy.sh`
Script para deploy em produção:
```bash
#!/bin/bash
echo "Iniciando o deploy..."
docker-compose down
docker-compose up -d
```

---

## Notas Adicionais
- Certifique-se de configurar as variáveis de ambiente no **docker-compose.yml** antes de rodar os serviços.
- Verifique a documentação individual em cada subpasta para detalhes específicos de cada serviço.

---

Para dúvidas ou suporte, consulte a documentação principal do projeto. 🚀
