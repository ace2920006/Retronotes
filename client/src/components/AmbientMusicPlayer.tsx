"use client";

import React, { useState } from "react";

interface AmbientMusicPlayerProps {
  songUrl: string;
}

export default function AmbientMusicPlayer({ songUrl }: AmbientMusicPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!songUrl) return null;

  // Helper to parse the song URL type and generate appropriate embed/audio element
  const getPlayerDetails = (url: string) => {
    const trimmed = url.trim();

    // 1. Spotify
    const spotifyRegex = /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/i;
    const spotifyMatch = trimmed.match(spotifyRegex);
    if (spotifyMatch) {
      const type = spotifyMatch[1];
      const id = spotifyMatch[2];
      return {
        type: "spotify",
        embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
        height: 80,
      };
    }

    // 2. YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const youtubeMatch = trimmed.match(youtubeRegex);
    if (youtubeMatch) {
      const id = youtubeMatch[1];
      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`,
        height: 80,
      };
    }

    // 3. SoundCloud
    const soundcloudRegex = /soundcloud\.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+/i;
    if (soundcloudRegex.test(trimmed)) {
      const encodedUrl = encodeURIComponent(trimmed);
      return {
        type: "soundcloud",
        embedUrl: `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ef4444&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
        height: 120,
      };
    }

    // 4. Direct Audio Link
    const directAudioRegex = /\.(mp3|wav|ogg|aac|m4a|mp4)(?:\?.*)?$/i;
    if (directAudioRegex.test(trimmed) || trimmed.includes("audio") || trimmed.includes("drive.google.com/file/d/")) {
      return {
        type: "direct",
        embedUrl: trimmed,
        height: 48,
      };
    }

    // 5. Fallback link
    return {
      type: "link",
      embedUrl: trimmed,
      height: 40,
    };
  };

  const player = getPlayerDetails(songUrl);

  return (
    <div className="w-full my-4 border-2 border-[var(--border-color)] bg-[var(--bg-color)] font-mono text-xs overflow-hidden transition-all duration-300 shadow-md screen-glare">
      {/* Header bar / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2.5 px-4 text-xs font-bold text-[var(--fg-color)] hover:bg-[var(--panel-bg)] transition-colors cursor-pointer select-none text-glow"
      >
        <span className="flex items-center gap-2">
          <span className="inline-block text-sm animate-pulse">🎧</span>
          <span className="uppercase tracking-wider">AMBIENT AUDIO TRACK ATTACHED</span>
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[var(--fg-color)]/70 border border-[var(--border-color)] px-2 py-0.5 hover:border-[var(--accent-color)] hover:text-[var(--fg-color)] transition-colors uppercase tracking-wider font-mono">
          {isOpen ? "[−] HIDE PLAYER" : "[+] LOAD TRACK"}
        </span>
      </button>

      {/* Expanded Player Body */}
      {isOpen && (
        <div className="p-3 bg-[var(--panel-bg)]/80 border-t-2 border-[var(--border-color)] transition-all duration-300">
          {player.type === "direct" ? (
            <div className="py-2 px-1">
              <audio
                src={player.embedUrl}
                controls
                className="w-full h-8 outline-none"
              />
            </div>
          ) : player.type === "link" ? (
            <div className="py-2 text-center">
              <a
                href={player.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="retro-button inline-flex items-center gap-2 px-4 py-2 uppercase text-[11px] font-bold text-glow"
              >
                <span>🎵</span> OPEN EXTERNAL AMBIENT STREAM ↗
              </a>
            </div>
          ) : (
            <iframe
              src={player.embedUrl}
              width="100%"
              height={player.height}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
              loading="lazy"
              className="shadow-inner border border-[var(--border-color)]"
            />
          )}
        </div>
      )}
    </div>
  );
}
