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

API em `http://localhost:3001`. Seed do `data/db.json` só com `SEED_ON_BOOT=true` (ou `1`) e collections vazias. Sem a flag, a base permanece vazia após um wipe.

## Auth

- `POST /auth/login` `{ email, senha }`
- `POST /auth/refresh` `{ refreshToken }` a cada 5 minutos
- `POST /auth/logout` Bearer + `{ refreshToken? }`

Rotas protegidas: `Authorization: Bearer <accessToken>`.

Usuários de seed (opcionais, só com `SEED_ON_BOOT=true`): `pedro.missaglia@gmail.com` / `123456` e `John@fincontrol.com` / `fincontrol`.

## Conta conjunta

Contrato completo: [docs/CONTA_CONJUNTA.md](docs/CONTA_CONJUNTA.md).

O front (Fin Control) já consome estes endpoints e, enquanto a rota não existir, usa um mock local só para protótipo de UI.

- `GET /contas-conjuntas`
- `POST /contas-conjuntas/convites` `{ email }`
- `POST /contas-conjuntas/convites/:id/aceitar|recusar`
- `DELETE /contas-conjuntas/convites/:id`
- `DELETE /contas-conjuntas`

Listagens de transações, categorias e gastos aceitam `usuarioIds` (CSV) para a visão conjunta. O JWT pode operar o `usuarioId` do cônjuge quando a parceria está ativa. Perfil do cônjuge: **GET permitido**, **PUT bloqueado**.

### Checklist de validação (API)

1. Usuário A convida B por e-mail cadastrado → B aceita.
2. A lista `usuarioIds=A,B` e vê/edita transações de B.
3. B lê `GET /profiles/A` (meta/alerta); `PUT /profiles/A` retorna 403.
4. Encerrar parceria remove o acesso cruzado.
