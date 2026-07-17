import React from "react";

export default function ProfileLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4 bg-gray-950 text-gray-200">
      <div className="w-full max-w-3xl">
        
        {/* Profile Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 border-b border-gray-900 pb-12">
          <div className="w-28 h-28 rounded-full bg-gray-900 shadow-inner animate-pulse shrink-0" />
          
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
              <div className="h-8 w-44 bg-gray-900 rounded animate-pulse" />
            </div>
            
            <div className="space-y-2 max-w-lg mx-auto md:mx-0">
              <div className="h-4 w-full bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-900 rounded animate-pulse" />
            </div>
            
            <div className="flex justify-center md:justify-start gap-6 text-xs text-gray-500">
              <div className="h-4 w-28 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-900 rounded animate-pulse" />
            </div>
            
            <div className="h-8 w-32 bg-gray-900 rounded-full mx-auto md:mx-0 animate-pulse" />
          </div>
        </div>

        {/* User Posts Title Skeleton */}
        <div className="h-6 w-36 bg-gray-900 rounded-lg mb-8 pl-3 border-l border-gray-800 animate-pulse" />
        
        {/* User Posts Skeleton List */}
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div key={i} className="py-8 border-b border-gray-900 last:border-b-0">
              <div className="flex items-center gap-3 mb-6 text-gray-500 text-xs">
                <div className="h-3.5 w-4 bg-gray-900 rounded animate-pulse" />
                <div className="h-3.5 w-16 bg-gray-900 rounded animate-pulse" />
                <div className="h-3.5 w-20 bg-gray-900 rounded animate-pulse" />
              </div>
              
              <div className="h-6 w-1/2 bg-gray-900 rounded-lg mb-3 pl-4 border-l border-gray-800 animate-pulse" />
              
              <div className="space-y-2 mb-6 pl-4">
                <div className="h-4 w-11/12 bg-gray-900 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-900 rounded animate-pulse" />
              </div>

              <div className="flex gap-4 pl-4 pt-2">
                <div className="h-7 w-14 bg-gray-900 rounded-full animate-pulse" />
                <div className="h-4 w-10 bg-gray-900 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
