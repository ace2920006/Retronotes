# Retro Notes Implementation Plan

**Goal Description**: Build Retro Notes, a modern note-taking application styled as a retro terminal complete with CRT filters, dual-pane Markdown editing, and Gemini AI companion.

> [!NOTE]
> **Vision:** "Every thought deserves a page." Retro Notes combines retro aesthetic computing with modern cloud technology.

## User Review Required

> [!IMPORTANT]
> - **Tech Stack Validation**: The tech stack separates frontend (Next.js 16) and backend (NestJS 11).
> - **Database Setup**: MongoDB Atlas cluster storing Users, Notes, Comments, Reactions, Tags, and Folders.
> - **Authentication**: NextAuth with Passport JWT credentials.

## Open Questions

> [!WARNING]
> - **Design System**: 5 retro display monitor themes (Amber, Green, Win95, Cyberpunk, Carbon).
> - **Database**: MongoDB Atlas database connection string in `server/.env`.

## Proposed Architecture and Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling & UI**: Tailwind CSS v4 + CRT CSS resets

### Backend
- **Framework**: NestJS 11
- **Database**: MongoDB Atlas
- **ORM**: Prisma v7
- **Authentication**: Passport JWT + NextAuth

## MVP Roadmap & Implementation Steps

### Phase 1: Core Foundation (MVP 1.0) - *Current Focus*
1. **Project Initialization**
   - Setup Next.js 16 frontend repository with Tailwind & CRT theme engine.
   - Setup NestJS backend repository.
   - Initialize MongoDB Atlas database with Prisma schema (Users, Notes, Reactions, Comments).
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
