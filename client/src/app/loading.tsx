import React from "react";

export default function RetroLoading() {
  return (
    <main className="crt-container min-h-screen bg-[#071407] text-[#33ff33] font-mono flex flex-col items-center justify-center p-8 select-none crt-effect crt-flicker">
      <div className="text-center space-y-3 text-glow">
        <span className="text-5xl animate-bounce inline-block">📟</span>
        <h1 className="text-2xl font-bold uppercase tracking-widest">RETRONOTES KERNEL</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Loading system sectors...</p>
        <div className="inline-block w-4 h-4 bg-[#33ff33] animate-pulse mt-4"></div>
      </div>
    </main>
  );
}
