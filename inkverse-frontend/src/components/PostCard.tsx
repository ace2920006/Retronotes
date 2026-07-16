"use client";

import React, { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import UserAvatar from "./UserAvatar";
import AmbientMusicPlayer from "./AmbientMusicPlayer";

interface PostCardProps {
  post: any;
  token?: string;
  isLoggedIn: boolean;
}

export default function PostCard({ post, token, isLoggedIn }: PostCardProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [hasBookmarked, setHasBookmarked] = useState(post.hasBookmarked || false);
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [heartCoords, setHeartCoords] = useState({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (isPending) return;

    // Trigger pop micro-animation for the small heart icon
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Optimistic UI updates
    const previousHasLiked = hasLiked;
    const previousLikesCount = likesCount;
    
    setHasLiked(!hasLiked);
    setLikesCount(hasLiked ? likesCount - 1 : likesCount + 1);

    startTransition(async () => {
      try {
        if (previousHasLiked) {
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
        router.refresh();
      } catch (error) {
        console.error("Like toggle failed:", error);
        // Rollback on failure
        setHasLiked(previousHasLiked);
        setLikesCount(previousLikesCount);
      }
    });
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (isPending) return;

    const previousHasBookmarked = hasBookmarked;
    setHasBookmarked(!hasBookmarked);

    startTransition(async () => {
      try {
        if (previousHasBookmarked) {
          await fetchAPI(`/bookmarks/${post.id}`, {
            method: "DELETE",
            token,
          });
        } else {
          await fetchAPI(`/bookmarks/${post.id}`, {
            method: "POST",
            token,
          });
        }
        router.refresh();
      } catch (error) {
        console.error("Bookmark toggle failed:", error);
        setHasBookmarked(previousHasBookmarked);
      }
    });
  };

  const triggerDoubleTapLike = (clientX: number, clientY: number, targetElement: HTMLElement) => {
    // Avoid double-tapping on links, buttons, inputs, comments section, etc.
    if (
      targetElement.closest("button") ||
      targetElement.closest("a") ||
      targetElement.closest("input") ||
      targetElement.closest("textarea") ||
      targetElement.closest(".comments-section")
    ) {
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setHeartCoords({ x, y });

    // Show heart pop-up animation
    setShowHeart(true);
    const timer = setTimeout(() => setShowHeart(false), 800);

    // Only like if not already liked
    if (!hasLiked) {
      handleLike();
    }

    return () => clearTimeout(timer);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        triggerDoubleTapLike(touch.clientX, touch.clientY, e.currentTarget);
      }
    }
    lastTapRef.current = now;
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    triggerDoubleTapLike(e.clientX, e.clientY, e.currentTarget);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      className="relative py-10 border-b border-gray-900 last:border-b-0 select-none"
    >
      {/* Heart Animation Overlay */}
      {showHeart && (
        <div
          className="absolute pointer-events-none z-50 text-red-500 text-6xl filter drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-heart-pop"
          style={{ left: `${heartCoords.x}px`, top: `${heartCoords.y}px` }}
        >
          ❤️
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/profile/${post.authorId}`}
          className="flex items-center gap-3 group"
        >
          <UserAvatar
            image={post.author.image}
            name={post.author.name}
            className="w-9 h-9 text-sm group-hover:border-gray-700 transition-colors"
          />
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

      {/* Post Title */}
      {post.title && (
        <h2 className="text-xl font-serif font-semibold text-gray-150 mb-4 pl-4 border-l border-gray-800">
          {post.title}
        </h2>
      )}

      {/* Ambient Music Player */}
      {post.songUrl && <AmbientMusicPlayer songUrl={post.songUrl} />}


      {/* Post Content */}
      <div className="font-serif text-lg leading-relaxed text-gray-200 mb-8 pl-4 pr-2 whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-6 text-gray-400 text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all duration-300 hover:text-red-400 py-1.5 px-3 rounded-full hover:bg-red-500/5 active:scale-90 ${
            hasLiked ? "text-red-500 font-semibold" : "text-gray-400"
          } ${isPending ? "opacity-75 cursor-wait" : "cursor-pointer"}`}
          disabled={isPending}
          title={isLoggedIn ? "Like post" : "Log in to like"}
        >
          <span 
            className={`inline-block transition-transform duration-300 ${
              isAnimating ? "scale-150 rotate-12 text-red-500" : "scale-100"
            }`}
          >
            {hasLiked ? "❤️" : "🤍"}
          </span>
          <span className="text-xs">{likesCount}</span>
        </button>

        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-2 hover:text-blue-400 transition-colors"
        >
          <span>💬</span> {post.commentsCount}
        </Link>

        <button
          onClick={handleBookmark}
          disabled={isPending}
          className={`flex items-center gap-2 hover:text-green-400 transition-colors ml-auto ${
            hasBookmarked ? "text-green-500 font-semibold" : "text-gray-400"
          } ${isPending ? "opacity-75 cursor-wait" : "cursor-pointer"}`}
          title={isLoggedIn ? (hasBookmarked ? "Remove bookmark" : "Bookmark post") : "Log in to bookmark"}
        >
          <span>🔖</span> {hasBookmarked ? "Saved" : "Save"}
        </button>
      </div>

      {/* Quick comments display */}
      {post.comments && post.comments.length > 0 && (
        <div className="comments-section mt-6 pt-4 border-t border-gray-900/60 space-y-3">
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
  );
}
