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
  const { addToCart } = useCart();
  
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
      name: product.name,
      price: product.price_inr,
      image: product.images[0],
      quantity: 1,
      size: 'One Size'
    });
    setCartOpen(true);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black sm:py-8 sm:flex sm:justify-center">
      {/* Mobile view is full screen, Desktop view is a centered phone-sized container */}
      <div 
        ref={containerRef}
        className="w-full h-full sm:max-w-[400px] sm:h-[850px] sm:rounded-[40px] sm:border-[8px] sm:border-zinc-900 overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative bg-black shadow-2xl"
      >
        {/* Back Button */}
        <Link href="/" className="absolute top-6 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>

        {reels.map((reel, index) => (
          <div key={reel.id} className="relative w-full h-full snap-start shrink-0 flex items-center justify-center bg-zinc-900">
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              data-index={index}
              src={reel.videoUrl}
              className="absolute inset-0 w-full h-full object-contain"
              loop
              muted={isMuted}
              playsInline
              onClick={(e) => {
                const video = e.currentTarget;
                if (video.paused) video.play();
                else video.pause();
              }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-10">
              <button onClick={toggleMute} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors flex flex-col items-center gap-1">
                <Heart className="w-6 h-6" />
              </button>
              <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Content Info */}
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

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      
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
