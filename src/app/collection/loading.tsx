import React from 'react';
import { Loader2 } from 'lucide-react';

export default function CollectionLoading() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a1464]" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
          Loading Collection...
        </p>
      </div>
    </main>
  );
}
