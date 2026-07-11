import Link from "next/link";
import { auth } from "@/auth";
import { fetchAPI } from "@/lib/api";

export default async function Home() {
  const session = await auth();
  const token = (session as any)?.accessToken;

  let posts = [];
  let fetchError = false;

  try {
    // Fetch feed from backend (pass user's JWT token if logged in)
    posts = await fetchAPI("/posts/feed", {
      token,
      next: { revalidate: 0 }, // bypass next cache
    });
  } catch (error) {
    console.error("Failed to fetch feed:", error);
    fetchError = true;
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <header className="mb-16 text-center max-w-xl">
        <h1 className="text-5xl font-serif font-bold text-gray-100 mb-3 tracking-wide">
          InkVerse
        </h1>
        <p className="text-gray-400 font-light italic text-lg">
          Where Stories Meet Souls
        </p>

        {session?.user ? (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <span className="text-gray-400 text-sm">
              Greeting, <Link href={`/profile/${(session.user as any).id}`} className="text-white hover:underline font-medium">{session.user.name}</Link>
            </span>
            <div className="flex gap-3">
              <Link
                href="/write"
                className="px-6 py-2 bg-white hover:bg-gray-200 text-gray-950 font-medium rounded-full transition-colors text-sm shadow-md"
              >
                Write Poem
              </Link>
              <form
                action={async () => {
                  "use server";
                  // NextAuth signOut
                  const { signOut } = await import("@/auth");
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-full border border-gray-800 transition-colors text-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-850 rounded-full transition-colors text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-white hover:bg-gray-200 text-gray-950 font-medium rounded-full transition-colors text-sm shadow-md"
            >
              Start Writing
            </Link>
          </div>
        )}
      </header>

      <div className="w-full max-w-2xl space-y-12">
        {fetchError && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-lg text-center text-red-200 text-sm">
            ⚠️ Could not connect to InkVerse service. Please verify the backend is running.
          </div>
        )}

        {!fetchError && posts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-500 mb-4 font-light">The Verse is quiet. Be the first to share a whisper.</p>
            <Link
              href={session?.user ? "/write" : "/login"}
              className="inline-block px-5 py-2 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-full transition-all text-xs"
            >
              🖊️ Pen your first work
            </Link>
          </div>
        ) : (
          posts.map((post: any) => (
            <div key={post.id} className="py-10 border-b border-gray-900 last:border-b-0">
              <div className="flex items-center justify-between mb-6">
                <Link
                  href={`/profile/${post.authorId}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-sm group-hover:border-gray-700 transition-colors">
                    ✒️
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      {post.author.name}
                    </h3>
                    <p className="text-xs text-gray-550 font-light">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
                
                <span className="px-3 py-1 bg-gray-900/80 border border-gray-850 rounded-full text-xs text-gray-400 font-light">
                  {post.type}
                </span>
              </div>

              {post.title && (
                <h2 className="text-xl font-serif font-semibold text-gray-150 mb-4 pl-4 border-l border-gray-800">
                  {post.title}
                </h2>
              )}

              <div className="font-serif text-lg leading-relaxed text-gray-200 mb-8 pl-4 pr-2 whitespace-pre-wrap">
                {post.content}
              </div>

              <div className="flex items-center gap-6 text-gray-400 text-sm">
                <form
                  action={async () => {
                    "use server";
                    if (!session) return;
                    // Action to handle like/unlike toggle
                    const token = (session as any).accessToken;
                    try {
                      if (post.hasLiked) {
                        await fetchAPI(`/likes/${post.id}`, {
                          method: "DELETE",
                          token,
                        });
                      } else {
                        await fetchAPI(`/likes/${post.id}`, {
                          method: "POST",
                          token,
                        });
                      }
                    } catch (error) {
                      console.error("Like toggle failed:", error);
                    }
                  }}
                >
                  <button
                    type="submit"
                    className={`flex items-center gap-2 transition-colors hover:text-red-400 ${
                      post.hasLiked ? "text-red-500" : ""
                    }`}
                    disabled={!session}
                    title={session ? "Like post" : "Log in to like"}
                  >
                    <span>{post.hasLiked ? "❤️" : "🤍"}</span> {post.likesCount}
                  </button>
                </form>

                <Link
                  href={`/post/${post.id}`}
                  className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                >
                  <span>💬</span> {post.commentsCount}
                </Link>

                <button className="flex items-center gap-2 hover:text-green-400 transition-colors ml-auto">
                  <span>🔖</span> Save
                </button>
              </div>

              {/* Quick comments display */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-900/60 space-y-3">
                  {post.comments.slice(0, 2).map((comment: any) => (
                    <div key={comment.id} className="text-xs bg-gray-900/30 p-2.5 rounded-lg border border-gray-900/40">
                      <div className="flex justify-between items-center mb-1 text-gray-400">
                        <span className="font-medium text-gray-300">{comment.author.name}</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-350 font-light">{comment.content}</p>
                    </div>
                  ))}
                  {post.comments.length > 2 && (
                    <Link
                      href={`/post/${post.id}`}
                      className="inline-block text-xs text-gray-500 hover:text-gray-300 hover:underline font-light"
                    >
                      View all {post.comments.length} comments
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        <div className="text-center mt-16 pt-8 border-t border-gray-900">
          <p className="text-gray-500 text-sm italic font-light">Scroll softly, read deeply.</p>
        </div>
      </div>
    </main>
  );
}
