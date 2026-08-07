'use client';
import { useState, useEffect } from 'react';
import { X, Sparkles, Mail, MoveRight } from 'lucide-react';

export function GlobalModals() {
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // 1. VIP Modal - Show after 10 seconds if not shown before
    const hasSeenVip = localStorage.getItem('tj_has_seen_vip');
    if (!hasSeenVip) {
      const timer = setTimeout(() => {
        setVipModalOpen(true);
        localStorage.setItem('tj_has_seen_vip', 'true');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // 2. Exit Intent - Show if mouse leaves top of viewport and not shown in this session
    const handleMouseLeave = (e: MouseEvent) => {
      const hasSeenExit = sessionStorage.getItem('tj_has_seen_exit');
      if (e.clientY <= 0 && !hasSeenExit && !vipModalOpen) {
        setExitModalOpen(true);
        sessionStorage.setItem('tj_has_seen_exit', 'true');
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [vipModalOpen]);

  const handleVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    // Real implementation would save email to DB
    setTimeout(() => {
      setVipModalOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* VIP Modal */}
      {vipModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVipModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-[#1A1A1A] flex flex-col md:flex-row overflow-hidden rounded-sm shadow-2xl animate-fade-in border border-zinc-800">
            {/* Image side */}
            <div className="md:w-1/2 relative min-h-[300px] hidden md:block">
              <img 
                src="/heritage_craft.png" 
                alt="Luxury Artisan Jacket"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>
            {/* Content side */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
              <button 
                onClick={() => setVipModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {!subscribed ? (
                <>
                  <div className="flex items-center gap-2 text-[#D4AF37] mb-4">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-semibold tracking-widest uppercase">The Inner Circle</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-tight">
                    Unlock 10% Off Your First Handcrafted Piece
                  </h2>
                  <p className="text-zinc-400 mb-8 font-medium leading-relaxed">
                    Join our exclusive community. Get early access to limited artisan drops, VIP pricing, and a gift on your first order.
                  </p>
                  
                  <form onSubmit={handleVipSubmit} className="flex flex-col gap-3">
                    <input 
                      type="email" 
                      placeholder="Enter your email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                    />
                    <button 
                      type="submit"
                      className="w-full bg-[#D4AF37] text-black font-bold tracking-widest uppercase py-4 flex items-center justify-center gap-2 hover:bg-white transition-colors rounded-sm"
                    >
                      Unlock Access <MoveRight className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-center text-zinc-600 text-xs mt-4">We respect your privacy. No spam.</p>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-serif text-white mb-2">Welcome to the Club</h2>
                  <p className="text-zinc-400">Check your email for your exclusive code!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exit Intent Modal */}
      {exitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setExitModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white p-8 md:p-10 text-center rounded-sm shadow-2xl animate-fade-in border border-zinc-200">
            <button 
              onClick={() => setExitModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-serif text-zinc-900 mb-3">Wait! Don't leave empty-handed.</h2>
            <p className="text-zinc-600 mb-6 font-medium leading-relaxed">
              Complete your purchase today and we'll upgrade your order to <strong className="text-black">Complimentary UPS Express Shipping</strong> worldwide.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setExitModalOpen(false)}
                className="w-full bg-black text-white font-bold tracking-widest uppercase py-4 hover:bg-zinc-800 transition-colors rounded-sm"
              >
                Claim Free Shipping
              </button>
              <button 
                onClick={() => setExitModalOpen(false)}
                className="w-full text-zinc-500 text-sm font-medium hover:text-black transition-colors py-2"
              >
                No thanks, I'll pass
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
