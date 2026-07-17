# 🖊️ InkVerse — Backend API

> **InkVerse** is a social media platform for poets, writers, and storytellers. Share haikus, poems, short stories, and thoughts. Follow your favourite voices. Discover words that move you.

---

## 🏗️ Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework    | [NestJS](https://nestjs.com/) v11    |
| Language     | TypeScript                           |
| ORM          | [Prisma](https://www.prisma.io/) v7  |
| Database     | PostgreSQL                           |
| Auth         | NextAuth (credentials, to be expanded) |
| Linting      | ESLint + Prettier                    |
| Testing      | Jest + Supertest                     |

---

## 📁 Project Structure

```
inkverse-backend/
│
├── prisma/
│   └── schema.prisma          # Database models: User, Post, Comment, Like
│
├── src/
│   ├── main.ts                # NestJS entry point — starts HTTP server
│   ├── app.module.ts          # Root module — registers all feature modules
│   ├── app.controller.ts      # Root controller (health-check route)
│   ├── app.service.ts         # Root service
│   ├── prisma.service.ts      # Prisma client wrapper (injectable singleton)
│   │
│   ├── users/                 # [TODO] User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts  # GET /users/:id, PATCH /users/:id
│   │   ├── users.service.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
│   ├── posts/                 # [TODO] Poems / Stories / Thoughts module
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts  # CRUD for posts, GET /feed
│   │   ├── posts.service.ts
│   │   └── dto/
│   │       ├── create-post.dto.ts
│   │       └── update-post.dto.ts
│   │
│   ├── comments/              # [TODO] Comments on posts
│   │   ├── comments.module.ts
│   │   ├── comments.controller.ts
│   │   └── comments.service.ts
│   │
│   ├── likes/                 # [TODO] Like/unlike a post
│   │   ├── likes.module.ts
│   │   ├── likes.controller.ts
│   │   └── likes.service.ts
│   │
│   └── auth/                  # [TODO] Auth module (JWT + guards)
│       ├── auth.module.ts
│       ├── auth.controller.ts   # POST /auth/login, /auth/register
│       ├── auth.service.ts
│       └── guards/
│           └── jwt-auth.guard.ts
│
├── generated/
│   └── prisma/                # Auto-generated Prisma client (do not edit)
│
├── test/
│   ├── app.e2e-spec.ts        # End-to-end tests
│   └── jest-e2e.json
│
├── dist/                      # Compiled JS output (auto-generated)
├── .env                       # Environment variables (see below)
├── nest-cli.json              # NestJS CLI config
├── prisma.config.ts           # Prisma config overrides
├── tsconfig.json
└── package.json
```

---

## 🗄️ Database Models

```
User      — id, name, email, bio, image, emailVerified, createdAt
Post      — id, title, content, type (Poetry/Haiku/Story/Thought), authorId
Comment   — id, content, postId, authorId
Like      — id, postId, userId  [unique: postId+userId]
```

**Relationships:**
- `User` → has many `Post`, `Comment`, `Like`
- `Post` → belongs to `User`, has many `Comment`, `Like`
- `Comment` / `Like` → cascade delete when `Post` is deleted

---

## ⚙️ Environment Variables (`.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/inkverse"
```

---

## 🚀 Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Setup the database
```bash
# Apply migrations and generate Prisma client
npx prisma migrate dev --name init

# Seed with sample data (optional)
npx prisma db seed
```

### 3. Run the server
```bash
# Development (watch mode)
npm run start:dev

# Debug mode (connects to VS Code debugger)
npm run start:debug

# Production
npm run start:prod
```

The API runs on **http://localhost:3000** by default.

---

## 🧪 Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e
```

---

## 📡 Planned API Endpoints

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/`                   | Health check                         |
| POST   | `/auth/register`      | Register a new user                  |
| POST   | `/auth/login`         | Login, returns JWT token             |
| GET    | `/feed`               | Public feed of all posts             |
| GET    | `/posts/:id`          | Get a single post                    |
| POST   | `/posts`              | Create a new poem/story/thought      |
| PATCH  | `/posts/:id`          | Edit your post                       |
| DELETE | `/posts/:id`          | Delete your post                     |
| GET    | `/users/:id`          | Get user profile + their posts       |
| PATCH  | `/users/:id`          | Update profile (bio, name, image)    |
| POST   | `/posts/:id/like`     | Like a post                          |
| DELETE | `/posts/:id/like`     | Unlike a post                        |
| GET    | `/posts/:id/comments` | Get comments on a post               |
| POST   | `/posts/:id/comments` | Add a comment                        |

---

## 🗺️ Roadmap

- [ ] `users` module — profile CRUD
- [ ] `posts` module — CRUD + feed endpoint
- [ ] `comments` module
- [ ] `likes` module
- [ ] `auth` module — JWT authentication
- [ ] Follow/Followers system
- [ ] Bookmarks
- [ ] Notifications
- [ ] Full-text search on posts
