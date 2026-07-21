# 🖊️ Retro Notes — Architecture Guide

> A modern note-taking and writing platform with a retro UI.  
> **Backend:** NestJS + Prisma + MongoDB Atlas  
> **Frontend:** Next.js 16 (App Router) + NextAuth + Tailwind CSS

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
                              │ Mongo Connection
              ┌───────────────▼───────────────┐
              │     MongoDB Atlas Database     │
              │   Users, Notes, Comments, Tags │
              └────────────────────────────────┘
```

---

## Data Model

```
User
 ├── id (ObjectId)
 ├── name, email, bio, image
 ├── emailVerified, createdAt, updatedAt
 ├── notes[]     → Note
 ├── comments[]  → Comment
 └── reactions[] → Reaction

Note
 ├── id (ObjectId)
 ├── title, content, mood, summary, collection
 ├── createdAt, updatedAt
 ├── userId      → User
 ├── comments[]  → Comment (cascade delete)
 └── reactions[] → Reaction (cascade delete)

Comment
 ├── id, content, createdAt, updatedAt
 ├── noteId      → Note (cascade delete)
 └── authorId    → User

Reaction
 ├── id, type, createdAt
 ├── noteId      → Note (cascade delete)
 ├── userId      → User
 └── [unique: noteId + userId + type]
```

---

## Backend Modules

```
AppModule
 ├── AuthModule          — register, login, JWT strategy
 ├── UsersModule         — profile read/update
 ├── NotesModule         — notes CRUD & search
 ├── CommentsModule      — per-note CRUD
 ├── ReactionsModule     — toggle reaction
 ├── TagsModule          — note tagging & tag follow
 └── NotificationsModule — real-time activity alerts
```

Each module follows the NestJS pattern:
```
module.ts → controller.ts → service.ts → (prisma.service.ts)
```

Guards (e.g., `JwtAuthGuard`) are applied at controller level to protect mutations.

---

## Frontend Page Architecture

```
layout.tsx              ← Providers, CRT overlay, session context
│
├── page.tsx            ← RetroNotes OS Terminal / Notes Dashboard
├── login/page.tsx      ← Login form (Server Actions → NextAuth)
└── loading.tsx         ← Retro boot loader UI
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

## Content Collections

Retro Notes supports flexible note collections:

| Collection         | Description                               |
|--------------------|-------------------------------------------|
| `Personal Journal` | Daily logs, thoughts & reflections        |
| `Ideas`            | Brainstorming & project outlines          |
| `Architecture`     | Technical diagrams & docs                 |
| `Quotes`           | Excerpts & inspirating quotes             |
| `Articles`         | Drafts & long-form writing                |

---

## Development Ports

| Service       | Port |
|--------------|------|
| NestJS API    | 3000 |
| Next.js App   | 3001 |
| MongoDB Atlas | Cloud/27017 |

