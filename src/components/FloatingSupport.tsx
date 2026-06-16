'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mail, X } from 'lucide-react';

export const FloatingSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, currentX: 0, currentY: 0 });

  const whatsappNumber = "919461858955";
  const email = "textileofrajasthan.info@gmail.com";

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragRef.current.startX;
      const newY = e.clientY - dragRef.current.startY;
      
      // If moved more than 5 pixels, consider it a drag (not a click)
      if (Math.abs(newX - dragRef.current.currentX) > 5 || Math.abs(newY - dragRef.current.currentY) > 5) {
        setHasDragged(true);
      }
      
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag by the button, not the menu
    if ((e.target as HTMLElement).closest('.support-menu')) return;
    
    // Capture pointer so dragging works even if cursor leaves the element fast
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    setIsDragging(true);
    setHasDragged(false);
    dragRef.current.startX = e.clientX - position.x;
    dragRef.current.startY = e.clientY - position.y;
    dragRef.current.currentX = position.x;
    dragRef.current.currentY = position.y;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault();
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 touch-none"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onPointerDown={handlePointerDown}
    >
      {/* Support Menu */}
      {isOpen && (
        <div className="support-menu bg-white rounded-2xl shadow-2xl border border-zinc-100 p-3 mb-2 animate-fadeIn flex flex-col gap-2 w-64 origin-bottom-right">
          <div className="px-2 pb-2 border-b border-zinc-100 flex justify-between items-center cursor-default">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Customer Support</h4>
          </div>
          
          <a 
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 hover:bg-green-50 rounded-xl transition-colors group"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900">WhatsApp</span>
              <span className="text-xs text-zinc-500">Fastest response</span>
            </div>
          </a>

          <a 
            href={`mailto:${email}`}
            className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-xl transition-colors group"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900">Email Us</span>
              <span className="text-xs text-zinc-500">For detailed inquiries</span>
            </div>
          </a>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleClick}
        className={`h-14 w-14 bg-zinc-900 text-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-zinc-800 transition-all focus:outline-none ${isDragging ? 'scale-95 cursor-grabbing' : 'hover:scale-105 cursor-grab'}`}
        aria-label="Customer Support"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};
