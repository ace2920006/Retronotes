import Link from "next/link";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  console.log("[ProfilePage] Debugging - rendering profile for user ID:", params.id);
  // In a real app, fetch user by params.id
  
  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <div className="w-full max-w-3xl">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 border-b border-gray-800 pb-12">
          <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center text-4xl border-2 border-gray-700">
            🌙
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-gray-100 mb-2">Luna Writer</h1>
            <p className="text-gray-400 mb-4 font-light max-w-lg">
              Weaving dreams into words. Lover of haikus, rain, and midnight thoughts.
            </p>
            <div className="flex justify-center md:justify-start gap-6 text-sm text-gray-500 mb-6">
              <span><strong className="text-gray-300">1.2K</strong> Followers</span>
              <span><strong className="text-gray-300">45</strong> Published Works</span>
              <span><strong className="text-gray-300">12h</strong> Read Time</span>
            </div>
            <button className="px-6 py-2 bg-white hover:bg-gray-200 text-gray-950 font-medium rounded-full transition-colors text-sm">
              Follow
            </button>
          </div>
        </div>

        {/* User Posts */}
        <h2 className="text-xl font-serif text-gray-100 mb-8 border-l-2 border-gray-600 pl-3">Recent Works</h2>
        
        <div className="py-8 border-y border-gray-800">
          <div className="flex items-center gap-2 mb-6 text-gray-400 text-sm font-medium">
            <span>🌸</span>
            <span>Haiku</span>
          </div>
          
          <div className="font-serif text-xl leading-relaxed text-gray-100 mb-8 pl-4 border-l-2 border-gray-800">
            <p>Silent winter night</p>
            <p>A single star guides me home</p>
            <p>Peace within my soul</p>
          </div>

          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
              <span>❤️</span> 1.1K
            </button>
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <span>💬</span> 89
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to Galaxy
          </Link>
        </div>
      </div>
    </main>
  );
}
