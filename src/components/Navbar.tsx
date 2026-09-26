'use client';

import React, { useState, useEffect } from 'react';
import { useCart, Currency } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { LogOut, Loader2, Sparkles, ChevronDown, X, Tags, BookOpen, Phone, Truck, Undo2, Heart, Plane } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { InfoModal } from './InfoModal';
import { sortCategoriesCustom } from '@/utils/categorySort';

/* ─── Beautiful Custom SVG Icon Components ─── */
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="16" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const IconShopAll = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const IconReviews = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const IconTrackOrder = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IconAboutUs = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const IconArtisanEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const IconBag = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconRefreshCcw = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
  </svg>
);

const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

/* ─── Elegant Nav Link with Animated Underline ─── */
const NavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    className="group relative flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
  >
    <span className="text-zinc-400 group-hover:text-brand-600 transition-colors duration-300">{icon}</span>
    <span>{label}</span>
    <span className="absolute -bottom-[18px] left-0 right-0 h-[2px] bg-gradient-to-r from-brand-400 to-brand-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
  </a>
);

interface NavbarProps {
  onCartOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCartOpen }) => {
  const { cart, currency, setCurrency, formatPrice } = useCart();
  const { user, profile, loading, signOut, userTier, orderCount, setOrderCount } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'blog' | 'about' | 'contact' | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [activePromo, setActivePromo] = useState<{code: string; value: string} | null>(null);
  const [isPromoDismissed, setIsPromoDismissed] = useState(false);
  const [trustIndex, setTrustIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  
  const trustMessages = [
    { icon: <Plane className="h-3.5 w-3.5" />, text: "Worldwide Express Shipping" },
    { icon: <Undo2 className="h-3.5 w-3.5" />, text: "Returns (Damaged/Wrong Items Only)" },
    { icon: <Heart className="h-3.5 w-3.5" />, text: "Handcrafted with love in Jaipur" }
  ];
  const [navCategories, setNavCategories] = useState<string[]>([
    'Embroidered Jackets',
    'Boho Dresses',
    'Banarasi Silk',
    'Sarees'
  ]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cached = localStorage.getItem('textilejaipur_collection_categories');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setNavCategories(parsed.filter((c: string) => c !== 'All'));
          }
        }
      } catch (e) {}

      try {
        const { data } = await supabase.from('categories').select('name');
        if (data && data.length > 0) {
          const catList = data.map(d => d.name).filter(Boolean);
          const sortedCatList = sortCategoriesCustom(catList);
          setNavCategories(sortedCatList);
        }
      } catch (err) {
        console.error('Failed to fetch navbar categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .not('code', 'ilike', 'VIP10-%')
          .not('code', 'ilike', 'SYS_%')
          .limit(1)
          .maybeSingle();
          
        if (data && !error) {
          setActivePromo({
            code: data.code,
            value: data.discount_type === 'percentage' ? `${data.discount_value}%` : `₹${data.discount_value}`
          });
        }
      } catch (e) {
        console.error('Error fetching promo', e);
      }
    };
    fetchPromo();

    const interval = setInterval(() => {
      setTrustIndex((prev) => (prev + 1) % trustMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [trustMessages.length]);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  const currencyFlags: Record<Currency, string> = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', AED: '🇦🇪',
    AUD: '🇦🇺', NZD: '🇳🇿', CAD: '🇨🇦', INR: '🇮🇳',
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-40 w-full flex flex-col">
      {/* ─── Promo Banner ─── */}
      {activePromo && !isPromoDismissed && (
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 text-white text-[11px] sm:text-xs py-2.5 px-4 text-center font-semibold tracking-wider uppercase flex items-center justify-center gap-3 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)] animate-[shimmer_3s_infinite]" />
          <Sparkles className="h-3.5 w-3.5 text-amber-200 animate-pulse shrink-0 relative z-10" />
          <span className="relative z-10">
            Use code <span className="bg-white/15 px-2.5 py-0.5 rounded font-mono mx-1.5 border border-white/25 text-amber-100 font-bold">{activePromo.code}</span> for {activePromo.value} OFF!
          </span>
          <Sparkles className="h-3.5 w-3.5 text-amber-200 animate-pulse shrink-0 relative z-10" />
          <button 
            onClick={() => setIsPromoDismissed(true)} 
            className="absolute right-4 text-white/60 hover:text-white transition-colors z-10"
            aria-label="Dismiss Promo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ─── Trust Bar ─── */}
      <div className="bg-zinc-950 text-zinc-300 text-[10px] sm:text-[11px] font-medium tracking-[0.15em] uppercase py-1.5 px-4 text-center w-full flex items-center justify-center overflow-hidden">
        <div className="flex items-center gap-2.5 animate-fade-in" key={trustIndex}>
          <span className="text-brand-400">{trustMessages[trustIndex].icon}</span>
          <span className="text-zinc-400">{trustMessages[trustIndex].text}</span>
        </div>
      </div>

      {/* ─── Main Navigation ─── */}
      <nav className={`bg-white/95 backdrop-blur-xl border-b px-4 sm:px-8 w-full transition-all duration-300 ${scrolled ? 'py-2.5 border-zinc-200 shadow-lg shadow-black/[0.03]' : 'py-3.5 border-zinc-100'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Menu + Brand + Nav Links */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 active:bg-zinc-200 transition-all text-zinc-500 hover:text-zinc-800"
              aria-label="Open Menu"
              title="Menu"
            >
              <IconMenu />
            </button>

            <a href="/" className="flex items-center gap-2 group cursor-pointer select-none">
              <div className="text-xl sm:text-2xl font-serif tracking-wide font-bold text-zinc-900">
                TEXTILE <span className="text-brand-600 font-light">JAIPUR</span>
              </div>
            </a>
            
            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-7 ml-6 pl-6 border-l border-zinc-200/80">
              <NavLink href="/collection" icon={<IconShopAll />} label="Shop All" />
              <NavLink href="/reviews" icon={<IconReviews />} label="Reviews" />
              <NavLink href="/track-order" icon={<IconTrackOrder />} label="Track Order" />
              <NavLink href="/about" icon={<IconAboutUs />} label="About Us" />
              <NavLink href="/the-artisan-edit" icon={<IconArtisanEdit />} label="The Artisan Edit" />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                aria-label="Change Currency"
                className="flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 rounded-full px-3 py-1.5 transition-all text-xs text-zinc-700 font-medium focus:outline-none cursor-pointer border border-zinc-200/80"
              >
                <IconGlobe />
                <span className="hidden sm:inline">
                  {currency} ({currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'AED' ? 'د.إ' : currency === 'AUD' ? 'A$' : currency === 'NZD' ? 'NZ$' : currency === 'CAD' ? 'C$' : '₹'})
                </span>
                <span className="sm:hidden text-[10px]">{currency}</span>
                <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${isCurrencyOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCurrencyOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsCurrencyOpen(false)} 
                  />
                  <div className="absolute right-0 mt-3 w-52 bg-white border border-zinc-100 rounded-2xl shadow-2xl shadow-black/10 py-2 z-50 flex flex-col animate-fade-in overflow-hidden">
                    <div className="px-3.5 pb-2 mb-1 border-b border-zinc-100">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Select Currency</p>
                    </div>
                    {(['USD', 'EUR', 'GBP', 'AED', 'AUD', 'NZD', 'CAD', 'INR'] as Currency[]).map((code) => {
                      const labels: Record<Currency, string> = {
                        USD: 'US Dollar ($)', EUR: 'Euro (€)', GBP: 'Pound (£)',
                        AED: 'Dirham (د.إ)', AUD: 'AUD (A$)', NZD: 'NZD (NZ$)',
                        CAD: 'CAD (C$)', INR: 'Rupee (₹)',
                      };
                      return (
                        <button
                          key={code}
                          onClick={() => { setCurrency(code); setIsCurrencyOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 text-xs transition-all flex items-center gap-2.5 ${
                            currency === code 
                              ? 'text-brand-700 bg-brand-50/60 font-semibold' 
                              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                          }`}
                        >
                          <span className="text-sm">{currencyFlags[code]}</span>
                          <span className="flex-1">{labels[code]}</span>
                          {currency === code && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                        </button>
                      );
                    })}
                    <div className="px-3.5 py-2.5 mt-1 border-t border-zinc-100 bg-zinc-50/50">
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        We ship <strong className="text-zinc-600">worldwide</strong>. Checkout comfortably in any currency.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Instagram Badge */}
            <a 
              href="https://instagram.com/textileofjaipur" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-full px-2 sm:px-3 py-1.5 transition-all text-xs font-semibold border border-pink-200/60 hover:border-pink-300/80 group"
            >
              <span className="text-pink-500 group-hover:text-pink-600 transition-colors"><IconInstagram /></span>
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">textileofjaipur</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={onCartOpen}
              aria-label="Open Shopping Cart"
              className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 transition-all relative border border-zinc-200/80 group"
            >
              <span className="text-zinc-500 group-hover:text-zinc-700 transition-colors"><IconBag size={17} /></span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-[18px] min-w-[18px] rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[9px] font-bold text-white shadow-md shadow-brand-600/30 ring-2 ring-white px-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 shrink-0">
                <Loader2 className="h-3.5 w-3.5 text-zinc-400 animate-spin" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 pl-3 ml-1 border-l border-zinc-200">
                {profile?.role === 'admin' && (
                  <a
                    href="/admin"
                    className="flex px-3 py-1.5 rounded-full border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-all"
                  >
                    Admin
                  </a>
                )}
                <div className="relative">
                  <div 
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-sm cursor-pointer transition-all ${
                      userTier === 'Platinum' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' :
                      userTier === 'Gold' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' :
                      'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                    title="Your VIP Tier"
                  >
                    <Sparkles className={`h-3.5 w-3.5 shrink-0 ${userTier === 'Platinum' ? 'text-zinc-300' : userTier === 'Gold' ? 'text-amber-500' : 'text-zinc-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">{userTier}</span>
                  </div>
                </div>
                <a
                  href="/dashboard"
                  className="hidden sm:flex px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 text-xs font-semibold transition-colors"
                >
                  Dashboard
                </a>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl hover:bg-red-50 transition-all text-zinc-400 hover:text-red-500 shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden"></div>
            )}
          </div>
        </div>
      </nav>

      {/* Info Modals */}
      <InfoModal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title="Contact Us"
        content={
          <div className="space-y-4">
            <p>We're here to help with any questions about our products, your orders, or styling advice.</p>
            <div className="grid gap-4 mt-6">
              <a href="tel:+919461858955" className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors border border-zinc-200">
                <div className="p-2 rounded-full bg-white text-brand-700 shadow-sm border border-zinc-100">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-zinc-500">Call Us</div>
                  <div className="text-zinc-900 font-semibold">+91 94618 58955</div>
                </div>
              </a>
              <a href="https://wa.me/919461858955" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors border border-zinc-200">
                <div className="p-2 rounded-full bg-white text-green-600 shadow-sm border border-zinc-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                </div>
                <div>
                  <div className="text-sm text-zinc-500">WhatsApp</div>
                  <div className="text-zinc-900 font-semibold">Message Us</div>
                </div>
              </a>
              <a href="https://instagram.com/textileofjaipur" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors border border-zinc-200">
                <div className="p-2 rounded-full bg-white text-pink-600 shadow-sm border border-zinc-100">
                  <IconInstagram />
                </div>
                <div>
                  <div className="text-sm text-zinc-500">Instagram</div>
                  <div className="text-zinc-900 font-semibold">@textileofjaipur</div>
                </div>
              </a>
            </div>
          </div>
        }
      />

      {/* ─── Mobile/Desktop Drawer ─── */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      <div className={`fixed top-0 left-0 bottom-0 w-[300px] sm:w-[340px] bg-gradient-to-b from-zinc-950 to-zinc-900 shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-400" />
            <h2 className="text-xl font-serif font-bold text-white tracking-wide">TEXTILE <span className="text-brand-400 font-light">JAIPUR</span></h2>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close Menu"
            className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-500 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
          <a href="/" className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium group">
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><IconHome /></span>
            Home
          </a>

          <a href="/collection" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium group">
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><IconShopAll /></span>
            Shop All Collections
          </a>

          <a href="/about" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium group">
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><IconAboutUs /></span>
            About Us
          </a>

          <a href="/the-artisan-edit" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium group">
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><IconArtisanEdit /></span>
            The Artisan Edit
          </a>

          {user && (
            <a href="/dashboard" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium group">
              <span className="text-brand-400"><IconDashboard /></span>
              My Dashboard
            </a>
          )}

          <div className="flex flex-col">
            <button 
              onClick={() => setCategoriesExpanded(!categoriesExpanded)} 
              className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium w-full group"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><Tags className="h-5 w-5" /></span>
                Categories
              </div>
              <ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform duration-200 ${categoriesExpanded ? 'rotate-180' : ''}`} />
            </button>

            {categoriesExpanded && (
              <div className="pl-12 pr-4 py-2 flex flex-wrap gap-2 animate-fade-in">
                {navCategories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => {
                      setIsDrawerOpen(false);
                      if (typeof window !== 'undefined') {
                        window.location.href = `/collection?category=${encodeURIComponent(cat)}`;
                      }
                    }}
                    className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-[10px] font-semibold tracking-wider rounded-full transition-all border border-white/[0.06] hover:border-white/[0.12]"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="h-px bg-white/[0.04] my-3 mx-4" />
          
          <a 
            href="/blog"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium w-full text-left group"
          >
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><BookOpen className="h-5 w-5" /></span>
            Blog
          </a>

          <a 
            href="/reviews"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium w-full text-left group"
          >
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </span>
            Customer Reviews
          </a>

          <a 
            href="/returns"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium w-full text-left group"
          >
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><IconRefreshCcw /></span>
            Returns Portal
          </a>

          <a 
            href="/track-order"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium w-full text-left group"
          >
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><Truck className="h-5 w-5" /></span>
            Track Order
          </a>
          

          <button 
            onClick={() => { setIsDrawerOpen(false); setActiveModal('contact'); }}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all text-zinc-300 hover:text-white font-medium w-full text-left group"
          >
            <span className="text-zinc-500 group-hover:text-brand-400 transition-colors"><Phone className="h-5 w-5" /></span>
            Contact
          </button>
          
          <div className="h-px bg-white/[0.04] my-3 mx-4" />
          
          <button 
            onClick={() => { setIsDrawerOpen(false); onCartOpen(); }}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-brand-600/10 transition-all text-brand-300 hover:text-brand-200 font-semibold w-full text-left mt-auto bg-brand-500/[0.06] border border-brand-500/[0.1]"
          >
            <IconBag size={20} />
            Shopping Cart
            {cartCount > 0 && (
              <span className="ml-auto bg-gradient-to-r from-brand-500 to-brand-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        
        {user && profile?.role === 'admin' && (
          <div className="p-4 border-t border-white/[0.04]">
            <a href="/admin" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15 text-violet-300 hover:text-violet-200 font-semibold transition-all text-sm">
              Admin Portal
            </a>
          </div>
        )}
      </div>
    </header>
    {/* Spacer */}
    <div className={`w-full ${activePromo && !isPromoDismissed ? 'h-[116px] sm:h-[124px]' : 'h-[84px] sm:h-[92px]'}`} />
    </>
  );
};
