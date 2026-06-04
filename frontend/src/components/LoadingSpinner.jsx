import React from 'react';

/**
 * Reusable loading spinner shown during React.lazy Suspense fallbacks
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-indigo-100 dark:from-gray-950 dark:to-gray-900">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
        {/* Spinning arc */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">{message}</p>
      <div className="mt-3 flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
