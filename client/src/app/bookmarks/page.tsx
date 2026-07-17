import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchAPI } from "@/lib/api";
import PostCard from "@/components/PostCard";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const token = (session as any)?.accessToken;
  let posts = [];
  let fetchError = false;

  try {
    posts = await fetchAPI("/bookmarks", {
      token,
      next: { revalidate: 0 },
    }) || [];
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    fetchError = true;
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <div className="w-full max-w-2xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-100 mb-3 tracking-wide">
            Your Bookmarks
          </h1>
          <p className="text-gray-400 font-light italic text-sm">
            Saved whispers and stories that spoke to your soul.
          </p>
        </header>

        {fetchError && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-lg text-center text-red-200 text-sm mb-8">
            ⚠️ Could not connect to InkVerse service. Please verify the backend is running.
          </div>
        )}

        <div className="space-y-12">
          {!fetchError && posts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-900 rounded-lg">
              <p className="text-gray-500 mb-6 font-light">No saved works yet.</p>
              <Link
                href="/explore"
                className="inline-block px-5 py-2 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-full transition-all text-xs"
              >
                ✨ Explore the Verse
              </Link>
            </div>
          ) : (
            posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                token={token || ""}
                isLoggedIn={true}
              />
            ))
          )}
        </div>

        <div className="mt-16 text-center pt-8 border-t border-gray-900">
          <Link href="/" className="text-xs text-gray-550 hover:text-gray-300 transition-colors">
            ← Back to Galaxy
          </Link>
        </div>
      </div>
    </main>
  );
}
