# 📒 RetroNotes

![RetroNotes Banner](./retronotes_banner.png)

> **"Every thought deserves a page."** — RetroNotes combines nostalgic CRT computing aesthetics with state-of-the-art web technology.

A minimal, high-performance retro-themed note-taking web application featuring CRT monitor phosphor filters, dual-pane Markdown editing, offline synchronization, and an integrated Gemini AI assistant.

---

## 🎨 Retro UI & Aesthetics

- 📺 **CRT Scanline & Glass Effects**: Curated retro CRT screen filter with adjustable glass curvature, scanline density, and phosphor screen flickers.
- 🔤 **Vintage Pixel Typography**: Nostalgic monospace font pairing reminiscent of 90s terminal displays (VT100 & MS-DOS era).
- 🎨 **5 Phosphor Display Themes**: Switch between iconic display monitors:
  - 🟢 **Green CRT** (Classic Matrix / IBM Terminal)
  - 🟠 **Amber CRT** (Vintage Monochrome Phosphor)
  - 🏛️ **Win95 Classic** (90s System Desktop Palette)
  - 🔮 **Cyberpunk Neon** (Vibrant Synthetic Retro Glow)
  - ⬛ **Carbon Dark** (Sleek Dark Modern Terminal)
- 🔘 **Animated Tactile Controls**: Mechanical keyboard sound effects (key clicks, floppy disk saves, toggle beeps) with tactile 3D retro buttons and glowing hover states.
- ⚡ **Retro BIOS Boot Loader**: Nostalgic system startup screen with diagnostic checks and smooth CRT scan transitions.

---

## 📝 Core Note Features

Beyond standard note-taking, RetroNotes equips you with rich organizing tools:

- 📌 **Pin Notes**: Pin essential notes to the top of your workspace deck for immediate access.
- ⭐ **Favorite Notes**: Mark notes as favorites to build a curated personal collection.
- 🏷️ **Tags System**: Categorize notes using custom tags (`#ideas`, `#coding`, `#study`) to filter lists instantly.
- 📅 **Date Created & Last Edited**: Precise timestamp tracking displaying creation and modification history for every note.
- 📝 **Create Notes**: Dual-pane Markdown editor featuring raw text input on the left and live rendered HTML preview on the right.
- ✏️ **Edit Notes**: Debounced auto-saving, syntax highlighting, list formatting, and inline status indicator (`Draft` vs `Saved`).
- 🗑️ **Delete & Trash Can**: Soft-delete notes to a dedicated Trash Can with single-click restoration or permanent purge.
- 📁 **Folder Directories**: Organize notes into custom folders (e.g., Work, Personal, College) with custom color badges.
- 🔍 **Search & Gemini AI Search**: Search notes instantly by title/content, or query notes using natural language AI search (`?query`).
- 💾 **Local Storage & Offline Sync**: Full local storage fallback allowing offline reading, writing, and editing with seamless backend database sync.
- 📟 **Gemini AI Companion**: Drawer assistant offering note summarization, tag suggestions, title generation, grammar correction, and flashcards generation.
- 📂 **Export Options**: One-click export to Markdown (`.md`), plain text (`.txt`), or print-to-PDF format.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom CRT Glass Resets & CSS Variables
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (Credentials & Google OAuth2)
- **Markdown Processing**: `react-markdown`, `remark-gfm`, `rehype-raw`

### Backend (`/server`)
- **Framework**: [NestJS 11](https://nestjs.com/) (TypeScript Controllers, Modules & Services)
- **Database ORM**: [Prisma ORM v7](https://www.prisma.io/)
- **Database Engine**: [MongoDB Atlas](https://www.mongodb.com/atlas)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
- **Security**: Passport JWT authentication & bcrypt password hashing

---

## 📂 Folder Structure

```
Retronotes/
├── client/                     # Next.js 16 Frontend Application
│   ├── src/
│   │   ├── app/                # App Router (Pages & API routes)
│   │   │   ├── api/auth/       # NextAuth API endpoints
│   │   │   ├── login/          # Login & Signup forms with CAPTCHA
│   │   │   ├── page.tsx        # Main application landing / dashboard page
│   │   │   ├── layout.tsx      # Root HTML layout with CRT theme scripts
│   │   │   └── globals.css     # Design tokens, CRT resets & animation keyframes
│   │   ├── components/         # Reusable UI components
│   │   │   ├── NotesDashboard.tsx  # Core dual-pane editor & workspace dashboard
│   │   │   ├── Chatbox.tsx         # Global floating Retro-Muse AI chatbox
│   │   │   ├── CassettePlayer.tsx  # Retro cassette ambient music player
│   │   │   └── ThemeGalleryModal.tsx # CRT Monitor theme switcher
│   │   └── lib/                # Utilities, audio engine, and API helpers
│   │       ├── api.ts          # Centralized fetch wrapper with JWT header injection
│   │       └── retroAudio.ts   # Web Audio API sound synthesis engine
│   └── package.json
│
├── server/                     # NestJS 11 Backend API Service
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma MongoDB schema (Users, Notes, Folders, Tags, etc.)
│   │   └── seed.ts             # Database seeder script
│   ├── src/
│   │   ├── ai/                 # Gemini AI integration service & endpoints
│   │   ├── auth/               # Passport JWT authentication service & controllers
│   │   ├── notes/              # Notes CRUD, feed filters, & trash management
│   │   ├── folders/            # Folder directory CRUD service
│   │   ├── tags/               # Tag management & tag-following service
│   │   ├── comments/           # Note comments & thread reply system
│   │   ├── reactions/          # Note reaction counters (Love, Fire, Insightful, Clap)
│   │   ├── follows/            # Author follow/unfollow system
│   │   ├── users/              # User profile stats & achievement tracking
│   │   └── main.ts             # NestJS bootstrap server configuration
│   └── package.json
│
├── retronotes_banner.png       # Project banner graphic
└── README.md                   # System documentation
```

---

## ⚡ Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.0.0 or higher)
- [npm](https://www.npmjs.com/) (v10.0.0 or higher)
- MongoDB Atlas database connection string (or local MongoDB)

### 1. Clone Repository
```bash
git clone https://github.com/ace2920006/Retronotes.git
cd Retronotes
```

### 2. Backend Setup (`/server`)
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/retronotes?retryWrites=true&w=majority"
JWT_SECRET="retronotes_jwt_secret_key_2026"
PORT=3000
GEMINI_API_KEY="your_google_gemini_api_key"
```

Initialize Prisma schema & seed initial data:
```bash
npx prisma generate
npx prisma db seed
```

Start the NestJS backend server:
```bash
npm run start:dev
```
The backend API will run on `http://localhost:3000`.

### 3. Frontend Setup (`/client`)
Open a new terminal window, navigate to the `client/` directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env.local` file inside the `client/` directory:
```env
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="retronotes_nextauth_secret_key_2026"
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
```

Start the Next.js dev server:
```bash
npm run dev -- -p 3001
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

#### Demo Credentials
- **Email**: `test@example.com`
- **Password**: `password`

---

## 🗺️ Roadmap

- [x] 📌 Pin Notes to workspace top
- [x] ⭐ Favorite Notes bookmarking
- [x] 🏷️ Inline Tags & Tag-based filtering
- [x] 📅 Date Created & Last Edited timestamp tracking
- [x] 📁 Folder directories & categorization
- [x] 🔍 Text search & Gemini AI semantic search
- [x] 📝 Dual-pane Markdown editor & preview
- [x] 💾 Local storage offline fallback & database sync
- [x] 📺 CRT scanline effects, glass curves & themes
- [ ] 🤝 Collaborative real-time note editing rooms (Socket.IO)
- [ ] 🎙️ Ambient Lofi Radio & text-to-speech voice reader
- [ ] ☁️ Direct cloud export (Google Drive & Dropbox integration)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
