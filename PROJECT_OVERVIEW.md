# 📒 RetroNotes — Comprehensive Project Overview & Documentation

> **"Every thought deserves a page."**  
> RetroNotes is a feature-rich, high-performance note-taking web application combining 80s/90s CRT computing aesthetics with modern full-stack web technologies.

---

## 📌 Executive Summary

RetroNotes bridges nostalgia and productivity. Built with a **Next.js 16 (App Router)** frontend and a **NestJS 11** backend powered by **Prisma ORM** and **MongoDB Atlas**, it delivers a dual-pane Markdown writing experience, real-time audio feedback, AI assistance, and comprehensive backup/export capabilities.

---

## 🛠️ Full Technology Stack

### 🎨 Frontend (`/client`)
- **Framework**: Next.js 16 (React 19, App Router, TypeScript)
- **Styling**: Tailwind CSS v4 + Custom CRT Phosphor CSS Variables & Animation Keyframes
- **Authentication**: NextAuth.js v5 (Credentials Provider & Google OAuth)
- **Markdown & Syntax**: `react-markdown`, `remark-gfm`, `rehype-raw`
- **Audio Engine**: Web Audio API (Synthesized mechanical key clicks, floppy disk drive sounds, retro CRT toggle audio)

### ⚙️ Backend (`/server`)
- **Framework**: NestJS 11 (TypeScript, Modules, Controllers, Services)
- **Database & ORM**: Prisma ORM v7 connected to **MongoDB Atlas**
- **AI Integration**: Google Gemini API (`gemini-2.5-flash`) for AI Summaries, Note Generation, and Semantic Search
- **Authentication & Security**: Passport JWT strategy, bcrypt password hashing, and global validation pipes

---

## 📺 Retro Aesthetics & Display System

- ⚡ **BIOS Boot Sequence**: Authentic retro boot animation with system check & RAM test.
- 🔊 **Tactile Sound Synthesis**: Web Audio engine generating realistic mechanical key clicks, spacebar clacks, disk writes, and CRT toggle sound effects.
- 📺 **CRT Filter Effects**: Adjustable glass curvature, scanline density, phosphor flicker, and screen glare toggling.
- 🎨 **5 Custom CRT Phosphor Themes**:
  1. 🟢 **Green CRT**: Classic Matrix / IBM 5151 Green Terminal
  2. 🟠 **Amber CRT**: Vintage Amber Phosphor Display
  3. 🏛️ **Win95 Classic**: 90s System Desktop Palette
  4. 🔮 **Cyberpunk Neon**: Vibrant Synthwave Glow
  5. ⬛ **Carbon Dark**: Sleek Modern Dark Terminal

---

## 📝 Core Features & Functionality

### ✍️ Note Management & Editing
- **Dual-Pane Editor**: Live Markdown text editor on the left with instant rendered HTML preview on the right.
- **Auto-Save**: Debounced automatic background saving with visual status indicators.
- **Folder Directories**: Custom note categories and directories with color coding.
- **Tagging System**: Multi-tag assignment (`#ideas`, `#dev`, `#study`) with tag-based filtering.
- **Organization**: Pin notes to top deck, mark as favorites, clone/duplicate notes (`Ctrl+D`), and soft-delete to Trash.
- **One-Click Format Cleanup**: Strip trailing whitespace and extra blank lines (`Ctrl+Shift+F`).

### 🤖 Gemini AI Assistant ("Retro-Muse")
- **AI Note Generation**: Generate structured Markdown notes from concise prompts.
- **Auto-Summarization**: Summarize lengthy notes into bullet points or executive summaries.
- **Semantic Search**: Ask questions across your entire note library in natural language.
- **Floating Chatbox**: Integrated retro AI assistant panel accessible anywhere in the app.

### 📤 Import & Export Capabilities
- **Export Formats**: PDF, Markdown (`.md`), Plain Text (`.txt`), and JSON (`.json`).
- **Global Backup**: One-click JSON backup export (`retronotes_backup_YYYY-MM-DD.json`).
- **Import Tool**: Restore or import notes directly from `notes.json` files.

---

## 🔐 Environment Configuration

### 1. Server Environment (`server/.env`)
```env
# Server Port
PORT=3000

# Database Connection (MongoDB Atlas)
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/retronotes?retryWrites=true&w=majority"

# Authentication
JWT_SECRET="your_jwt_secret_key_here"

# Google Gemini AI API Key
GEMINI_API_KEY="your_gemini_api_key_here"
```
*(Reference: [server/.env.example](file:///d:/DEMO%20PROJECT/pp4m/retro/Retronotes/server/.env.example))*

### 2. Client Environment (`client/.env.local`)
```env
# Backend API Base URL
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your_nextauth_secret_key_here"
```
*(Reference: [client/.env.example](file:///d:/DEMO%20PROJECT/pp4m/retro/Retronotes/client/.env.example))*

---

## 📂 Project Architecture & Directory Structure

```
Retronotes/
├── client/                      # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/                 # App Router pages & NextAuth routes
│   │   ├── components/          # Dashboard, Chatbox, CRT Modals, Audio components
│   │   └── lib/                 # API client wrapper & Web Audio engine
│   ├── .env.example             # Client environment template
│   └── package.json
│
├── server/                      # NestJS 11 Backend
│   ├── prisma/                  # Prisma schema & seed script
│   ├── src/
│   │   ├── ai/                  # Gemini AI service
│   │   ├── auth/                # JWT Auth & Passport strategies
│   │   ├── notes/               # Notes CRUD & search
│   │   ├── folders/             # Folder directories service
│   │   ├── tags/                # Tags service
│   │   └── users/               # User profiles & stats
│   ├── .env.example             # Server environment template
│   └── package.json
│
├── ARCHITECTURE.md              # System Architecture Diagram & Data Models
├── CONTRIBUTING.md              # Contribution Guidelines
├── LICENSE                      # MIT License
├── PROJECT_OVERVIEW.md          # Full Project Documentation (This File)
└── README.md                    # Quickstart & Features Guide
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `v20.0.0+` & npm `v10.0.0+`
- MongoDB Atlas cluster URI
- Google Gemini API key

### 1. Backend Setup
```bash
cd server
npm install
# Configure server/.env based on server/.env.example
npx prisma generate
npm run start:dev
```
*Backend server starts at `http://localhost:3000`*

### 2. Frontend Setup
```bash
cd client
npm install
# Configure client/.env.local based on client/.env.example
npm run dev -- -p 3001
```
*Frontend app available at `http://localhost:3001`*

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + N` | **New Note** | Instant blank note creation |
| `Ctrl + S` | **Save Note** | Force immediate database sync |
| `Ctrl + F` / `Ctrl + K` | **Command Palette** | Global search and navigation |
| `Ctrl + Shift + F` | **Clean Formatting** | Format whitespace and blank lines |
| `Ctrl + D` | **Duplicate Note** | Create active note clone |
| `Ctrl + P` | **Pin Note** | Toggle top deck pinning |
| `Delete` | **Delete Note** | Move active note to Trash |
| `Esc` | **Close Drawers** | Dismiss open modals and drawers |

---

## 📄 License

This project is open-source software licensed under the **[MIT License](file:///d:/DEMO%20PROJECT/pp4m/retro/Retronotes/LICENSE)**.
