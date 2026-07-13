"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";

interface LikeButtonProps {
  postId: string;
  initialLikesCount: number;
  initialHasLiked: boolean;
  token?: string;
  isLoggedIn: boolean;
}

export default function LikeButton({
  postId,
  initialLikesCount,
  initialHasLiked,
  token,
  isLoggedIn,
}: LikeButtonProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (isPending) return;

    // Trigger pop micro-animation
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
          await fetchAPI(`/likes/${postId}`, {
            method: "DELETE",
            token,
          });
        } else {
          await fetchAPI(`/likes/${postId}`, {
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

  return (
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
  );
}
