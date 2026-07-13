import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 transition-colors duration-300">
      {/* Fake Scroll Progress Bar placeholder */}
      <div className="fixed top-0 left-0 h-1 bg-gray-900 w-full z-50" />

      <main className="flex flex-col items-center py-16 px-4">
        <div className="w-full max-w-2xl">
          {/* Back link & controls placeholder */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-8 border-b border-gray-900/60 pb-6">
            <div className="h-4 w-24 bg-gray-900 rounded animate-pulse" />
            <div className="h-8 w-48 bg-gray-900/60 rounded-full border border-gray-800/40 animate-pulse" />
          </div>

          {/* Reading Card Skeleton */}
          <article className="p-8 md:p-12 rounded-2xl border border-gray-900 bg-gray-900/10 shadow-2xl">
            {/* Header info skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-gray-900 rounded animate-pulse" />
                  <div className="h-2 w-20 bg-gray-900/70 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-900 rounded-full border border-gray-850 animate-pulse" />
            </div>

            {/* Title skeleton */}
            <div className="h-8 w-2/3 bg-gray-900 rounded-lg animate-pulse mb-8 pl-4 border-l-2 border-gray-800" />

            {/* Post Content skeleton lines (representing formatted text) */}
            <div className="space-y-4 mb-12 pl-4 pr-2">
              <div className="h-4 w-11/12 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-900 rounded animate-pulse" />
              
              <div className="h-4 w-full bg-gray-905 rounded animate-pulse pt-4" /> {/* Paragraph space */}
              
              <div className="h-4 w-5/6 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-900 rounded animate-pulse" />
            </div>

            {/* Post Actions skeleton */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-900/60 text-sm">
              <div className="h-8 w-16 bg-gray-900 rounded-full border border-gray-850 animate-pulse" />
              <div className="h-4 w-12 bg-gray-900 rounded animate-pulse" />
            </div>
          </article>

          {/* Comment Section Skeleton */}
          <section className="mt-16">
            {/* Header skeleton */}
            <div className="h-6 w-32 bg-gray-900 rounded-lg animate-pulse mb-6 pl-3 border-l-2 border-gray-800" />

            {/* New Comment Form placeholder */}
            <div className="h-28 w-full bg-gray-900/20 border border-gray-900 rounded-xl mb-10 animate-pulse" />

            {/* Comment List skeleton items */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 rounded-xl border border-gray-900/30 bg-gray-900/10">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-905 border border-gray-900/60 animate-pulse" />
                      <div className="h-3 w-20 bg-gray-900 rounded animate-pulse" />
                    </div>
                    <div className="h-2.5 w-16 bg-gray-900/70 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-5/6 bg-gray-900/80 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-gray-900/80 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
