import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { fetchAPI } from "@/lib/api";
import PublishButton from "./PublishButton";

export default async function WritePage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  async function createPostAction(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;

    if (!content || !type) {
      return;
    }

    const session = await auth();
    const token = (session as any)?.accessToken;

    try {
      await fetchAPI("/posts", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: title || undefined,
          content,
          type,
        }),
      });
    } catch (error) {
      console.error("Failed to create post:", error);
      return;
    }

    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <div className="w-full max-w-xl">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-100">Pen a Work</h1>
            <p className="text-gray-400 text-sm font-light mt-1">Let your thoughts flow onto the page.</p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cancel
          </Link>
        </header>

        <form action={createPostAction} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Writing Type
            </label>
            <select
              name="type"
              required
              defaultValue="Poetry"
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-700 transition-all font-light text-sm"
            >
              <option value="Poetry">Poetry</option>
              <option value="Haiku">Haiku (5-7-5)</option>
              <option value="Story">Short Story</option>
              <option value="Thought">Thought / Aphorism</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Title (Optional)
            </label>
            <input
              name="title"
              type="text"
              placeholder="e.g. Whispers of Winter"
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-700 transition-all font-light text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Your Words
            </label>
            <textarea
              name="content"
              required
              rows={12}
              placeholder="The moonlight dances on the glass..."
              className="w-full p-4 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-700 transition-all font-serif text-base leading-relaxed resize-none"
            />
          </div>

          <PublishButton />
        </form>
      </div>
    </main>
  );
}
