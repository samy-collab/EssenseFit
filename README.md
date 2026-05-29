# Essence Fit

Sistema full stack para uma loja virtual de moda fitness feminina com:

- autenticação por JWT
- catálogo de produtos por estação do ano
- carrinho e pedidos
- área de `Check-in Fitness`
- sistema de pontos
- resgate de cupons
- permissões por perfil `ADMIN` e `CUSTOMER`

O projeto foi pensado para a marca `Essence Fit`, com a proposta de unir e-commerce, incentivo à disciplina e fidelização por recompensas.

## Descrição do sistema

A `Essence Fit` vende roupas fitness femininas voltadas para atividades como:

- academia
- corrida
- caminhada
- pilates
- dança
- ciclismo
- funcional

Além da loja online, o sistema libera uma área chamada `Check-in Fitness` após a primeira compra confirmada da cliente. Nessa área, a usuária registra atividades físicas, acumula pontos e pode trocar a pontuação por cupons de desconto.

## Tecnologias usadas

### Backend

- Go
- Gin
- GORM
- PostgreSQL
- JWT
- bcrypt

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

### Infra

- Docker
- Docker Compose

## Como rodar com Docker

### 1. Preparar variáveis

Na raiz do projeto:

```bash
cp .env.example .env
```

Se quiser, ajuste os valores do arquivo `.env`.

### 2. Subir os serviços

```bash
docker compose up --build
```

Serviços configurados:

- `postgres`
- `backend`
- `frontend`

Portas padrão:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- postgres: `localhost:5432`

### Observação sobre o frontend no Docker

O serviço `frontend` já está configurado no `docker-compose.yml`. Ele usa a pasta `./frontend` e sobe a aplicação React via Node.

## Como rodar o frontend separado

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

### 3. Gerar build

```bash
npm run build
```

Por padrão, o frontend espera a API em:

```bash
VITE_API_URL=http://localhost:8080
```

## Como rodar o backend separado

### 1. Preparar ambiente

```bash
cd backend
cp .env.example .env
```

### 2. Configurar o banco PostgreSQL

Suba um PostgreSQL localmente ou use o do Docker Compose.

### 3. Rodar a API

```bash
go run .
```

### 4. Compilar

```bash
go build ./...
```

## Variáveis de ambiente

### Raiz do projeto

Arquivo: [`.env.example`](/home/acer/Área%20de%20trabalho/EssenseFit/.env.example:1)

```env
POSTGRES_DB=essencefit
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

APP_ENV=development
BACKEND_PORT=8080
JWT_SECRET=change-me
DB_TIMEZONE=America/Sao_Paulo
DB_MAX_IDLE_CONNS=5
DB_MAX_OPEN_CONNS=20
DB_CONN_MAX_LIFETIME_MIN=30

FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:8080
REACT_APP_API_URL=http://localhost:8080
```

### Backend

Arquivo: [`backend/.env.example`](/home/acer/Área%20de%20trabalho/EssenseFit/backend/.env.example:1)

```env
APP_ENV=development
SERVER_PORT=8080
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:3000
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=essencefit
DB_SSLMODE=disable
DB_TIMEZONE=America/Sao_Paulo
DB_MAX_IDLE_CONNS=5
DB_MAX_OPEN_CONNS=20
DB_CONN_MAX_LIFETIME_MIN=30
```

## Endpoints principais

As rotas existem tanto em formato direto quanto sob `/api` em vários casos. Abaixo estão os endpoints principais do contrato atual.

### Autenticação

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Produtos

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

### Pedidos

- `POST /orders`
- `GET /orders/my`
- `GET /orders/:id`

### Check-in Fitness

- `POST /checkins`
- `GET /checkins/my`

### Pontos

- `GET /points/my`

### Cupons

- `POST /coupons`
- `GET /coupons`
- `POST /coupons/redeem`
- `GET /coupons/my`

### Rotas administrativas

- `GET /orders`
- `PATCH /orders/:id/status`
- `GET /checkins`

### Acesso administrativo de desenvolvimento

- E-mail: `admin@essencefit.com.br`
- Senha: `admin123`

## Regras de negócio

### Perfis

O sistema trabalha com duas roles:

- `ADMIN`
- `CUSTOMER`

### Permissões de ADMIN

Somente `ADMIN` pode:

- cadastrar produtos
- editar produtos
- remover produtos
- visualizar todos os pedidos
- alterar status de pedidos
- criar cupons
- visualizar check-ins de todas as clientes

### Permissões de CUSTOMER

`CUSTOMER` pode:

- visualizar produtos
- comprar
- visualizar seus próprios pedidos
- fazer check-in após primeira compra
- visualizar seus pontos
- resgatar cupons

### Produtos

Cada produto possui:

- nome
- descrição
- preço
- tamanho
- cor
- estoque
- estação
- imagem
- ativo

Estações aceitas:

- `inverno`
- `outono`
- `verão` no backend
- `verao` normalizado no frontend
- `primavera`

### Pedidos

- cliente autenticada pode criar pedido com produtos e quantidades
- o sistema calcula subtotal e total
- ao marcar pedido como `paid`, a usuária recebe a flag `has_first_purchase`
- essa flag libera o `Check-in Fitness`

### Check-in Fitness

- apenas usuárias autenticadas podem acessar
- só é permitido após `has_first_purchase = true`
- máximo de `1` check-in por dia por usuária
- cada check-in válido gera `10` pontos
- tipos aceitos:
  - `caminhada`
  - `corrida`
  - `academia`
  - `pilates`
  - `dança`
  - `ciclismo`
  - `funcional`
  - `outro`

### Pontos

O endpoint `GET /points/my` retorna:

- total de pontos
- quantidade de check-ins
- cupons disponíveis para resgate
- histórico de pontos

O histórico é salvo em `point_transactions`.

### Cupons

- admin pode criar cupons
- cliente resgata cupom usando pontos
- ao resgatar, os pontos são descontados
- o cupom possui validade
- o cupom da cliente possui status:
  - `unused`
  - `used`

Exemplos de regra de pontuação:

- `50` pontos = `5%`
- `100` pontos = `10%`
- `200` pontos = `20%`

## Estrutura de pastas

```text
EssenseFit/
├── backend/
│   ├── config/
│   │   ├── migrations/
│   │   ├── config.go
│   │   ├── database.go
│   │   └── migrator.go
│   ├── controllers/
│   │   └── handlers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── .env.example
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── styles.css
│   │   ├── types.ts
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .env.example
├── docker-compose.yml
└── README.md
```

## Frontend integrado com a API

O frontend já está integrado com o backend para:

- login
- cadastro
- persistência do token JWT
- leitura do perfil autenticado
- rotas protegidas
- listagem de produtos
- detalhe de produto
- criação de pedidos
- listagem dos próprios pedidos
- criação de check-in
- listagem dos próprios check-ins
- leitura de pontos
- listagem de cupons da usuária

## Observações atuais

- o frontend já consome a API principal, mas algumas telas administrativas ainda estão mais visuais do que operacionais
- o Docker Compose já sobe PostgreSQL, backend e frontend
- as migrations SQL são executadas automaticamente na inicialização do backend

## Próximos passos recomendados

- criar seeds iniciais de admin, produtos e cupons
- implementar uso de cupom em pedido
- expandir o painel admin com criação real de produtos e cupons pelo frontend
- adicionar testes automatizados no backend e frontend
