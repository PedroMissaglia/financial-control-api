<p align="center">
  Financial Control API
</p>

## Stack

NestJS + MongoDB Atlas + JWT (access 5 min / refresh 7 dias) + Docker.

## Setup

1. Copie `.env.example` para `.env` e preencha `MONGODB_URI` e `JWT_ACCESS_SECRET`.
2. No Atlas, libere o IP da máquina em Network Access.
3. Suba a API:

```bash
npm install
npm run start:dev
```

Ou com Docker:

```bash
docker compose up --build
```

API em `http://localhost:3001`. Seed automático do `data/db.json` se as collections estiverem vazias.

## Auth

- `POST /auth/login` `{ email, senha }`
- `POST /auth/refresh` `{ refreshToken }` a cada 5 minutos
- `POST /auth/logout` Bearer + `{ refreshToken? }`

Rotas protegidas: `Authorization: Bearer <accessToken>`.

Usuários de seed: `pedro.missaglia@gmail.com` / `123456` e `John@fincontrol.com` / `fincontrol`.

## Deploy na AWS

Guia do zero (conta AWS, Docker, ECR, App Runner, Atlas, Postman): [docs/DEPLOY-AWS.md](docs/DEPLOY-AWS.md).
