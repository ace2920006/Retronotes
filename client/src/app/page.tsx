import Link from "next/link";
import { auth } from "@/auth";
import NotesDashboard from "@/components/NotesDashboard";

export default async function Home() {
  const session = await auth();
  const token = (session as any)?.accessToken;

  if (session?.user && token) {
    return (
      <NotesDashboard
        token={token}
        user={{
          id: (session.user as any).id,
          name: session.user.name || "User",
          email: session.user.email || "",
          image: session.user.image || undefined,
        }}
      />
    );
  }

  // Not logged in: Show CRT Retro Boot Loader / Landing Page
  return (
    <main className="crt-container min-h-screen bg-[#071407] text-[#33ff33] font-mono flex items-center justify-center p-6 select-none crt-effect crt-flicker">
      <div className="max-w-2xl w-full retro-border border-4 p-8 bg-[#0b220b]/90 text-glow">
        {/* Header BIOS info */}
        <div className="border-b border-[#33ff33]/40 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-widest uppercase">RetroNotes OS</h1>
            <p className="text-xs text-gray-500 font-sans tracking-wide">SYSTEM RELEASE: DATED 07/17/2026</p>
          </div>
          <span className="text-xl">📟</span>
        </div>

        {/* System Diagnostics Display */}
        <div className="space-y-4 text-xs font-mono mb-8 leading-relaxed">
          <div className="grid grid-cols-2 gap-2">
            <div>CPU TYPE:</div>
            <div className="font-bold">GEMINI 2.5 FLASH AI ENGINE</div>
            <div>DB DRIVER:</div>
            <div className="font-bold">SQLITE 3 + PRISMA ORM</div>
            <div>ROM LOADED:</div>
            <div className="font-bold">NEXT.JS 16 + REACT 19</div>
            <div>AUTHENTICATION:</div>
            <div className="font-bold">NEXTAUTH + JWT SECURITY</div>
          </div>
          
          <div className="border border-[#1b4d1b] p-4 bg-black/30 mt-4">
            <p className="font-bold mb-2 uppercase text-[11px]">Core Features Available:</p>
            <ul className="space-y-1 list-inside list-square">
              <li>📝 DUAL-PANE MARKDOWN EDITOR & LIVE PREVIEW</li>
              <li>📁 DIRECTORY FOLDERS & granulAR TAGGING SYSTEM</li>
              <li>📌 PINNED NOTES, FAVORITES, ARCHIVE, AND TRASH ACTION</li>
              <li>⚡ LOCAL STORAGE SYNC FOR FULL OFFLINE USE</li>
              <li>🎨 5 RETRO CRT DISPLAY MONITOR COLOR THEMES</li>
              <li>📟 SUMMARIZATION, FLASHCARDS, & ASK AI Drawer</li>
            </ul>
          </div>
        </div>

        {/* Actions / Blinking cursor link */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-[#33ff33]/40 pt-6">
          <span className="text-xs text-gray-500 font-mono tracking-widest flex items-center gap-1.5">
            READY TO LOAD SYSTEM
            <span className="inline-block w-2.5 h-4 bg-[#33ff33] animate-pulse"></span>
          </span>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="retro-button border-4 text-sm font-bold uppercase tracking-wider px-6 py-2.5 hover:bg-[#33ff33] hover:text-black transition-all"
            >
              LAUNCH LOGIN MODULE ▶
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
