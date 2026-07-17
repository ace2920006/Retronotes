"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  token?: string;
  isLoggedIn: boolean;
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  token,
  isLoggedIn,
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (isPending) return;

    const previousIsFollowing = isFollowing;
    setIsFollowing(!isFollowing);

    startTransition(async () => {
      try {
        if (previousIsFollowing) {
          await fetchAPI(`/follows/${targetUserId}`, {
            method: "DELETE",
            token,
          });
        } else {
          await fetchAPI(`/follows/${targetUserId}`, {
            method: "POST",
            token,
          });
        }
        router.refresh();
      } catch (error) {
        console.error("Follow toggle failed:", error);
        setIsFollowing(previousIsFollowing);
      }
    });
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`px-6 py-2 border rounded-full transition-all duration-300 text-xs font-semibold active:scale-95 flex items-center justify-center gap-1.5 shadow-sm min-w-[120px] ${
        isFollowing
          ? "bg-gray-900 border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-900/40 hover:bg-red-950/20 cursor-pointer"
          : "bg-white border-transparent text-gray-950 hover:bg-gray-200 cursor-pointer"
      } ${isPending ? "opacity-75 cursor-wait" : ""}`}
    >
      {isPending ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : isFollowing ? (
        "Unfollow"
      ) : (
        "Follow Writer"
      )}
    </button>
  );
}
