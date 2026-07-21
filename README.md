# RetroNotes

A modern note-taking application with a retro-inspired UI.

![RetroNotes OS Screenshot](https://raw.githubusercontent.com/prisma/prisma/main/packages/client/images/prisma-logo.png) *(Note: Add your custom screenshots/GIFs here)*

## Features

- **📝 Rich Note Editing**: Dual-pane editor allowing raw Markdown input on the left and live-rendered HTML output on the right. Supports headings, bold/italics, lists, checkboxes, inline code, and syntax highlighted blocks.
- **🎨 Phosphor CRT Themes**: 5 customizable vintage terminal themes (Amber CRT, Green CRT, Classic Windows 95 grey panels, Cyberpunk neon, and Slate carbon dark) accompanied by active screen scanner glass curves, phosphor flickers, and scanlines.
- **🏷️ Categories & Tags**: Create directories/folders (e.g. Work, College, Personal) with custom labels and accent tag colors. Tag notes inline using standard tags (e.g., #ideas, #coding) to filter note lists instantly.
- **📌 Pinned & Favorite Notes**: Keep critical notes pinned to the top of your deck or marked as favorites for instant access.
- **📦 Archive & Trash**: Archive completed notes to remove them from your active workspace, or send deleted items to the Trash Can with empty/restore capability.
- **🔍 Semantic Search**: Search notes instantly by title or content. Prepended search queries with `?` triggers a natural language semantic search powered by the Gemini AI Engine.
- **⚡ Offline Sync (PWA Mode)**: Client-side local storage fallback caching allowing read, write, update, and search operations while offline, with seamless database sync once a connection is re-established.
- **⌨️ Keyboard Shortcut Registry**: Native hotkey listeners (e.g. `Ctrl+S` to save note, `Ctrl+N` for new note, `Ctrl+P` to toggle pin, `Esc` to exit drawers) complete with an on-screen helper panel.
- **📟 Gemini AI Assistant**: Slide-out terminal assistant providing AI-driven summaries, tag recommendations, grammar checking, title generation, and study flashcards generation from your notes.
- **📂 Export Formats**: Instant client-side download of note files as Markdown (`.md`), plain text (`.txt`), or print-friendly layouts for PDF archiving.

## Tech Stack

### Frontend Client
- **Framework**: Next.js 16.2 (Turbopack) & React 19
- **Aesthetics & Layout**: Tailwind CSS v4 & custom CRT glass scanner animations
- **Authentication**: NextAuth.js v5 (Next.js server-action verified credentials)

### Backend Server
- **Framework**: NestJS (TypeScript controllers & service architecture)
- **Database Engine**: MongoDB Atlas with Prisma ORM
- **AI Integrations**: Gemini API (Google AI)

## Installation

### Prerequisites
- Node.js (v20 or higher)
- NPM (v10 or higher)

### 1. Server Setup
Navigate to the `server/` directory and configure environment keys:
```bash
cd server
npm install
```
Create a `.env` file in the `server/` folder:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/retronotes?retryWrites=true&w=majority"
JWT_SECRET="your-jwt-auth-secret-key"
GEMINI_API_KEY="your-google-gemini-api-key"
```
Rebuild database client and seed notes:
```bash
npx prisma generate
npx prisma db seed
```
Run NestJS dev server:
```bash
npm run start:dev
```

### 2. Client Setup
Navigate to the `client/` directory and configure credentials:
```bash
cd ../client
npm install
```
Create a `.env.local` file in the `client/` folder:
```env
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-session-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```
Run Next.js client dev server:
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser. Log in with the preloaded credentials:
- **Email**: `test@example.com`
- **Password**: `password`

## Future Plans
- [ ] Collaborative real-time note-sharing rooms using Socket.IO.
- [ ] Audio note-readout engine converting Markdown text to lofi text-to-speech ambient voices.
- [ ] Global Relaxing Lofi Radio integration inside the top utility bar.
- [ ] Export directly to Google Drive / OneDrive modules.

## License
Licensed under the [MIT License](./LICENSE) - copyright 2026.
