"use client";

import React, { useEffect, useState } from "react";

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
  const [pixelatedSrc, setPixelatedSrc] = useState<string | null>(null);

  const isImage = image && (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/") ||
    image.startsWith("data:")
  );

  useEffect(() => {
    if (!isImage || !image) {
      setPixelatedSrc(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // Downsample to a small resolution (e.g. 48x48) to create the retro pixelated look
        const PIXEL_SIZE = 48;
        canvas.width = PIXEL_SIZE;
        canvas.height = PIXEL_SIZE;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, PIXEL_SIZE, PIXEL_SIZE);
          setPixelatedSrc(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        console.error("Failed to pixelate avatar image:", err);
        // Fallback to original if drawing fails (e.g. CORS)
        setPixelatedSrc(image);
      }
    };
    img.onerror = () => {
      setPixelatedSrc(image);
    };
  }, [image, isImage]);

  const initial = name ? name.trim().charAt(0).toUpperCase() : "";

  return (
    <div
      className={`rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner select-none ${className}`}
    >
      {isImage ? (
        <img
          src={pixelatedSrc || image}
          alt={name || "User Avatar"}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
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
