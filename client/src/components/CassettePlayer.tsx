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
  const [prevVolume, setPrevVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [tapeCounter, setTapeCounter] = useState(124);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStation = STATION_PRESETS[currentStationIdx];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Tape Counter Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !loading) {
      interval = setInterval(() => {
        setTapeCounter((prev) => (prev >= 999 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, loading]);

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

  const formatCounter = (num: number) => {
    return String(num).padStart(3, "0");
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
      <div className="relative w-full border-2 border-[var(--border-color)] bg-black/80 flex flex-col justify-between p-2 overflow-hidden rounded-none shadow-inner">
        {/* Corner Screw heads */}
        <div className="absolute top-1 left-1.5 text-[8px] opacity-40">⊕</div>
        <div className="absolute top-1 right-1.5 text-[8px] opacity-40">⊕</div>
        <div className="absolute bottom-1 left-1.5 text-[8px] opacity-40">⊕</div>
        <div className="absolute bottom-1 right-1.5 text-[8px] opacity-40">⊕</div>

        {/* Cassette Label Header */}
        <div className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] py-1 px-2 text-center select-none text-[10px] text-glow relative">
          <div className="flex items-center justify-between text-[8px] opacity-75 font-mono mb-0.5">
            <span>TYPE II / HIGH BIAS</span>
            <span className="text-[var(--accent-color)] font-bold">C-90 STEREO</span>
          </div>
          <p className="font-bold uppercase tracking-wider truncate text-[11px]" style={{ color: "var(--fg-color)" }}>
            {isPlaying ? "📼 PLAYING DECK" : "📼 TAPE DECK STOPPED"}
          </p>
          <p className="text-[9px] opacity-70 truncate font-mono">
            {loading ? "TUNING STREAM..." : currentStation.name}
          </p>
        </div>

        {/* Tape Reels & Window Visual */}
        <div className="flex justify-between items-center my-2.5 px-3 relative">
          {/* Left Reel & Tape Ribbon */}
          <div className="relative flex items-center justify-center">
            {/* Magnetic Tape Wound Disk (Left Side) */}
            <div
              className="absolute rounded-full bg-amber-950/80 border border-amber-900/60 transition-all duration-1000"
              style={{
                width: isPlaying ? "42px" : "46px",
                height: isPlaying ? "42px" : "46px",
              }}
            />
            {/* Left Rotating Reel Hub */}
            <div className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] bg-zinc-950 flex items-center justify-center relative z-10 shadow-xs">
              <div
                className={`w-7 h-7 rounded-full border border-dashed border-[var(--fg-color)] flex items-center justify-center ${
                  isPlaying && !loading ? "animate-spin-cassette" : ""
                }`}
              >
                {/* 3-Spoke Reel Teeth */}
                <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                  <div className="absolute w-full h-0.5 bg-[var(--border-color)]" />
                  <div className="absolute w-full h-0.5 bg-[var(--border-color)] rotate-60" />
                  <div className="absolute w-full h-0.5 bg-[var(--border-color)] -rotate-60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black z-10 border border-[var(--border-color)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Center Cassette Viewing Window & Counter */}
          <div className="flex-1 mx-2 h-10 border border-[var(--border-color)] bg-black/90 flex flex-col items-center justify-center relative overflow-hidden text-[9px]">
            {/* Magnetic Tape Ribbon Span */}
            <div className="absolute top-2 left-0 right-0 h-1 bg-amber-900/80 border-y border-amber-950" />

            {/* Tape Counter Ticker Display */}
            <div className="flex items-center gap-1 font-mono font-bold text-[10px] text-[var(--accent-color)] z-10 bg-black/80 px-1.5 py-0.5 border border-[var(--border-color)]/50">
              <span className="text-[8px] text-gray-400">TAPE:</span>
              <span className="tracking-widest font-mono text-glow">
                {formatCounter(tapeCounter)}
              </span>
            </div>

            {/* Status indicator */}
            <span className="text-[8px] opacity-70 mt-0.5 uppercase z-10 font-bold">
              {loading ? "LOAD" : isPlaying ? "● REC/PLAY" : "PAUSED"}
            </span>
          </div>

          {/* Right Reel & Tape Ribbon */}
          <div className="relative flex items-center justify-center">
            {/* Magnetic Tape Wound Disk (Right Side) */}
            <div
              className="absolute rounded-full bg-amber-950/80 border border-amber-900/60 transition-all duration-1000"
              style={{
                width: isPlaying ? "44px" : "38px",
                height: isPlaying ? "44px" : "38px",
              }}
            />
            {/* Right Rotating Reel Hub */}
            <div className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] bg-zinc-950 flex items-center justify-center relative z-10 shadow-xs">
              <div
                className={`w-7 h-7 rounded-full border border-dashed border-[var(--fg-color)] flex items-center justify-center ${
                  isPlaying && !loading ? "animate-spin-cassette" : ""
                }`}
              >
                {/* 3-Spoke Reel Teeth */}
                <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                  <div className="absolute w-full h-0.5 bg-[var(--border-color)]" />
                  <div className="absolute w-full h-0.5 bg-[var(--border-color)] rotate-60" />
                  <div className="absolute w-full h-0.5 bg-[var(--border-color)] -rotate-60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black z-10 border border-[var(--border-color)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LED VU Meter Audio Level Visualizer */}
        <div className="mt-1 pt-1.5 border-t border-[var(--border-color)]/40 flex items-center justify-between px-2 text-[9px] font-mono">
          <span className="opacity-70">VU METER</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => {
              const isActive = isPlaying && !loading;
              const isHigh = i > 4;
              return (
                <div
                  key={i}
                  className={`w-2 h-2 border transition-all duration-150 ${
                    isActive
                      ? isHigh
                        ? "bg-red-500 border-red-300 animate-pulse"
                        : "bg-green-500 border-green-300 animate-pulse"
                      : "bg-gray-800 border-gray-600 opacity-40"
                  }`}
                  style={{
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Track Station Genre Bar */}
      <div className="border border-[var(--border-color)]/40 p-1.5 bg-[var(--panel-bg)]/60 text-[9px] flex justify-between items-center text-glow font-mono">
        <span className="truncate">GENRE: {currentStation.genre}</span>
        <span className="shrink-0 uppercase font-bold text-yellow-400 animate-pulse">
          {loading ? "TUNING..." : isPlaying ? "FM 108.0 MHz" : "MUTED"}
        </span>
      </div>

      {/* Cassette Deck Controls */}
      <div className="flex gap-2">
        <button
          onClick={handlePlayPause}
          disabled={loading}
          className={`flex-1 retro-button py-1 text-[10px] font-bold uppercase tracking-wider crt-glitch-hover ${
            isPlaying && !loading ? "bg-[var(--border-color)] text-[var(--bg-color)]" : ""
          }`}
          title="Play or Pause ambient stream"
        >
          {loading ? "LOAD..." : isPlaying ? "■ PAUSE DECK" : "▶ PLAY TAPE"}
        </button>
        <button
          onClick={handleNext}
          className="retro-button px-3 py-1 text-[10px] font-bold crt-glitch-hover"
          title="Tuning next lofi station"
        >
          ⏭ NEXT
        </button>
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-2 select-none text-[9px]">
        <span className="font-bold opacity-80">VOL:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 accent-[var(--accent-color)] h-1.5 bg-[var(--panel-bg)] cursor-pointer"
          title="Volume Control"
        />
        <span className="w-6 text-right font-bold text-[var(--accent-color)]">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
