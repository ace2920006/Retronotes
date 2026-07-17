import React from "react";

export default function FeedLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <header className="mb-12 text-center max-w-xl w-full flex flex-col items-center">
        <h1 className="text-5xl font-serif font-bold text-gray-105 mb-3 tracking-wide animate-pulse">
          InkVerse
        </h1>
        <p className="text-gray-400 font-light italic text-lg mb-8">
          Where Stories Meet Souls
        </p>
        
        {/* Session Greeting placeholder */}
        <div className="h-9 w-64 bg-gray-900/60 rounded-full animate-pulse mb-4" />
      </header>

      {/* Search Bar Skeleton */}
      <div className="w-full max-w-2xl mb-6 flex gap-3">
        <div className="flex-1 h-11 bg-gray-900 border border-gray-800 rounded-full animate-pulse" />
        <div className="w-24 h-11 bg-gray-900 rounded-full animate-pulse" />
      </div>

      {/* Category Chips Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-6 mb-8 max-w-2xl w-full justify-start md:justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-16 bg-gray-900 border border-gray-800 rounded-full animate-pulse shrink-0" />
        ))}
      </div>

      {/* Feed Posts Skeleton List */}
      <div className="w-full max-w-2xl space-y-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-10 border-b border-gray-900 last:border-b-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-900 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-gray-900 rounded animate-pulse" />
                  <div className="h-2.5 w-16 bg-gray-900/60 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-900 rounded-full animate-pulse" />
            </div>

            {/* Title Line */}
            <div className="h-6 w-2/3 bg-gray-900 rounded-lg mb-4 pl-4 border-l border-gray-800 animate-pulse" />

            {/* Content Rows */}
            <div className="space-y-3 mb-8 pl-4 pr-2">
              <div className="h-4 w-11/12 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-900 rounded animate-pulse" />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-6 pt-2">
              <div className="h-7 w-16 bg-gray-900 rounded-full animate-pulse" />
              <div className="h-4 w-12 bg-gray-900 rounded animate-pulse" />
              <div className="h-6 w-14 bg-gray-900 rounded-full ml-auto animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
