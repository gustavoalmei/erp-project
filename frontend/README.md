# Frontend

Interface web do ERP Project.

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Biblioteca UI |
| TypeScript | 5.9 | Linguagem |
| Vite | 7 | Bundler e dev server |
| Tailwind CSS | 3 | Estilização |
| React Router | 7 | Roteamento |
| Axios | 1 | Requisições HTTP |
| Recharts | 2 | Gráficos |
| Radix UI | — | Componentes acessíveis |
| Lucide React | — | Ícones |
| React Toastify | 11 | Notificações |

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm run lint` | Executa o ESLint |

## Estrutura

```
src/
├── components/     # Componentes reutilizáveis
│   ├── layout/     # Sidebar, Header, etc.
│   └── ui/         # Componentes base (Button, Input, Card, etc.)
├── context/        # Contextos React (AuthContext)
├── pages/          # Páginas da aplicação
│   ├── auth/       # Login, Registro, Perfil
│   ├── dashboard/  # Dashboard principal
│   ├── users/      # Gerenciamento de usuários
│   ├── products/   # Produtos
│   ├── customers/  # Clientes
│   └── sales/      # Vendas
├── services/       # Serviços de API (axios)
└── types/          # Tipos TypeScript
```
