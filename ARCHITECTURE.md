# 🖊️ InkVerse — Architecture Guide

> A social media platform for poets and writers.  
> **Backend:** NestJS + Prisma + PostgreSQL  
> **Frontend:** Next.js 15 (App Router) + NextAuth + Tailwind CSS

---

## System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                          │
└─────────────────────────────┬──────────────────────────────────┘
                              │ HTTP / HTTPS
              ┌───────────────▼───────────────┐
              │   Next.js Frontend (port 3001) │
              │   - App Router (RSC + Client)  │
              │   - NextAuth session/cookies   │
              │   - Tailwind CSS               │
              └───────────────┬───────────────┘
                              │ REST API calls
                              │ (Authorization: Bearer <JWT>)
              ┌───────────────▼───────────────┐
              │   NestJS Backend (port 3000)   │
              │   - Controllers + Services     │
              │   - JWT Guard                  │
              │   - Prisma ORM                 │
              └───────────────┬───────────────┘
                              │ SQL queries
              ┌───────────────▼───────────────┐
              │        PostgreSQL Database     │
              │   Users, Posts, Comments, Likes│
              └────────────────────────────────┘
```

---

## Data Model

```
User
 ├── id (uuid)
 ├── name, email, bio, image
 ├── emailVerified, createdAt, updatedAt
 ├── posts[]     → Post
 ├── comments[]  → Comment
 └── likes[]     → Like

Post
 ├── id (uuid)
 ├── title?, content, type (Poetry | Haiku | Story | Thought)
 ├── createdAt, updatedAt
 ├── authorId    → User
 ├── comments[]  → Comment (cascade delete)
 └── likes[]     → Like (cascade delete)

Comment
 ├── id, content, createdAt, updatedAt
 ├── postId      → Post (cascade delete)
 └── authorId    → User

Like
 ├── id, createdAt
 ├── postId      → Post (cascade delete)
 ├── userId      → User
 └── [unique: postId + userId]   ← prevents duplicate likes
```

---

## Backend Modules (Planned)

```
AppModule
 ├── AuthModule       — register, login, JWT strategy
 ├── UsersModule      — profile read/update
 ├── PostsModule      — feed, CRUD, type filter
 ├── CommentsModule   — per-post CRUD
 └── LikesModule      — toggle like/unlike
```

Each module follows the NestJS pattern:
```
module.ts → controller.ts → service.ts → (prisma.service.ts)
```

Guards (e.g., `JwtAuthGuard`) are applied at controller level to protect mutations.

---

## Frontend Page Architecture

```
layout.tsx              ← Providers, Navbar, session context
│
├── page.tsx            ← Public landing feed  (Server Component)
├── login/page.tsx      ← Login form           (Server Actions → NextAuth)
├── profile/[id]/page.tsx  ← User profile      (Server Component, fetches API)
├── feed/page.tsx       ← Auth-gated feed      (protected, infinite scroll)
├── write/page.tsx      ← Post editor          (Client Component, form submit)
├── post/[id]/page.tsx  ← Full post + comments (Server Component)
└── explore/page.tsx    ← Discovery            (Server Component)
```

### Component Hierarchy (Planned)
```
Navbar
 ├── UserAvatar
 └── WriteButton

PostCard
 ├── UserAvatar
 ├── PostContent (font-serif rendering)
 └── PostActions (Like | Comment | Save | Listen)

CommentSection
 ├── CommentList
 └── CommentForm
```

---

## Auth Flow

```
1. User submits login form (email + password)
2. Next.js Server Action calls NextAuth signIn("credentials", ...)
3. authorize() in src/auth.ts POSTs to NestJS POST /auth/login
4. NestJS validates credentials, returns { id, name, email, token }
5. NextAuth stores session, sets cookie
6. Subsequent API calls include Authorization: Bearer <token> header
```

---

## Post Types

InkVerse supports four content types, stored in `Post.type`:

| Type     | Description                            |
|----------|----------------------------------------|
| `Poetry` | Multi-stanza poems                     |
| `Haiku`  | 3-line haiku (5-7-5 syllables)         |
| `Story`  | Short prose / flash fiction            |
| `Thought`| Single-line thoughts / aphorisms       |

---

## Development Ports

| Service       | Port |
|--------------|------|
| NestJS API    | 3000 |
| Next.js App   | 3001 |
| PostgreSQL    | 5432 |
