# InkVerse — Contributing Guide

## Code Style

- TypeScript everywhere (no `any`)
- ESLint + Prettier enforced — run `npm run lint` before committing
- Backend uses NestJS conventions: module / controller / service / DTO pattern
- Frontend uses Next.js App Router conventions (Server Components by default, `"use client"` only when needed)

## Commit Messages

Use the conventional commits format:

```
feat(posts): add like toggle endpoint
fix(auth): handle expired JWT gracefully
docs(readme): update API endpoint table
chore(deps): upgrade prisma to v7.9
```

## Branch Strategy

```
main          — stable, production-ready
dev           — integration branch
feat/<name>   — new features
fix/<name>    — bug fixes
```

## Adding a New Backend Module

```bash
# From inkverse-backend/
npx nest g module <name>
npx nest g controller <name>
npx nest g service <name>
```

Then register the module in `src/app.module.ts`.

## Adding a New Frontend Page

Create the file at `src/app/<route>/page.tsx`.  
- Prefer **Server Components** (no `"use client"`) for data-fetching pages.
- Use `"use client"` only for pages/components with interactive state (forms, like buttons).

## Pull Request Checklist

- [ ] Code lints without errors (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] New API endpoints are documented in `inkverse-backend/README.md`
- [ ] New pages/components are noted in `inkverse-frontend/README.md`
