import React from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900">
          <h2 className="text-xl font-serif text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-zinc-300 leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
          {content}
        </div>
      </div>
    </div>
  );
};
