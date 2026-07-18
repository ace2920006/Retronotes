"use client";

import React, { useState, useRef, useEffect } from "react";
import { playToggleBeep } from "@/lib/retroAudio";

interface StreamPreset {
  name: string;
  url: string;
  genre: string;
}

const STATION_PRESETS: StreamPreset[] = [
  {
    name: "Lofi Study Deck",
    url: "https://stream.zeno.fm/0r0xa792kwzuv",
    genre: "Lofi Beats",
  },
  {
    name: "Synthwave Highway",
    url: "https://stream.zeno.fm/h92942gda0hvv",
    genre: "Synthwave / Chillwave",
  },
  {
    name: "Vintage Jazz Cafe",
    url: "https://stream.zeno.fm/779836936302",
    genre: "Soft Jazz Classics",
  },
];

export default function CassettePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStation = STATION_PRESETS[currentStationIdx];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle stream source switch
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      setLoading(true);
      audioRef.current.src = currentStation.url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setLoading(false))
        .catch((e) => {
          console.warn("Playback interrupted or failed: ", e);
          setIsPlaying(false);
          setLoading(false);
        });
    }
  }, [currentStationIdx]);

  const handlePlayPause = () => {
    playToggleBeep();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setLoading(true);
      audioRef.current.src = currentStation.url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setLoading(false);
        })
        .catch((e) => {
          console.error("Audio play failed: ", e);
          setIsPlaying(false);
          setLoading(false);
        });
    }
  };

  const handleNext = () => {
    playToggleBeep();
    setCurrentStationIdx((prev) => (prev + 1) % STATION_PRESETS.length);
  };

  return (
    <div className="p-3 border-2 border-[var(--border-color)] bg-[var(--bg-color)] font-mono text-xs space-y-3 shadow-md screen-glare select-none">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentStation.url}
        preload="none"
        crossOrigin="anonymous"
      />

      {/* Cassette Tape Visual representation */}
      <div className="relative w-full h-24 border-2 border-[var(--border-color)] bg-black/60 flex flex-col justify-between p-2 overflow-hidden">
        {/* Screw heads */}
        <div className="absolute top-1 left-1 text-[8px] opacity-40">⊕</div>
        <div className="absolute top-1 right-1 text-[8px] opacity-40">⊕</div>
        <div className="absolute bottom-1 left-1 text-[8px] opacity-40">⊕</div>
        <div className="absolute bottom-1 right-1 text-[8px] opacity-40">⊕</div>

        {/* Cassette Label */}
        <div className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] py-1 px-2 text-center select-none text-[10px] text-glow">
          <p className="font-bold uppercase tracking-wider truncate">
            {isPlaying ? "📼 PLAYING DECK" : "📼 TAPE DECK STOP"}
          </p>
          <p className="text-[9px] opacity-60 truncate">
            {loading ? "LOAD..." : currentStation.name}
          </p>
        </div>

        {/* Tape Reels Visual */}
        <div className="flex justify-around items-center my-1 relative">
          {/* Left Reel */}
          <div className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] border-dashed bg-zinc-900 flex items-center justify-center relative">
            <div
              className={`w-7 h-7 rounded-full border border-[var(--border-color)] border-dotted flex items-center justify-center ${
                isPlaying && !loading ? "animate-spin-cassette" : ""
              }`}
            >
              {/* Spindle teeth */}
              <div className="w-2 h-2 rounded-full bg-[var(--border-color)]"></div>
            </div>
          </div>

          {/* Center Window */}
          <div className="w-12 h-6 border border-[var(--border-color)] bg-black/80 flex items-center justify-center text-[9px] text-gray-500">
            {isPlaying ? "SPIN" : "STOP"}
          </div>

          {/* Right Reel */}
          <div className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] border-dashed bg-zinc-900 flex items-center justify-center relative">
            <div
              className={`w-7 h-7 rounded-full border border-[var(--border-color)] border-dotted flex items-center justify-center ${
                isPlaying && !loading ? "animate-spin-cassette" : ""
              }`}
            >
              {/* Spindle teeth */}
              <div className="w-2 h-2 rounded-full bg-[var(--border-color)]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="border border-[var(--border-color)]/30 p-1.5 bg-[var(--panel-bg)]/40 text-[9px] flex justify-between items-center text-glow">
        <span className="truncate">STATION: {currentStation.genre}</span>
        <span className="shrink-0 uppercase font-bold text-yellow-500 animate-pulse">
          {loading ? "TUNING..." : isPlaying ? "FM 108.0" : "MUTED"}
        </span>
      </div>

      {/* Cassette Deck Controls */}
      <div className="flex gap-2">
        <button
          onClick={handlePlayPause}
          disabled={loading}
          className={`flex-1 retro-button py-1 text-[10px] font-bold uppercase tracking-wider ${
            isPlaying && !loading ? "bg-[var(--border-color)] text-[var(--bg-color)]" : ""
          }`}
          title="Play or Pause ambient stream"
        >
          {loading ? "LOAD..." : isPlaying ? "■ STOP" : "▶ PLAY"}
        </button>
        <button
          onClick={handleNext}
          className="retro-button px-2.5 py-1 text-[10px]"
          title="Tuning next lofi station"
        >
          ⏭ NEXT
        </button>
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-2 select-none text-[9px]">
        <span>VOL:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 accent-[var(--accent-color)] h-1 bg-[var(--panel-bg)]"
          title="Volume Control"
        />
        <span className="w-6 text-right">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
