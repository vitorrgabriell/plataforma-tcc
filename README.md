# AgendaVip - Plataforma de Agendamento de Serviços

Projeto de Trabalho de Conclusão de Curso (TCC) para o curso de Tecnologia em Análise e Desenvolvimento de Sistemas. O **AgendaVip** é uma plataforma web que permite o agendamento de serviços entre clientes e profissionais de diferentes estabelecimentos, com funcionalidades completas para gestão de agenda, fidelidade, pagamentos e histórico.

## Tecnologias Utilizadas

### Backend
- [Python 3.11.9](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/) (Amazon RDS)
- [DynamoDB](https://aws.amazon.com/dynamodb/) (serviços finalizados)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [Stripe API](https://stripe.com/) (pagamentos)
- [Amazon SES](https://aws.amazon.com/ses/) (envio de e-mails)

### Frontend
- [React.js](https://reactjs.org/)
- [Styled-Components](https://styled-components.com/)
- [React Router DOM](https://reactrouter.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [JWT Decode](https://github.com/auth0/jwt-decode)
- [Axios](https://axios-http.com/)
- [Jest](https://jestjs.io/) (testes unitários)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Infraestrutura
- [AWS EC2](https://aws.amazon.com/ec2/)
- [AWS S3 + CloudFront](https://aws.amazon.com/s3/)
- [AWS Route 53](https://aws.amazon.com/route53/)
- [AWS RDS](https://aws.amazon.com/rds/)

---

## Funcionalidades Principais

- Autenticação com JWT para três tipos de usuários: cliente, profissional e administrador.
- Painel do cliente com:
  - Agendamento de serviços
  - Histórico e avaliações
  - Gerenciamento de cartões
  - Resgate de fidelidade
- Painel do profissional com:
  - Visualização da agenda
  - Geração de horários
  - Finalização de serviços
  - Histórico de atendimentos
- Dashboard do administrador com:
  - Gestão de serviços, funcionários, fidelidade e agendamentos
  - Gráficos de faturamento e de distribuição de serviços
- Geração automática de horários com base em configurações semanais por profissional.
- Envio automático de e-mails:
  - Confirmação de agendamento
  - Lembrete (1 dia e 1 hora antes)
  - Recuperação de senha
- Integração com Stripe para cadastro de cartão e cobrança automática ao final do atendimento.

---

## Estrutura do Projeto

```
📁 backend
│   ├── app/
│   │   ├── models/              # Modelos SQLAlchemy
│   │   ├── routes/              # Rotas da API
│   │   ├── schemas/             # Schemas Pydantic
│   │   └── main.py              # Ponto de entrada da API
│
📁 frontend
│   ├── public/
│   └── src/
│       ├── components/          # Componentes visuais (modais, inputs, etc.)
│       ├── pages/               # Páginas por perfil (cliente, admin, profissional)
│       ├── utils/               # Funções auxiliares e helpers
│       └── App.js               # Componente principal
```

---

## Como Rodar o Projeto Localmente

### Requisitos
- Node.js e npm
- Python 3.11
- PostgreSQL local ou instância AWS RDS
- DynamoDB local ou AWS (pode usar DynamoDB Local)
- Conta de testes no Stripe

### Backend (FastAPI)

```bash
cd back-end
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

### Frontend (React)

```bash
cd front-end
npm install
npm start
```

---

## Documentação da API

A documentação automática está disponível em:

```
http://localhost:8080/docs
```

---

## Autores

**Gustavo Manfredi, Vitor Almeida e Enzo Rocco** 
TCC - UniEinstein

---

## Licença

Este projeto é parte de um trabalho acadêmico e não possui fins comerciais. Todos os direitos reservados ao autor.
