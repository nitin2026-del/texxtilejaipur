'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Heart, Share2, ShoppingBag, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartSidebar } from '@/components/CartSidebar';
import Link from 'next/link';

interface ReelProduct {
  id: string;
  name: string;
  price_inr: number;
  images: string[];
}

interface Reel {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  product: ReelProduct | null;
}

export function ReelPlayer({ reels }: { reels: Reel[] }) {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { addToCart, cart } = useCart();
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll snapping to play/pause correct video
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const index = Number(video.dataset.index);
          
          if (entry.isIntersecting) {
            setCurrentReelIndex(index);
            video.play().catch(e => console.log('Autoplay prevented:', e));
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: 0.6 } // Video plays when 60% visible
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [reels]);

  const toggleMute = () => setIsMuted(!isMuted);

  const handleShopClick = (product: ReelProduct) => {
    addToCart({
      id: product.id,
      sku: product.id,
      name: product.name,
      price_inr: product.price_inr,
      images: product.images
    }, 1);
    setCartOpen(true);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black sm:py-8 sm:flex sm:justify-center">
      {/* Mobile view is full screen, Desktop view is a centered phone-sized container */}
      <div 
        ref={containerRef}
        className="w-full h-full sm:max-w-[400px] sm:h-[850px] sm:rounded-[40px] sm:border-[8px] sm:border-zinc-900 overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative bg-black shadow-2xl"
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="relative w-full h-full snap-start snap-always shrink-0 bg-zinc-900">
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              data-index={index}
              src={reel.videoUrl}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
            />

            {/* Overlay UI */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
            
            {/* Top controls */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
              <Link 
                href="/"
                className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              
              <div className="flex gap-2">
                <button 
                  onClick={toggleMute}
                  className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setCartOpen(true)}
                  className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors relative"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-[#D4AF37] rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 w-full p-6 z-10">
              <h2 className="text-white font-bold text-xl mb-2 drop-shadow-md">{reel.title}</h2>
              <p className="text-zinc-200 text-sm mb-6 max-w-[80%] drop-shadow-md line-clamp-2">
                {reel.description}
              </p>

              {/* Product Card / Shop Button */}
              {reel.product && (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 flex items-center gap-4 shadow-xl">
                  <img src={reel.product.images[0]} alt={reel.product.name} className="w-16 h-16 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className="text-black font-bold text-sm line-clamp-1">{reel.product.name}</h3>
                    <p className="text-zinc-600 text-xs mt-1">₹{reel.product.price_inr.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => handleShopClick(reel.product!)}
                    className="bg-[#D4AF37] text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Buy
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => setCartOpen(false)} />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
