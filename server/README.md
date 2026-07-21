# 🖊️ Retro Notes — Backend API

> **Retro Notes** is a modern note-taking and document management backend platform with NestJS and Prisma ORM, backed by MongoDB Atlas.

---

## 🏗️ Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework    | [NestJS](https://nestjs.com/) v11    |
| Language     | TypeScript                           |
| ORM          | [Prisma](https://www.prisma.io/) v7  |
| Database     | MongoDB Atlas                        |
| Auth         | Passport JWT + NextAuth             |
| Linting      | ESLint + Prettier                    |
| Testing      | Jest + Supertest                     |

---

## 📁 Project Structure

```
retronotes-backend/
│
├── prisma/
│   └── schema.prisma          # Database models: User, Note, Comment, Reaction, Folder, Tag
│
├── src/
│   ├── main.ts                # NestJS entry point — starts HTTP server
│   ├── app.module.ts          # Root module — registers all feature modules
│   ├── app.controller.ts      # Root controller (health-check route)
│   ├── app.service.ts         # Root service
│   ├── prisma.service.ts      # Prisma client wrapper (injectable singleton)
│   │
│   ├── users/                 # User management module
│   ├── notes/                 # Notes & terminal document management
│   ├── comments/              # Threaded comments
│   ├── reactions/             # Post reactions
│   ├── tags/                  # Tagging & follow tags
│   └── auth/                  # JWT auth module
│
├── test/
│   ├── app.e2e-spec.ts        # End-to-end tests
│   └── jest-e2e.json
│
├── dist/                      # Compiled JS output (auto-generated)
├── .env                       # Environment variables
├── nest-cli.json              # NestJS CLI config
├── prisma.config.ts           # Prisma config overrides
├── tsconfig.json
└── package.json
```

---

## 🗄️ Database Models

```
User      — id (ObjectId), name, email, bio, image, streak, createdAt
Note      — id (ObjectId), title, content, summary, collection, userId
Comment   — id (ObjectId), content, noteId, authorId, parentId
Reaction  — id (ObjectId), type, noteId, userId
Tag       — id (ObjectId), name, userId, noteIds
Folder    — id (ObjectId), name, color, userId
```

---

## ⚙️ Environment Variables (`.env`)

```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/retronotes?retryWrites=true&w=majority"
JWT_SECRET="secret_retronotes_2026"
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
