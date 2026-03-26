# ERP Project

Sistema ERP completo com gestão de usuários, produtos, clientes, vendas e dashboard.

## Estrutura do Projeto

```
erp-project/
├── backend/   # API REST com Node.js + Express + Prisma
└── frontend/  # SPA com React + Vite + Tailwind
```

## Requisitos

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) (para o banco de dados)

## Iniciando o Projeto

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

> Sobe o container do PostgreSQL automaticamente via Docker e inicia o servidor em modo de desenvolvimento.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

> Acesse em `http://localhost:5173`

## Variáveis de Ambiente

Consulte os arquivos `.env` de cada pasta para configurar as variáveis necessárias.

- `backend/.env` — conexão com banco de dados, segredo JWT
- `frontend/.env` — URL da API (`VITE_API_URL`)
