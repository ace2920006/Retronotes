import Link from "next/link";
import { auth } from "@/auth";
import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";
import UserAvatar from "@/components/UserAvatar";
import EditProfileControl from "./EditProfileControl";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  // Access Route params. In Next.js 15+, params is a promise, so we can await it
  const { id } = await (params as any);

  const session = await auth();
  const token = (session as any)?.accessToken;

  let profile: any = null;
  let posts: any[] = [];
  let fetchError = false;

  try {
    profile = await fetchAPI(`/users/${id}`, { token });
    posts = await fetchAPI(`/posts/user/${id}`, { token });
  } catch (error) {
    console.error("Failed to fetch profile/posts:", error);
    fetchError = true;
  }

  if (fetchError || !profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-16 px-4 bg-gray-950 text-gray-200">
        <div className="text-center max-w-md p-6 border border-gray-800 rounded-lg">
          <p className="text-gray-400 mb-6 font-light">⚠️ Profile not found or database is offline.</p>
          <Link href="/" className="px-6 py-2 bg-white text-gray-950 font-medium rounded-full text-sm">
            Back to Galaxy
          </Link>
        </div>
      </main>
    );
  }

  const isOwnProfile = session?.user && (session.user as any).id === profile.id;

  async function toggleFollow() {
    "use server";
    const session = await auth();
    if (!session) return;
    const token = (session as any).accessToken;

    try {
      if (profile.isFollowing) {
        await fetchAPI(`/follows/${id}`, {
          method: "DELETE",
          token,
        });
      } else {
        await fetchAPI(`/follows/${id}`, {
          method: "POST",
          token,
        });
      }
      revalidatePath(`/profile/${id}`);
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <div className="w-full max-w-3xl">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 border-b border-gray-900 pb-12">
          <UserAvatar 
            image={profile.image} 
            name={profile.name} 
            className="w-28 h-28 text-4xl" 
            fallbackEmoji="🌙" 
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-3xl font-serif font-bold text-gray-150">
                {profile.name}
              </h1>
              {isOwnProfile && (
                <span className="inline-block self-center px-3 py-0.5 bg-gray-900 border border-gray-800 rounded-full text-[10px] text-gray-400 tracking-wider uppercase font-semibold">
                  You
                </span>
              )}
            </div>
            <p className="text-gray-450 mb-6 font-light max-w-lg leading-relaxed text-sm">
              {profile.bio || "This writer has chosen to keep their thoughts inside their head for now."}
            </p>
            <div className="flex justify-center md:justify-start gap-6 text-xs text-gray-500 mb-6">
              <span><strong className="text-gray-300">{posts.length}</strong> Published Works</span>
              <span><strong className="text-gray-300">{profile.followersCount || 0}</strong> Followers</span>
              <span><strong className="text-gray-300">{profile.followingCount || 0}</strong> Following</span>
            </div>
            
            {isOwnProfile ? (
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/write"
                  className="inline-block px-6 py-2 bg-white hover:bg-gray-200 text-gray-950 font-medium rounded-full transition-all text-xs shadow-md font-semibold"
                >
                  🖊️ Write new poem
                </Link>
                <EditProfileControl profile={profile} token={token || ""} />
              </div>
            ) : (
              <form action={toggleFollow}>
                <button
                  type="submit"
                  className={`px-6 py-2 border rounded-full transition-all text-xs cursor-pointer font-semibold ${
                    profile.isFollowing
                      ? "bg-gray-900 border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-900/40 hover:bg-red-950/20"
                      : "bg-white border-transparent text-gray-950 hover:bg-gray-200"
                  }`}
                >
                  {profile.isFollowing ? "Unfollow" : "Follow Writer"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* User Posts */}
        <h2 className="text-lg font-serif text-gray-100 mb-8 border-l border-gray-700 pl-3">
          Published Works
        </h2>
        
        <div className="space-y-12">
          {posts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-900 rounded-lg">
              <p className="text-gray-500 text-sm font-light">No works published by this writer yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="py-8 border-b border-gray-900 last:border-b-0">
                <div className="flex items-center gap-3 mb-6 text-gray-400 text-xs font-light">
                  <span>🌸</span>
                  <span>{post.type}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                
                {post.title && (
                  <h3 className="text-lg font-serif font-semibold text-gray-200 mb-3 pl-4 border-l border-gray-800">
                    {post.title}
                  </h3>
                )}

                <div className="font-serif text-base leading-relaxed text-gray-300 mb-6 pl-4 whitespace-pre-wrap">
                  {post.content}
                </div>

                <div className="flex items-center gap-6 text-gray-400 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span>❤️</span> {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span>💬</span> {post.commentsCount}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-16 text-center">
          <Link href="/" className="text-xs text-gray-550 hover:text-gray-300 transition-colors">
            ← Back to Galaxy
          </Link>
        </div>
      </div>
    </main>
  );
}
