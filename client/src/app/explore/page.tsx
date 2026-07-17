import Link from "next/link";
import { auth } from "@/auth";
import { fetchAPI } from "@/lib/api";
import PostCard from "@/components/PostCard";
import UserAvatar from "@/components/UserAvatar";
import FollowButton from "@/components/FollowButton";

export default async function ExplorePage() {
  const session = await auth();
  const token = (session as any)?.accessToken;

  let trendingPosts: any[] = [];
  let featuredWriters: any[] = [];
  let fetchError = false;

  try {
    const [postsRes, writersRes] = await Promise.all([
      fetchAPI("/posts/trending", { token, next: { revalidate: 0 } }),
      fetchAPI("/users/featured", { token, next: { revalidate: 0 } }),
    ]);
    trendingPosts = postsRes || [];
    featuredWriters = writersRes || [];
  } catch (error) {
    console.error("Failed to fetch explore page data:", error);
    fetchError = true;
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <div className="w-full max-w-5xl">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-serif font-bold text-gray-100 mb-3 tracking-wide">
            Explore the Verse
          </h1>
          <p className="text-gray-400 font-light italic text-sm">
            Discover trending creations and follow inspiring writers.
          </p>
        </header>

        {fetchError && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-lg text-center text-red-200 text-sm mb-8">
            ⚠️ Could not connect to InkVerse service. Please verify the backend is running.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Trending Posts */}
          <div className="md:col-span-2 space-y-8">
            <h2 className="text-xl font-serif text-gray-100 mb-6 border-l border-gray-700 pl-3">
              Trending Whispers
            </h2>
            {trendingPosts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-900 rounded-lg">
                <p className="text-gray-500 text-sm font-light">No whispers trending yet.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {trendingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    token={token || ""}
                    isLoggedIn={!!session}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Featured Writers */}
          <div className="space-y-8">
            <h2 className="text-xl font-serif text-gray-100 mb-6 border-l border-gray-700 pl-3">
              Featured Voices
            </h2>
            {featuredWriters.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-900 rounded-lg">
                <p className="text-gray-500 text-sm font-light">No other writers found in this galaxy yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {featuredWriters.map((writer) => (
                  <div
                    key={writer.id}
                    className="p-5 bg-gray-900/40 border border-gray-900 rounded-xl hover:border-gray-800 transition-all flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        image={writer.image}
                        name={writer.name}
                        className="w-12 h-12 text-lg"
                        fallbackEmoji="🌙"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/profile/${writer.id}`}
                          className="text-sm font-serif font-semibold text-gray-200 hover:text-white truncate block"
                        >
                          {writer.name}
                        </Link>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {writer.followersCount || 0} Followers
                        </span>
                      </div>
                    </div>
                    {writer.bio && (
                      <p className="text-xs text-gray-400 font-light line-clamp-2 leading-relaxed">
                        {writer.bio}
                      </p>
                    )}
                    <div className="flex justify-end pt-1">
                      <FollowButton
                        targetUserId={writer.id}
                        initialIsFollowing={writer.isFollowing}
                        token={token || ""}
                        isLoggedIn={!!session}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
