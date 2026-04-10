# Multi-Tenancy Design

**Data:** 2026-04-09  
**Branch:** feat/systemSettings  
**Status:** Aprovado

---

## Visão Geral

Adicionar suporte a múltiplas empresas (multi-tenancy) ao ERP. Um usuário pode pertencer a várias empresas com roles diferentes em cada uma. Após o login, o usuário seleciona em qual empresa deseja operar e recebe um token JWT com o contexto da empresa ativa.

---

## Banco de Dados

### Novos Models

#### `Company`
```prisma
model Company {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  users    UserCompany[]
  settings SystemSettings?
  products  Product[]
  categories Category[]
  customers  Customer[]
  sales      Sale[]
  activityLogs ActivityLog[]

  @@map("companies")
}
```

#### `UserCompany` (junção com role por empresa)
```prisma
model UserCompany {
  userId    Int  @map("user_id")
  companyId Int  @map("company_id")
  role      Role

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@id([userId, companyId])
  @@map("user_companies")
}
```

A restrição `@@id([userId, companyId])` garante que um usuário só pode ter um vínculo por empresa. O mesmo usuário pode aparecer em múltiplas linhas com empresas diferentes:

```
userId | companyId | role
-------|-----------|----------
1      | 1         | ADMIN      ← João na Empresa A
1      | 2         | OPERATOR   ← João na Empresa B
2      | 1         | MANAGER    ← Maria na Empresa A
```

### Models Alterados

| Model | Mudança |
|---|---|
| `User` | Remove o campo `role` (agora armazenado em `UserCompany`); adiciona `isSuperAdmin Boolean @default(false)` |
| `SystemSettings` | Troca singleton `id=1` por `companyId` (relação 1:1 com Company) |
| `Product` | Adiciona `companyId` |
| `Category` | Adiciona `companyId`; `name` deixa de ser `@unique` global |
| `Customer` | Adiciona `companyId`; `email` e `document` deixam de ser `@unique` global |
| `Sale` | Adiciona `companyId` |
| `ActivityLog` | Adiciona `companyId` |

> `StockMovement` não recebe `companyId` direto — é filtrado indiretamente via `Product.companyId`.

---

## Fluxo de Autenticação

### Passo 1 — Login
- Usuário envia email + senha para `POST /auth/login`
- Backend valida credenciais e emite **token JWT temporário** contendo apenas `{ userId }`
- Frontend salva o token e redireciona para `/companies`

### Passo 2 — Listagem de empresas
- Frontend chama `GET /companies/my` com o token temporário
- Backend retorna lista de empresas vinculadas ao usuário, com nome, logo e role em cada uma
- Se lista vazia: exibe mensagem informativa + formulário de edição de email/senha

### Passo 3 — Seleção de empresa
- Usuário clica em uma empresa
- Frontend chama `POST /auth/select-company` com `{ companyId }`
- Backend valida que o `userId` do token pertence àquela empresa
- Backend emite **token JWT definitivo** com `{ userId, companyId, role }`
- Frontend substitui o token temporário pelo definitivo e redireciona para `/dashboard`

### Passo 4 — Acesso ao sistema
- Todas as requisições usam o token definitivo
- Middleware extrai `companyId` e `role` do token e injeta em `req.user`
- Rotas protegidas que recebem token sem `companyId` retornam `403`

---

## Frontend

### Nova rota `/companies`
Tela intermediária acessível apenas com token temporário (tem `userId`, não tem `companyId`).

**Conteúdo:**
- Cards de empresas: nome + logo + role do usuário naquela empresa
- Estado vazio: mensagem explicando que um admin precisa vinculá-lo a uma empresa
- Seção de configurações pessoais: editar email e senha (sempre visível)

### Mudanças no `AuthContext`
- Adiciona estado `companyId` e `companyRole` extraídos do JWT após seleção
- Novo método `selectCompany(companyId)`: chama `POST /auth/select-company`, salva novo token, atualiza contexto
- Dois níveis de autenticação:
  - `isAuthenticated` — possui qualquer token válido
  - `hasCompany` — token contém `companyId`

### Roteamento (`App.tsx`)

| Guard | Condição | Destino se falhar |
|---|---|---|
| `PublicRoute` | sem token | redireciona para `/login` se autenticado |
| `CompanyRoute` | token sem `companyId` | redireciona para `/companies` |
| `PrivateRoute` | token com `companyId` | redireciona para `/companies` se sem empresa |

### Sidebar
- Exibe nome e logo da empresa ativa (via contexto)
- Adiciona opção "Trocar empresa": limpa `companyId` do contexto e redireciona para `/companies`

---

## Backend

### Middleware

```
authMiddleware → tenantMiddleware → controller
```

- **`authMiddleware`** (existente): valida o JWT e injeta `req.user.userId`
- **`tenantMiddleware`** (novo): verifica se `req.user.companyId` existe; retorna `403` se ausente. Injeta `companyId` e `role` em `req.user`

O `tenantMiddleware` é aplicado em todas as rotas do sistema (products, categories, sales, customers, etc.). Rotas públicas e `/companies/my` usam apenas `authMiddleware`.

### Superadmin global

O `User` possui um campo `isSuperAdmin Boolean @default(false)`. O primeiro superadmin é criado via seed do Prisma. Superadmins:
- Operam com o token temporário (sem `companyId`)
- Podem criar e deletar qualquer empresa
- Podem promover outros usuários a superadmin diretamente no banco ou via rota dedicada

Não existe tela de gerenciamento de superadmins — a promoção é feita administrativamente.

### Novo módulo `companies`

| Rota | Método | Permissão | Descrição |
|---|---|---|---|
| `GET /companies/my` | GET | token temporário | Lista empresas do usuário logado |
| `POST /companies` | POST | superadmin | Cria nova empresa |
| `PUT /companies/:id` | PUT | ADMIN ou MANAGER da empresa | Atualiza nome, logo e infos |
| `DELETE /companies/:id` | DELETE | superadmin | Deleta empresa |
| `GET /companies/:id/users` | GET | ADMIN ou MANAGER da empresa | Lista usuários da empresa |
| `POST /companies/:id/users` | POST | ADMIN da empresa | Vincula usuário à empresa com role |
| `DELETE /companies/:id/users/:userId` | DELETE | ADMIN da empresa | Remove vínculo de usuário |

### Novo endpoint em `auth`

| Rota | Método | Descrição |
|---|---|---|
| `POST /auth/select-company` | POST | Valida vínculo e emite JWT definitivo com `companyId` e `role` |

### Services existentes
Todos os services (`productService`, `categoryService`, `saleService`, `customerService`) passam a filtrar queries pelo `companyId` vindo de `req.user`:

```ts
// Exemplo: productService
getAll: (companyId: number) =>
  prisma.product.findMany({ where: { companyId } })
```

Nenhuma query deve executar sem o filtro de `companyId` — essa é a garantia de isolamento entre tenants.

---

## Permissões por Role

| Ação | Superadmin | ADMIN | MANAGER | SUPERVISOR | OPERATOR | VIEWER |
|---|---|---|---|---|---|---|
| Criar empresa | ✓ | | | | | |
| Deletar empresa | ✓ | | | | | |
| Editar nome/logo/infos | ✓ | ✓ | ✓ | | | |
| Vincular/remover usuário | | ✓ | | | | |
| Listar usuários da empresa | | ✓ | ✓ | | | |
| Trocar de empresa | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Tratamento de Erros

| Situação | Comportamento |
|---|---|
| Token sem `companyId` acessando rota protegida | Backend retorna `403`; frontend redireciona para `/companies` |
| `companyId` no token não pertence ao usuário | Backend retorna `403` |
| Usuário removido de uma empresa com token ativo | Próxima request retorna `403`; frontend redireciona para `/companies` |
| Lista de empresas vazia | Frontend exibe mensagem informativa na tela `/companies` |
