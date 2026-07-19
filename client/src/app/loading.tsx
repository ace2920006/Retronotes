"use client";

import React, { useState, useEffect } from "react";

export default function RetroLoading() {
  const [progress, setProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowWelcome(true), 150);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const progressBlocks = "█".repeat(Math.floor(progress / 10)) + "░".repeat(10 - Math.floor(progress / 10));

  return (
    <main className="crt-container min-h-screen bg-[#071407] text-[#33ff33] font-mono flex flex-col items-center justify-center p-8 select-none crt-effect crt-flicker">
      <div className="w-80 text-left space-y-4 text-glow font-mono">
        <h1 className="text-3xl font-bold tracking-widest uppercase">RetroNotes OS</h1>
        <div className="space-y-1">
          <p className="text-xs">Loading Modules...</p>
          <p className="text-sm font-bold tracking-widest font-mono">
            {progressBlocks} {progress}%
          </p>
        </div>
        {showWelcome && (
          <p className="text-xl font-bold tracking-widest text-[#66ff66] animate-pulse mt-4">
            Welcome.
          </p>
        )}
      </div>
    </main>
  );
}
