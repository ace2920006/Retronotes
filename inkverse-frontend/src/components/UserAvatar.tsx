import React from "react";

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  className?: string;
  fallbackEmoji?: string;
}

export default function UserAvatar({
  image,
  name,
  className = "w-10 h-10 text-base",
  fallbackEmoji = "✒️",
}: UserAvatarProps) {
  const isImage = image && (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/") ||
    image.startsWith("data:")
  );

  const initial = name ? name.trim().charAt(0).toUpperCase() : "";

  return (
    <div
      className={`rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner select-none ${className}`}
    >
      {isImage ? (
        <img
          src={image}
          alt={name || "User Avatar"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-gray-400 font-serif leading-none">
          {image || initial || fallbackEmoji}
        </span>
      )}
    </div>
  );
}
