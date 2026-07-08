# InkVerse Implementation Plan

**Goal Description**: Build InkVerse, a social home for poets, novelists, storytellers, and dreamers. The platform focuses on prioritizing meaningful writing, constructive feedback, and literary culture over endless scrolling algorithms.

> [!NOTE]
> **Vision:** "Every thought deserves a page. Every writer deserves a community." InkVerse is a digital world where people write instead of scroll.

## User Review Required

> [!IMPORTANT]
> - **Tech Stack Validation**: The proposed tech stack separates frontend (Next.js) and backend (NestJS). Would you prefer a unified full-stack approach using Next.js App Router for both frontend and backend to simplify the Phase 1 MVP, or stick to the strict separation with NestJS?
> - **Database Setup**: We will need a PostgreSQL instance (e.g., Supabase or Neon). Please confirm if you have an existing database provider in mind or if we should set one up during the project initialization.
> - **Authentication**: We plan to use Auth.js. Which OAuth providers (e.g., Google, GitHub) should we prioritize for the MVP?

## Open Questions

> [!WARNING]
> - **Design System**: Do you have any specific color palettes or typography choices in mind that reflect the "InkVerse" brand (e.g., Moonlight theme)?
> - **Hosting**: Vercel for Frontend and Railway for Backend is proposed. Is this the definitive choice?
> - **MVP Scope**: Should we prioritize any specific "Types of Posts" (e.g., just Thoughts and Poetry) for Phase 1 to accelerate the initial launch?

## Proposed Architecture and Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) + React + TypeScript
- **Styling & UI**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (Global) + TanStack Query (Server State)

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth)
- **Search & Real-time**: Meilisearch (Search), Socket.IO (Real-time), Firebase Cloud Messaging (Notifications)
- **Storage**: Supabase Storage

## MVP Roadmap & Implementation Steps

### Phase 1: Core Foundation (MVP 1.0) - *Current Focus*
1. **Project Initialization**
   - Setup Next.js 15 frontend repository with Tailwind & shadcn/ui.
   - Setup NestJS backend repository.
   - Initialize PostgreSQL database with Prisma schema (Users, Posts, Likes, Comments).
2. **Authentication & User Profiles**
   - Implement Auth.js for user signup/login.
   - Create basic User Profile pages (Bio, Avatar, Follower counts).
3. **Core Feed & Posting**
   - Implement "Create Text Post" functionality (Thoughts, Short Poetry).
   - Build the Main Home Feed with the "Moonlight" aesthetic.
4. **Basic Social Features**
   - Likes, Comments, and Bookmarks.
   - Basic Follow system.
   - Initial search functionality.

### Phase 2: Rich Content & Reading Experience
1. **Advanced Formatting**
   - Support for rich text, poetry formatting, and multi-chapter stories/novels.
2. **Reader Mode**
   - Implement distraction-free Reader Mode (Large fonts, Paper/Dark themes, Estimated reading time).
3. **Communities**
   - Launch genre-specific communities (e.g., Fantasy Kingdom, Poetry Club).
4. **Notifications**
   - Implement in-app notifications for interactions and new content from followed writers.

### Phase 3: AI & Gamification
1. **AI Writing Assistant**
   - Integrate OpenAI API for grammar, word choices, rhyming, and prompts.
2. **Engagement Features**
   - Daily writing challenges and Monthly Contests.
   - "Emotion Galaxy" categorization.
   - "Ink Trails" (signature reaction feature).
3. **Analytics & Achievements**
   - Writer analytics dashboard.
   - Gamification badges and levels (Beginner to Legend).

### Phase 4: Expansion & Monetization
1. **Audio & Real-time**
   - Voice Reading (Audio uploads).
   - Collaborative writing via Socket.IO.
2. **Creator Economy**
   - Subscriptions, tips, and premium memberships.
3. **Mobile & Ecosystem**
   - React Native / Expo mobile apps.
   - Public APIs.

## Verification Plan

### Automated Tests
- `npm run test` / `npm run test:e2e` for NestJS backend routes.
- Jest/React Testing Library for critical frontend components (Feed, Posting, Auth).

### Manual Verification
- Deploy to Vercel (Frontend) and Railway (Backend) staging environments.
- Perform UI/UX walkthroughs to ensure the "Moonlight" aesthetic and responsive design are perfectly implemented.
- End-to-end testing of user flows: Sign up -> Create Post -> Like/Comment -> View Profile.
