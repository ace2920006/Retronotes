"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";

interface ReaderWrapperProps {
  post: any;
  session: any;
  likeAction: () => Promise<void>;
  commentAction: (content: string) => Promise<any>;
  editCommentAction: (commentId: string, content: string) => Promise<any>;
  deleteCommentAction: (commentId: string) => Promise<any>;
}

export default function ReaderWrapper({
  post,
  session,
  likeAction,
  commentAction,
  editCommentAction,
  deleteCommentAction,
}: ReaderWrapperProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"midnight" | "paper" | "obsidian">("midnight");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [isPending, startTransition] = useTransition();
  const [isLiking, setIsLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Calculate estimated reading time
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync comments from post prop updates
  useEffect(() => {
    setComments(post.comments || []);
    setLikesCount(post.likesCount);
    setHasLiked(post.hasLiked);
  }, [post]);

  const handleLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setIsLiking(true);
    // Optimistic UI update
    const previousHasLiked = hasLiked;
    const previousLikesCount = likesCount;
    setHasLiked(!hasLiked);
    setLikesCount(hasLiked ? likesCount - 1 : likesCount + 1);

    try {
      await likeAction();
    } catch (error) {
      console.error("Like toggle failed:", error);
      // Rollback
      setHasLiked(previousHasLiked);
      setLikesCount(previousLikesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    startTransition(async () => {
      try {
        const newComment = await commentAction(commentText);
        if (newComment) {
          setComments((prev: any[]) => [...prev, newComment]);
          setCommentText("");
        }
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    });
  };

  const handleEditCommentSubmit = async (commentId: string) => {
    if (!editingText.trim()) return;

    startTransition(async () => {
      try {
        const updated = await editCommentAction(commentId, editingText);
        if (updated) {
          setComments((prev: any[]) =>
            prev.map((c) =>
              c.id === commentId ? { ...c, content: updated.content, updatedAt: updated.updatedAt } : c
            )
          );
          setEditingCommentId(null);
          setEditingText("");
        }
      } catch (error) {
        console.error("Failed to edit comment:", error);
      }
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    startTransition(async () => {
      try {
        await deleteCommentAction(commentId);
        setComments((prev: any[]) => prev.filter((c) => c.id !== commentId));
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    });
  };

  // Theme mapping
  const themeClasses = {
    midnight: "bg-gray-950 text-gray-200 border-gray-900",
    paper: "bg-[#fbf6ec] text-[#2d2218] border-[#eaddca]",
    obsidian: "bg-black text-gray-300 border-gray-950",
  };

  const fontClasses = {
    sm: "text-sm md:text-base leading-relaxed",
    md: "text-lg md:text-xl leading-relaxed",
    lg: "text-2xl md:text-3xl leading-relaxed",
  };

  const familyClasses = {
    serif: "font-serif",
    sans: "font-sans",
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "paper" ? "bg-[#f4ebe1]" : theme === "obsidian" ? "bg-black" : "bg-gray-950"}`}>
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-white z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <main className="flex flex-col items-center py-16 px-4">
        <div className="w-full max-w-2xl">
          {/* Back & Reader Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-8 border-b border-gray-900/60 pb-6">
            <Link
              href="/"
              className={`text-xs flex items-center gap-1.5 transition-colors ${
                theme === "paper" ? "text-amber-800 hover:text-amber-950" : "text-gray-400 hover:text-white"
              }`}
            >
              <span>←</span> Back to Verse
            </Link>

            {/* Controls Panel */}
            <div className="flex items-center gap-4 bg-gray-900/40 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-800/40 text-xs">
              {/* Theme toggles */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setTheme("midnight")}
                  className={`w-4 h-4 rounded-full bg-gray-900 border ${
                    theme === "midnight" ? "border-white" : "border-gray-700"
                  }`}
                  title="Midnight theme"
                />
                <button
                  onClick={() => setTheme("paper")}
                  className={`w-4 h-4 rounded-full bg-[#fbf6ec] border ${
                    theme === "paper" ? "border-amber-900" : "border-gray-700"
                  }`}
                  title="Warm Paper theme"
                />
                <button
                  onClick={() => setTheme("obsidian")}
                  className={`w-4 h-4 rounded-full bg-black border ${
                    theme === "obsidian" ? "border-white" : "border-gray-800"
                  }`}
                  title="Obsidian theme"
                />
              </div>

              <span className="text-gray-700">|</span>

              {/* Font Size Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-1.5 py-0.5 rounded ${
                    fontSize === "sm" ? "bg-white text-black font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("md")}
                  className={`px-1.5 py-0.5 rounded text-sm ${
                    fontSize === "md" ? "bg-white text-black font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-1.5 py-0.5 rounded text-base ${
                    fontSize === "lg" ? "bg-white text-black font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  A+
                </button>
              </div>

              <span className="text-gray-700">|</span>

              {/* Font Style Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFontFamily("serif")}
                  className={`px-2 py-0.5 rounded font-serif ${
                    fontFamily === "serif" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Serif
                </button>
                <button
                  onClick={() => setFontFamily("sans")}
                  className={`px-2 py-0.5 rounded font-sans ${
                    fontFamily === "sans" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sans
                </button>
              </div>
            </div>
          </div>

          {/* Reading Card */}
          <article
            className={`p-8 md:p-12 rounded-2xl border shadow-2xl transition-all duration-300 ${
              themeClasses[theme]
            }`}
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <Link
                href={`/profile/${post.authorId}`}
                className="flex items-center gap-3 group"
              >
                <UserAvatar
                  image={post.author.image}
                  name={post.author.name}
                  className="w-10 h-10 text-base group-hover:border-gray-700 transition-colors"
                />
                <div>
                  <h4 className={`text-sm font-semibold transition-colors ${
                    theme === "paper" ? "text-amber-950 group-hover:text-amber-800" : "text-gray-200 group-hover:text-white"
                  }`}>
                    {post.author.name}
                  </h4>
                  <p className={`text-xs ${theme === "paper" ? "text-amber-800/80" : "text-gray-500"}`}>
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs rounded-full border ${
                  theme === "paper" ? "bg-amber-100/50 border-amber-900/20 text-amber-900" : "bg-gray-900/50 border-gray-800 text-gray-400"
                }`}>
                  {post.type}
                </span>
                <span className={`px-3 py-1 text-xs rounded-full border ${
                  theme === "paper" ? "bg-amber-100/50 border-amber-900/20 text-amber-900" : "bg-gray-900/50 border-gray-800 text-gray-400"
                }`} title="Estimated reading time">
                  ⏱️ {readingTime} min read
                </span>
              </div>
            </div>

            {/* Post Title */}
            {post.title && (
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 pl-4 border-l-2 border-gray-700 leading-tight">
                {post.title}
              </h1>
            )}

            {/* Post Content */}
            <div className={`whitespace-pre-wrap mb-12 pl-4 pr-2 ${fontClasses[fontSize]} ${familyClasses[fontFamily]}`}>
              {post.content}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-800/40 text-sm">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 transition-colors py-1.5 px-3 rounded-full hover:bg-gray-900/20 ${
                  hasLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"
                }`}
                title={session ? "Like post" : "Log in to like"}
              >
                <span>{hasLiked ? "❤️" : "🤍"}</span> {likesCount}
              </button>

              <span className="text-gray-400 flex items-center gap-2">
                <span>💬</span> {comments.length}
              </span>
            </div>
          </article>

          {/* Comment Section */}
          <section className="mt-16">
            <h3 className={`text-xl font-serif font-semibold mb-6 border-l-2 pl-3 ${
              theme === "paper" ? "border-amber-900 text-amber-950" : "border-white text-gray-100"
            }`}>
              Thoughts ({comments.length})
            </h3>

            {/* New Comment Form */}
            {session ? (
              <form onSubmit={handleCommentSubmit} className="mb-10 space-y-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your reflection on this work..."
                  rows={4}
                  required
                  className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-1 transition-all ${
                    theme === "paper"
                      ? "bg-white/80 border-amber-900/25 text-[#2d2218] focus:ring-amber-800"
                      : "bg-gray-900/80 border-gray-800 text-gray-200 focus:ring-gray-700"
                  }`}
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className={`px-6 py-2.5 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer ${
                    theme === "paper"
                      ? "bg-amber-950 hover:bg-amber-900 text-amber-50"
                      : "bg-white hover:bg-gray-200 text-gray-950"
                  }`}
                >
                  {isPending ? "Sharing..." : "Share Reflection"}
                </button>
              </form>
            ) : (
              <div className={`p-6 rounded-xl border text-center mb-10 ${
                theme === "paper" ? "bg-amber-50/50 border-amber-900/20" : "bg-gray-900/30 border-gray-900"
              }`}>
                <p className={`text-sm mb-4 ${theme === "paper" ? "text-amber-800" : "text-gray-450"}`}>
                  Do you hear the whispers? Join the Verse to leave a trace.
                </p>
                <Link
                  href="/login"
                  className={`inline-block px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                    theme === "paper"
                      ? "bg-amber-950 text-amber-50 hover:bg-amber-900"
                      : "bg-white text-gray-950 hover:bg-gray-200"
                  }`}
                >
                  Sign In to Comment
                </Link>
              </div>
            )}

            {/* Comment List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className={`text-sm italic font-light ${theme === "paper" ? "text-amber-800/80" : "text-gray-500"}`}>
                  No reflections shared yet. Be the first to share your thoughts.
                </p>
              ) : (
                comments.map((comment: any) => {
                  const isCommentAuthor = session?.user && (session.user as any).id === comment.authorId;
                  const isPostAuthor = session?.user && (session.user as any).id === post.authorId;
                  const canDelete = isCommentAuthor || isPostAuthor;
                  const canEdit = isCommentAuthor;

                  return (
                    <div
                      key={comment.id}
                      className={`p-5 rounded-xl border transition-all ${
                        theme === "paper" ? "bg-white/40 border-amber-900/10" : "bg-gray-900/20 border-gray-900"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <Link href={`/profile/${comment.authorId}`} className="flex items-center gap-2 group">
                          <UserAvatar
                            image={comment.author.image}
                            name={comment.author.name}
                            className="w-6 h-6 text-[10px]"
                          />
                          <span className={`text-xs font-semibold ${
                            theme === "paper" ? "text-amber-950 group-hover:text-amber-800" : "text-gray-300 group-hover:text-white"
                          }`}>
                            {comment.author.name}
                          </span>
                        </Link>
                        
                        <div className="flex items-center gap-2">
                          {comment.updatedAt !== comment.createdAt && (
                            <span className={`text-[9px] font-light italic ${
                              theme === "paper" ? "text-amber-800/60" : "text-gray-500"
                            }`}>
                              (edited)
                            </span>
                          )}
                          <span className={`text-[10px] font-light ${
                            theme === "paper" ? "text-amber-850/80" : "text-gray-500"
                          }`}>
                            {new Date(comment.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="space-y-3 mt-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={3}
                            className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-1 transition-all ${
                              theme === "paper"
                                ? "bg-white/90 border-amber-900/20 text-[#2d2218] focus:ring-amber-800"
                                : "bg-gray-950 border-gray-850 text-gray-200 focus:ring-gray-700"
                            }`}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCommentSubmit(comment.id)}
                              disabled={isPending}
                              className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                                theme === "paper"
                                  ? "bg-amber-950 text-amber-50 hover:bg-amber-900"
                                  : "bg-white text-gray-950 hover:bg-gray-200"
                              }`}
                            >
                              {isPending ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingText("");
                              }}
                              className={`px-4 py-1.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                                theme === "paper"
                                  ? "border-amber-900/20 text-amber-900 hover:bg-amber-900/5"
                                  : "border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900"
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={`text-sm leading-relaxed ${
                            theme === "paper" ? "text-[#3c3024] font-light" : "text-gray-300 font-light"
                          }`}>
                            {comment.content}
                          </p>

                          {(canEdit || canDelete) && (
                            <div className="flex justify-end gap-3 mt-3 pt-2.5 border-t border-dashed border-gray-900/10 dark:border-gray-900/40">
                              {canEdit && (
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingText(comment.content);
                                  }}
                                  className={`text-[10px] font-medium transition-colors cursor-pointer hover:underline ${
                                    theme === "paper" ? "text-amber-800 hover:text-amber-950" : "text-gray-500 hover:text-gray-300"
                                  }`}
                                >
                                  Edit
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className={`text-[10px] font-medium transition-colors cursor-pointer hover:underline ${
                                    theme === "paper" ? "text-red-800 hover:text-red-950" : "text-gray-500 hover:text-red-400"
                                  }`}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
