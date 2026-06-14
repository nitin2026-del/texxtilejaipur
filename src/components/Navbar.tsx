'use client';

import React, { useState, useEffect } from 'react';
import { useCart, Currency } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Globe, LogOut, Loader2, Sparkles, ChevronDown, Menu, X, Home, Tags, BookOpen, Info, Phone, RefreshCcw } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { InfoModal } from './InfoModal';

interface NavbarProps {
  onCartOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCartOpen }) => {
  const { cart, currency, setCurrency } = useCart();
  const { user, profile, loading, signOut, jaiCoins, userTier, orderCount, setOrderCount } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'blog' | 'about' | 'contact' | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [showCoinsInfo, setShowCoinsInfo] = useState(false);
  const [activePromo, setActivePromo] = useState<{code: string; value: string} | null>(null);
  const [isPromoDismissed, setIsPromoDismissed] = useState(false);

  useEffect(() => {
    const savedCoupons = localStorage.getItem('textilejaipur_admin_coupons');
    if (savedCoupons) {
      try {
        const coupons = JSON.parse(savedCoupons);
        if (coupons.length > 0) {
          const first = coupons[0];
          setActivePromo({
            code: first.code,
            value: first.type === 'percent' ? `${first.value}%` : `₹${first.value}`
          });
        }
      } catch (e) {}
    }
  }, []);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full flex flex-col shadow-sm">
      {activePromo && !isPromoDismissed && (
        <div className="bg-gradient-to-r from-brand-600 via-amber-500 to-brand-600 text-white text-[11px] sm:text-xs py-2 px-4 text-center font-bold tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_4px_15px_rgba(245,158,11,0.3)] border-b border-amber-400/50 w-full relative">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white animate-pulse shrink-0" />
          <span className="drop-shadow-md">
            Use code <span className="bg-white/20 px-2 py-0.5 rounded-md font-mono mx-1.5 border border-white/40 shadow-inner">{activePromo.code}</span> for {activePromo.value} OFF!
          </span>
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white animate-pulse shrink-0" />
          <button 
            onClick={() => setIsPromoDismissed(true)} 
            className="absolute right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss Promo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <nav className="bg-white/90 backdrop-blur-md border-b border-zinc-200 px-6 py-4 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Side: Drawer Toggle & Brand Logo */}
          <div className="flex items-center gap-1 sm:gap-4">
            <a 
              href="/"
              className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-brand-600"
              aria-label="Home"
              title="Home"
            >
              <Home className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>

            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900"
              aria-label="Open Mobile Menu"
              title="Menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <a href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="text-2xl font-serif tracking-wide select-none font-bold text-zinc-900 hidden sm:block">
                TEXTILE <span className="text-brand-600 font-light">JAIPUR</span>
              </div>
            </a>
            
            <div className="hidden lg:flex items-center gap-6 ml-4 border-l border-zinc-200 pl-6">
              <a href="/collection" className="text-sm font-semibold text-zinc-600 hover:text-brand-600 transition-colors flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4" />
                Shop All
              </a>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-4">
            {/* Currency Geopricing Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                aria-label="Change Currency"
                className="flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg px-2.5 py-1.5 transition-colors text-xs text-zinc-800 font-semibold focus:outline-none cursor-pointer shadow-sm"
              >
                <Globe className="h-3.5 w-3.5 text-zinc-500" />
                <span>
                  {currency} ({currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'AED' ? 'د.إ' : 'A$'})
                </span>
                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${isCurrencyOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCurrencyOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsCurrencyOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-zinc-200 rounded-lg shadow-xl py-1.5 z-50 flex flex-col animate-fade-in">
                    {(['USD', 'EUR', 'GBP', 'AED', 'AUD', 'INR'] as Currency[]).map((code) => {
                      const labels: Record<Currency, string> = {
                        USD: 'USD ($)', EUR: 'EUR (€)', GBP: 'GBP (£)',
                        AED: 'AED (د.إ)', AUD: 'AUD (A$)', INR: 'INR (₹)',
                      };
                      return (
                        <button
                          key={code}
                          onClick={() => { setCurrency(code); setIsCurrencyOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                            currency === code 
                              ? 'text-brand-700 bg-zinc-50 font-bold font-sans' 
                              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-sans'
                          }`}
                        >
                          <span>{labels[code]}</span>
                          {currency === code && <span className="h-1 w-1 rounded-full bg-brand-600" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <a href="https://instagram.com/textileofjaipur" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-brand-50 hover:border-brand-200 rounded-lg px-2.5 py-1.5 transition-colors text-xs text-brand-700 font-bold shadow-sm">
              <span className="font-bold">@</span>
              <span>textileofjaipur</span>
            </a>

            <button
              onClick={onCartOpen}
              aria-label="Open Shopping Cart"
              className="p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors relative shadow-sm"
            >
              <ShoppingBag className="h-4 w-4 text-zinc-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {loading ? (
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 shrink-0">
                <Loader2 className="h-3.5 w-3.5 text-zinc-400 animate-spin" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 pl-3 ml-1 border-l border-zinc-200">
                {profile?.role === 'admin' && (
                  <a
                    href="/admin"
                    className="hidden lg:flex px-3 py-1.5 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-all"
                  >
                    Admin Portal
                  </a>
                )}
                <div className="relative">
                  <div 
                    onClick={() => setShowCoinsInfo(!showCoinsInfo)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm cursor-pointer transition-colors ${
                      userTier === 'Platinum' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' :
                      userTier === 'Gold' ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200' :
                      'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
                    }`}
                    title="Your VIP Tier & JaiCoins"
                  >
                    <Sparkles className={`h-3.5 w-3.5 shrink-0 ${userTier === 'Platinum' ? 'text-zinc-300' : userTier === 'Gold' ? 'text-amber-600' : 'text-zinc-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">{userTier} TIER</span>
                    <span className="font-serif font-bold text-sm ml-0.5">{jaiCoins} <span className="text-[9px] font-sans opacity-70">coins</span></span>
                  </div>
                  
                  {showCoinsInfo && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 p-5 rounded-2xl shadow-2xl z-50 animate-fade-in-up">
                      <div className="flex flex-col items-center justify-center mb-4 pb-4 border-b border-zinc-800">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner ${
                          userTier === 'Platinum' ? 'bg-zinc-800 text-zinc-300 border border-zinc-600' :
                          userTier === 'Gold' ? 'bg-amber-900/40 text-amber-500 border border-amber-700/50' :
                          'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}>
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <h4 className="text-white text-lg font-bold font-serif">{userTier} Member</h4>
                        <p className="text-zinc-400 text-xs">Past Purchases: {orderCount}</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                          <span>Status Progress</span>
                          <span>{userTier === 'Silver' ? '1 purchase for Gold' : userTier === 'Gold' ? '1 purchase for Platinum' : 'Max Tier'}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-700">
                          <div 
                            className={`h-full rounded-full transition-all ${userTier === 'Platinum' ? 'bg-zinc-400 w-full' : userTier === 'Gold' ? 'bg-amber-500 w-1/2' : 'bg-zinc-500 w-0'}`} 
                          />
                        </div>
                      </div>

                      <h5 className="text-white text-[10px] uppercase font-bold tracking-wider mb-2 text-brand-400">Your VIP Benefits</h5>
                      <ul className="text-zinc-300 text-xs space-y-2 mb-4">
                        <li className="flex items-start gap-2">
                          <span className="text-brand-500">•</span>
                          <span>Earn 5% Cashback in JaiCoins</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-500">•</span>
                          <span className="text-amber-400 font-bold">Sign-up Bonus: 500 JaiCoins to use on your 1st order!</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-500">•</span>
                          <span>Free Worldwide UPS Express Delivery</span>
                        </li>
                        {userTier === 'Gold' && (
                          <li className="flex items-start gap-2">
                            <span className="text-brand-500">•</span>
                            <span className="text-amber-400 font-bold">10% Extra Discount on All Orders</span>
                          </li>
                        )}
                        {userTier === 'Platinum' && (
                          <li className="flex items-start gap-2">
                            <span className="text-brand-500">•</span>
                            <span className="text-zinc-200 font-bold">15% Extra Discount on All Orders</span>
                          </li>
                        )}
                      </ul>

                      <button
                        onClick={() => setShowCoinsInfo(false)}
                        className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-300 mt-1 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
                <a
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-colors shadow-sm"
                >
                  Dashboard
                </a>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-red-600 shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 transition-colors shadow-sm shrink-0"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal overlay */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

      {/* Info Modals */}
      <InfoModal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title="About Textile Jaipur"
        content={
          <div className="space-y-4">
            <p>Textile Jaipur was born from a desire to bring India's finest handcrafted textiles to the world. We bridge the gap between Jaipur's legendary artisans and discerning customers globally who appreciate authentic craftsmanship.</p>
            <p>Every piece is crafted with meticulous attention to detail, using ethically sourced materials and traditional techniques passed down through generations in Rajasthan.</p>
            <div className="mt-6 pt-6 border-t border-zinc-200">
              <h4 className="text-zinc-900 font-semibold mb-2">Our Mission</h4>
              <p className="text-sm text-zinc-600">To redefine global fashion through timeless Indian design, uncompromising quality, and a commitment to preserving artisanal heritage.</p>
            </div>
          </div>
        }
      />

      <InfoModal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title="Contact Us"
        content={
          <div className="space-y-4">
            <p>We're here to help with any questions about our products, your orders, or styling advice.</p>
            <div className="grid gap-4 mt-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="p-2 rounded-full bg-white text-brand-700 shadow-sm border border-zinc-100">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-zinc-500">Customer Support</div>
                  <div className="text-zinc-900 font-semibold">+91 87646 55537</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="p-2 rounded-full bg-white text-brand-700 shadow-sm border border-zinc-100">
                  <span className="font-bold text-lg leading-none">@</span>
                </div>
                <div>
                  <div className="text-sm text-zinc-500">Instagram</div>
                  <div className="text-zinc-900 font-semibold">@textileofjaipur</div>
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* Mobile/Desktop Drawer Navigation */}
      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      {/* Drawer Panel */}
      <div className={`fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] bg-zinc-950 border-r border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="text-xl font-serif font-bold text-white">TEXTILE <span className="text-gold font-light">JAIPUR</span></h2>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close Mobile Menu"
            className="p-2 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <a href="/" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white font-medium">
            <Home className="h-5 w-5 text-zinc-500" />
            Home
          </a>

          <a href="/collection" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white font-medium">
            <ShoppingBag className="h-5 w-5 text-zinc-500" />
            Shop All Collections
          </a>

          {user && (
            <a href="/dashboard" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white font-medium">
              <Home className="h-5 w-5 text-gold" />
              My Dashboard
            </a>
          )}

          <div className="flex flex-col">
            <button 
              onClick={() => setCategoriesExpanded(!categoriesExpanded)} 
              className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white font-medium w-full"
            >
              <div className="flex items-center gap-4">
                <Tags className="h-5 w-5 text-zinc-500" />
                Categories
              </div>
              <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`} />
            </button>

            {categoriesExpanded && (
              <div className="pl-12 pr-4 py-2 flex flex-wrap gap-2 animate-fade-in">
                {[
                  'Embroidered Jackets',
                  'Boho Dresses',
                  'Banarasi Silk',
                  'Sarees',
                  'Kurtas',
                  'Lehengas',
                  'Sherwanis'
                ].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => {
                      setIsDrawerOpen(false);
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('selectCategory', { detail: cat }));
                        window.location.href = '/#categories';
                      }
                    }}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold tracking-wider rounded-full transition-colors border border-zinc-800"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="h-px bg-zinc-900 my-2 mx-4" />
          
          <a 
            href="/blog"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white font-medium w-full text-left"
          >
            <BookOpen className="h-5 w-5 text-zinc-500" />
            Blog
          </a>

          <a 
            href="/returns"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white font-medium w-full text-left"
          >
            <RefreshCcw className="h-5 w-5 text-zinc-500" />
            Returns Portal
          </a>
          
          <button 
            onClick={() => { setIsDrawerOpen(false); setActiveModal('about'); }}
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white font-medium w-full text-left"
          >
            <Info className="h-5 w-5 text-zinc-500" />
            About
          </button>
          
          <button 
            onClick={() => { setIsDrawerOpen(false); setActiveModal('contact'); }}
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white font-medium w-full text-left"
          >
            <Phone className="h-5 w-5 text-zinc-500" />
            Contact
          </button>
          
          <div className="h-px bg-zinc-900 my-2 mx-4" />
          
          <button 
            onClick={() => { setIsDrawerOpen(false); onCartOpen(); }}
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-gold hover:text-gold-light font-medium w-full text-left mt-auto bg-gold/5 border border-gold/10"
          >
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {cartCount > 0 && (
              <span className="ml-auto bg-gold text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        
        {user && profile?.role === 'admin' && (
          <div className="p-4 border-t border-zinc-900">
            <a href="/admin" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-950/30 border border-violet-800/80 hover:bg-violet-900/40 text-violet-300 hover:text-white font-semibold transition-all">
              Admin Portal
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
