import { auth } from "@/auth";
import { fetchAPI } from "@/lib/api";
import ReaderWrapper from "./ReaderWrapper";
import { revalidatePath } from "next/cache";
import Link from "next/link";

interface PostPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await (params as any);
  const session = await auth();
  const token = (session as any)?.accessToken;

  let post: any = null;
  let fetchError = false;

  try {
    post = await fetchAPI(`/posts/${id}`, {
      token,
      next: { revalidate: 0 }, // bypass next cache to get latest
    });
  } catch (error) {
    console.error("Failed to fetch post detail:", error);
    fetchError = true;
  }

  if (fetchError || !post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-16 px-4 bg-gray-950 text-gray-200">
        <div className="text-center max-w-md p-6 border border-gray-800 rounded-lg">
          <p className="text-gray-400 mb-6 font-light">⚠️ Post not found or database is offline.</p>
          <Link href="/" className="px-6 py-2 bg-white text-gray-950 font-medium rounded-full text-sm">
            Back to Galaxy
          </Link>
        </div>
      </main>
    );
  }

  // Server Action to handle like toggle
  async function toggleLike() {
    "use server";
    const session = await auth();
    if (!session) return;
    const token = (session as any).accessToken;

    try {
      if (post.hasLiked) {
        await fetchAPI(`/likes/${id}`, {
          method: "DELETE",
          token,
        });
      } else {
        await fetchAPI(`/likes/${id}`, {
          method: "POST",
          token,
        });
      }
      revalidatePath(`/post/${id}`);
      revalidatePath("/");
    } catch (error) {
      console.error("Server Action like toggle failed:", error);
      throw error;
    }
  }

  // Server Action to add comment
  async function addComment(content: string) {
    "use server";
    const session = await auth();
    if (!session) return null;
    const token = (session as any).accessToken;

    try {
      const response = await fetchAPI(`/comments/${id}`, {
        method: "POST",
        token,
        body: JSON.stringify({ content }),
      });
      revalidatePath(`/post/${id}`);
      revalidatePath("/");
      return response;
    } catch (error) {
      console.error("Server Action comment submission failed:", error);
      throw error;
    }
  }

  return (
    <ReaderWrapper
      post={post}
      session={session}
      likeAction={toggleLike}
      commentAction={addComment}
    />
  );
}
