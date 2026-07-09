# InkVerse — Monorepo

> **InkVerse** — A social media platform for poets, writers, and storytellers.
> *Where Stories Meet Souls.*

---

## Projects

| Project                   | Tech Stack             | Port |
|--------------------------|------------------------|------|
| [`inkverse-backend`](./inkverse-backend) | NestJS + Prisma + PostgreSQL | 3000 |
| [`inkverse-frontend`](./inkverse-frontend) | Next.js 15 + NextAuth + Tailwind | 3001 |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL running locally (or use Docker)
- npm

### 1. Backend
```bash
cd inkverse-backend
npm install
# Set DATABASE_URL in .env
npx prisma migrate dev --name init
npm run start:dev
```

### 2. Frontend
```bash
cd inkverse-frontend
npm install
# Set NEXTAUTH_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_API_URL in .env.local
npm run dev
```

---

## Documentation

- [Architecture Overview](./ARCHITECTURE.md) — System design, data models, module layout
- [Backend README](./inkverse-backend/README.md) — API endpoints, DB schema, dev setup
- [Frontend README](./inkverse-frontend/README.md) — Pages, auth flow, component plan

---

## VS Code Debug

Use the launch configs in [`.vscode/launch.json`](./.vscode/launch.json):
- **Debug Next.js (Frontend)** — attaches to the running Next.js dev server
- **Debug NestJS (Backend)** — starts backend in debug mode with auto-attach
