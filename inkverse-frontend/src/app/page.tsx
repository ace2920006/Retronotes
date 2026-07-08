import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-serif font-bold text-gray-100 mb-2 tracking-wide">InkVerse</h1>
        <p className="text-gray-400 font-light italic">Where Stories Meet Souls</p>
        
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/login" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors text-sm">
            Login
          </Link>
          <Link href="/login" className="px-6 py-2 bg-white hover:bg-gray-200 text-gray-950 font-medium rounded-full transition-colors text-sm">
            Start Writing
          </Link>
        </div>
      </header>

      <div className="w-full max-w-2xl">
        {/* Post Card */}
        <div className="py-12 border-y border-gray-800">
          <div className="flex items-center gap-2 mb-8 text-gray-400 text-sm font-medium">
            <span>🌙</span>
            <span>Moonlight</span>
          </div>
          
          <div className="font-serif text-2xl leading-relaxed text-gray-100 mb-10 pl-4 border-l-2 border-gray-800">
            <p>The rain</p>
            <p>forgot my umbrella</p>
            <p>but remembered</p>
            <p>my heart.</p>
          </div>

          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
              <span>❤️</span> 5.2K
            </button>
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <span>💬</span> 412
            </button>
            <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
              <span>🔖</span> Save
            </button>
            <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
              <span>🎧</span> Listen
            </button>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">Scroll softly, read deeply.</p>
        </div>
      </div>
    </main>
  );
}
