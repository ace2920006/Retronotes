import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchAPI } from "@/lib/api";
import PostCard from "@/components/PostCard";

export default async function FeedPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; search?: string }> | { type?: string; search?: string };
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const token = (session as any)?.accessToken;
  const resolvedSearchParams = await searchParams;
  const type = resolvedSearchParams?.type || "All";
  const search = resolvedSearchParams?.search || "";

  let posts = [];
  let fetchError = false;

  try {
    const query = new URLSearchParams();
    query.set("following", "true");
    if (type && type !== "All") query.set("type", type);
    if (search) query.set("search", search);

    const endpoint = `/posts/feed?${query.toString()}`;
    posts = await fetchAPI(endpoint, {
      token,
      next: { revalidate: 0 },
    });
  } catch (error) {
    console.error("Failed to fetch feed:", error);
    fetchError = true;
  }

  const categories = ["All", "Poetry", "Haiku", "Story", "Thought"];

  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <header className="mb-12 text-center max-w-xl">
        <h1 className="text-4xl font-serif font-bold text-gray-100 mb-3 tracking-wide">
          Your Feed
        </h1>
        <p className="text-gray-400 font-light italic text-sm">
          Whispers and words from the writers you follow.
        </p>
      </header>

      {/* Search Bar */}
      <form method="GET" action="/feed" className="w-full max-w-2xl mb-6 flex gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search within your followed circle..."
          className="flex-1 p-3 bg-gray-900 border border-gray-800 rounded-full text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-700 transition-all font-light"
        />
        {type && type !== "All" && <input type="hidden" name="type" value={type} />}
        <button
          type="submit"
          className="px-6 py-3 bg-white text-gray-950 text-sm font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-md cursor-pointer"
        >
          Search
        </button>
        {search && (
          <Link
            href={type && type !== "All" ? `/feed?type=${type}` : "/feed"}
            className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white flex items-center transition-colors font-light"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-6 mb-8 max-w-2xl w-full justify-start md:justify-center scrollbar-none">
        {categories.map((cat) => {
          const isActive = type === cat;
          const query = { type: cat } as any;
          if (search) query.search = search;
          const queryString = new URLSearchParams(query).toString();

          return (
            <Link
              key={cat}
              href={`/feed?${queryString}`}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-white text-gray-950 shadow-md scale-105"
                  : "bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-850"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      <div className="w-full max-w-2xl space-y-12">
        {fetchError && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-lg text-center text-red-200 text-sm">
            ⚠️ Could not connect to InkVerse service. Please verify the backend is running.
          </div>
        )}

        {!fetchError && posts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-500 mb-4 font-light">The circle is quiet. No matching whispers found.</p>
            <Link
              href="/"
              className="inline-block px-5 py-2 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-full transition-all text-xs"
            >
              ✨ Explore the Galaxy
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

        <div className="text-center mt-16 pt-8 border-t border-gray-900">
          <Link href="/" className="text-xs text-gray-550 hover:text-gray-300 transition-colors">
            ← Back to Galaxy
          </Link>
        </div>
      </div>
    </main>
  );
}
