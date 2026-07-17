"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";

interface EditProfileModalProps {
  profile: {
    id: string;
    name: string | null;
    bio: string | null;
    image: string | null;
    songUrl: string | null;
  };
  token: string;
  onClose: () => void;
}

export default function EditProfileModal({ profile, token, onClose }: EditProfileModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [songUrl, setSongUrl] = useState(profile.songUrl || "");
  const [imagePreview, setImagePreview] = useState<string | null>(profile.image);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resize and crop to square base64 JPEG client-side
  const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          // Crop to square center
          const size = Math.min(width, height);
          canvas.width = MAX_WIDTH;
          canvas.height = MAX_HEIGHT;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          const sourceX = (width - size) / 2;
          const sourceY = (height - size) / 2;
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            size,
            size, // Source square
            0,
            0,
            MAX_WIDTH,
            MAX_HEIGHT // Destination square
          );

          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to image files
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    try {
      setError(null);
      const compressedBase64 = await resizeAndCompressImage(file);
      setImagePreview(compressedBase64);
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process image. Please try another one.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await fetchAPI(`/users/${profile.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || null,
          songUrl: songUrl.trim() || null,
          image: imagePreview,
        }),
      });

      router.refresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || "An error occurred while saving profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage = imagePreview && (
    imagePreview.startsWith("http") || 
    imagePreview.startsWith("/") || 
    imagePreview.startsWith("data:")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all duration-300">
      <div 
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif font-bold text-gray-100">Edit Profile</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-200 text-sm p-1.5 hover:bg-gray-800 rounded-full transition-all"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-xs text-red-200">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div 
              onClick={() => !isSaving && fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-gray-950 border border-gray-800 hover:border-gray-600 flex items-center justify-center text-3xl cursor-pointer overflow-hidden shadow-inner group transition-all"
            >
              {isImage ? (
                <img 
                  src={imagePreview as string} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" 
                />
              ) : (
                <span className="text-gray-500 group-hover:opacity-75 transition-opacity">
                  {imagePreview || "🌙"}
                </span>
              )}
              
              {!isSaving && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-200 font-medium tracking-wide uppercase transition-all duration-200">
                  📸 Edit
                </div>
              )}
            </div>
            
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSaving}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => !isSaving && fileInputRef.current?.click()}
                className="text-[10px] bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full font-medium transition-all"
                disabled={isSaving}
              >
                Choose Photo
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[10px] bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 text-red-300 px-3 py-1 rounded-full font-medium transition-all"
                  disabled={isSaving}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-500">Square layout. Auto-resized to 256px.</p>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Writer Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sylvia Plath"
              required
              disabled={isSaving}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-750 transition-all font-light text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Writer Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the Verse about yourself..."
              rows={4}
              maxLength={250}
              disabled={isSaving}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-750 transition-all font-light text-sm resize-none"
            />
            <div className="text-right text-[10px] text-gray-500 mt-1">
              {bio.length}/250 characters
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              🎵 Profile Theme Song URL
            </label>
            <input
              type="text"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              placeholder="Spotify, YouTube, SoundCloud, or direct audio link"
              disabled={isSaving}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-750 transition-all font-light text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1.5 leading-normal">
              Attach a soundtrack to your profile. Paste a Spotify, YouTube, SoundCloud, or direct audio file URL.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-950">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 bg-gray-950 border border-gray-850 hover:bg-gray-900 text-gray-400 hover:text-white rounded-full text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-white hover:bg-gray-200 text-gray-950 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="w-3 h-3 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
