'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('PRODUCT PAGE ERROR BOUNDARY CAUGHT:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-red-50">
      <h2 className="text-2xl font-bold text-red-700 mb-4">Something went wrong!</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200 max-w-2xl w-full text-left overflow-auto">
        <p className="font-mono text-sm text-red-600 font-bold mb-2">Error Message:</p>
        <p className="font-mono text-sm text-zinc-800 mb-4">{error.message}</p>
        
        <p className="font-mono text-sm text-red-600 font-bold mb-2">Stack Trace:</p>
        <pre className="font-mono text-xs text-zinc-600 whitespace-pre-wrap">{error.stack}</pre>
      </div>
      <button
        className="mt-8 px-6 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
