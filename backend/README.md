# Backend

API REST do ERP Project.

## Tecnologias

| Tecnologia     | Versão | Uso                |
| -------------- | ------ | ------------------ |
| Node.js        | 18+    | Runtime            |
| TypeScript     | 5.9    | Linguagem          |
| Express        | 5      | Framework HTTP     |
| Prisma         | 5      | ORM                |
| PostgreSQL     | 15     | Banco de dados     |
| Docker         | —      | Container do banco |
| JSON Web Token | 9      | Autenticação       |
| bcryptjs       | 3      | Hash de senhas     |

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
JWT_SECRET="seu_segredo_aqui_minimo_32_caracteres"
JWT_EXPIRES_IN="7d"
PORT=3000
```

## Comandos

| Comando                   | Descrição                                                  |
| ------------------------- | ---------------------------------------------------------- |
| `npm run dev`             | Sobe o banco via Docker e inicia o servidor com hot-reload |
| `npm run build`           | Compila TypeScript para `dist/`                            |
| `npm run start`           | Executa as migrations e inicia o servidor compilado        |
| `npm run prisma:migrate`  | Cria e aplica uma nova migration                           |
| `npm run prisma:generate` | Gera o Prisma Client                                       |
| `npm run prisma:studio`   | Abre o Prisma Studio (interface visual do banco)           |
| `npm run seed`            | Popula o banco com dados iniciais                          |

## Estrutura

```
src/
├── config/         # Configurações (auth, etc.)
├── middlewares/    # Middlewares Express (auth)
├── modules/        # Módulos da aplicação
│   ├── auth/       # Registro, login, verificação de token
│   ├── users/      # Perfil e gerenciamento de usuários
│   ├── products/   # Produtos e controle de estoque
│   ├── categories/ # Categorias de produtos
│   ├── customers/  # Clientes
│   └── sales/      # Vendas
└── utils/          # Utilitários (prisma client, etc.)
```

## Banco de Dados

O banco sobe automaticamente via Docker ao rodar `npm run dev`. Para subir manualmente:

```bash
docker compose up -d
```
