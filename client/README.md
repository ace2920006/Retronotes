# 🖊️ InkVerse — Frontend

> **InkVerse** is a poet & writer social media platform. Share your haikus, poems, stories, and midnight thoughts. Follow the voices that move you. *Where Stories Meet Souls.*

---

## 🏗️ Tech Stack

| Layer         | Technology                                  |
|--------------|----------------------------------------------|
| Framework     | [Next.js](https://nextjs.org/) 15 (App Router) |
| Language      | TypeScript                                   |
| Styling       | Tailwind CSS                                 |
| Auth          | [NextAuth.js](https://next-auth.js.org/) v5  |
| API Client    | Fetch (to NestJS backend at port 3000)       |
| Font          | Geist (Vercel)                               |

---

## 📁 Project Structure

```
inkverse-frontend/
│
├── public/
│   └── (static assets — logo, og-image, fonts)
│
├── src/
│   ├── auth.ts                    # NextAuth config — providers, session, callbacks
│   │
│   └── app/                       # Next.js App Router root
│       ├── layout.tsx             # Root layout — sets <html>, fonts, global styles
│       ├── globals.css            # Global Tailwind + CSS resets
│       ├── page.tsx               # "/" — Landing / public feed page
│       │
│       ├── login/
│       │   └── page.tsx           # "/login" — Login form (email + password)
│       │
│       ├── profile/
│       │   └── [id]/
│       │       └── page.tsx       # "/profile/:id" — User profile + their works
│       │
│       ├── feed/                  # [TODO] "/feed" — Authenticated home feed
│       │   └── page.tsx
│       │
│       ├── write/                 # [TODO] "/write" — Create a new poem/story
│       │   └── page.tsx
│       │
│       ├── post/                  # [TODO] "/post/:id" — Single post detail page
│       │   └── [id]/
│       │       └── page.tsx
│       │
│       ├── explore/               # [TODO] "/explore" — Discover writers & tags
│       │   └── page.tsx
│       │
│       └── api/                   # Next.js API routes (server-side)
│           └── auth/
│               └── [...nextauth]/ # NextAuth route handler
│                   └── route.ts
│
├── components/                    # [TODO] Shared UI components
│   ├── PostCard.tsx               # Poem/story card with like, comment, save
│   ├── UserAvatar.tsx             # Avatar with fallback emoji
│   ├── Navbar.tsx                 # Top navigation bar
│   ├── WriteButton.tsx            # Floating action button to create post
│   └── CommentSection.tsx         # Comments list + reply form
│
├── lib/                           # [TODO] Utilities and API client
│   ├── api.ts                     # Typed fetch wrapper for NestJS backend
│   └── utils.ts                   # Date formatting, slugs, etc.
│
├── hooks/                         # [TODO] Custom React hooks
│   ├── usePosts.ts                # Fetch and paginate posts
│   └── useProfile.ts              # Fetch user profile
│
├── types/                         # [TODO] Shared TypeScript types
│   └── index.ts                   # User, Post, Comment, Like interfaces
│
├── next.config.ts                 # Next.js config (image domains, redirects)
├── postcss.config.mjs             # PostCSS (Tailwind)
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## 🗺️ Pages & Purpose

| Route            | Status    | Purpose                                              |
|------------------|-----------|------------------------------------------------------|
| `/`              | ✅ Built  | Public landing — hero + sample poem card             |
| `/login`         | ✅ Built  | Login form (credentials → NextAuth)                  |
| `/profile/:id`   | ✅ Built  | User profile: bio, follower count, recent works      |
| `/feed`          | 🔧 TODO   | Auth-gated home feed — latest posts from followed users |
| `/write`         | 🔧 TODO   | Rich text editor to create poem/story/thought        |
| `/post/:id`      | 🔧 TODO   | Full post view with comment thread                   |
| `/explore`       | 🔧 TODO   | Browse trending poems, writers, and tags             |

---

## 🔐 Authentication

- Uses **NextAuth v5** with the **Credentials** provider
- Currently stubbed to accept `test@example.com` / `password`
- **Next step:** Connect the `authorize` callback in `src/auth.ts` to the NestJS backend `POST /auth/login` endpoint

```ts
// src/auth.ts — wire up to real backend
async authorize(credentials) {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' }
  })
  const user = await res.json()
  if (res.ok && user) return user
  return null
}
```

---

## ⚙️ Environment Variables

Create a `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-random-secret-here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Run dev server (runs on port 3001 to not clash with backend)
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

> **Tip:** Run the backend first (`npm run start:dev` in `inkverse-backend`), then start the frontend.

---

## 🗺️ Roadmap

- [ ] Implement `/feed` page with paginated posts from API
- [ ] Build `/write` page — poem/story editor with type selector (Haiku, Poetry, Story, Thought)
- [ ] Build `/post/:id` — full post + comments + like button (wired to API)
- [ ] Build `/explore` — trending posts & featured writers
- [ ] Connect auth to real backend JWT
- [ ] Add follow/unfollow on profile page
- [ ] Add bookmark functionality
- [ ] Dark/light mode toggle
- [ ] Text-to-speech "Listen" feature for poems
- [ ] Mobile-responsive layout polish
