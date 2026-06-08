import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag, User, Heart, Search, Menu, X,
  ChevronDown, LogOut, LayoutDashboard, Shield,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { CURRENCIES, type CurrencyCode } from '../../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currencyRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { itemCount, openCart } = useCartStore();
  const { user, profile, logout, isAdmin } = useAuthStore();
  const { currency, setCurrency, currencyInfo } = useCurrencyStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const count = itemCount();
  const info = currencyInfo();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/catalog', label: 'Collections' },
    { to: '/catalog?category=ethnic-wear', label: 'Ethnic Wear' },
    { to: '/catalog?category=fusion', label: 'Fusion' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60 shadow-xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="font-serif text-xl lg:text-2xl font-bold tracking-wide">
                HIYA<span className="text-gold">WEAR</span>
              </span>
              <span className="hidden sm:block text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-medium border-l border-zinc-700 pl-2 ml-1">
                Est. Jaipur
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors relative group ${location.pathname === link.to ? 'text-gold' : 'text-zinc-400 hover:text-white'}`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 right-0 h-px bg-gold transition-transform origin-left ${location.pathname === link.to ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                id="nav-search-btn"
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Currency Switcher */}
              <div ref={currencyRef} className="relative hidden sm:block">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  id="currency-switcher-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <span>{info.flag}</span>
                  <span>{currency}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
                </button>

                {currencyOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl border border-zinc-800 shadow-2xl overflow-hidden animate-fade-in z-50">
                    {Object.values(CURRENCIES).map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setCurrency(c.code as CurrencyCode); setCurrencyOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors ${currency === c.code ? 'bg-yellow-950/30 text-gold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className="font-medium">{c.code}</span>
                        <span className="ml-auto text-zinc-500">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist (for logged in users) */}
              {user && (
                <Link to="/dashboard?tab=wishlist" className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50">
                  <Heart className="h-5 w-5" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                id="cart-btn"
                className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
              >
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-zinc-950 text-[9px] font-bold flex items-center justify-center animate-pulse-gold">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>

              {/* User Account */}
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  id="user-menu-btn"
                  className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl border border-zinc-800 shadow-2xl overflow-hidden animate-fade-in z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-zinc-800">
                          <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'My Account'}</p>
                          <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                        </div>
                        <Link to="/dashboard" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors">
                          <LayoutDashboard className="h-4 w-4" /> My Orders
                        </Link>
                        {isAdmin() && (
                          <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold hover:bg-yellow-950/20 transition-colors">
                            <Shield className="h-4 w-4" /> Admin Portal
                          </Link>
                        )}
                        <div className="border-t border-zinc-800">
                          <button
                            onClick={() => { logout(); setUserOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                          >
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 text-xs text-zinc-500 border-b border-zinc-800">
                          Sign in to access your orders and wishlist.
                        </div>
                        <Link to="/?auth=login" onClick={() => setUserOpen(false)} className="flex items-center justify-center gap-2 mx-4 my-3 px-4 py-2 btn-premium text-sm rounded-lg">
                          Sign In / Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-zinc-400 hover:text-white"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="border-t border-zinc-800/60 py-3 animate-slide-up">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery) window.location.href = `/catalog?q=${encodeURIComponent(searchQuery)}`; }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for ethnic wear, sarees, kurtis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-luxury max-w-2xl mx-auto block"
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden glass-card border-t border-zinc-800 animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block py-2 px-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-zinc-800 mt-2">
                <p className="text-xs text-zinc-600 mb-2 px-3">Currency</p>
                <div className="flex flex-wrap gap-2 px-3">
                  {Object.values(CURRENCIES).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code as CurrencyCode)}
                      className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${currency === c.code ? 'border-gold bg-yellow-950/20 text-gold' : 'border-zinc-700 text-zinc-400'}`}
                    >
                      {c.flag} {c.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
