import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/category/kimonos', label: 'Kimonos' },
  { to: '/category/jackets', label: 'Jackets' },
  { to: '/category/vests', label: 'Vests' },
  { to: '/category/bags', label: 'Bags' },
  { to: '/category/cotton-suzani-shorts', label: 'Shorts' },
  { to: '/category/girls-dresses', label: 'Dresses' },
  { to: '/category/pajamas', label: 'Pajamas' },
  { to: '/category/quilt-sets', label: 'Quilts' },
  { to: '/category/skirts', label: 'Skirts' },
  { to: '/blog', label: 'Editorial' },
];

export default function Navbar() {
  const { items, toggleTheme, theme, auth } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const cartCount = items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

  useEffect(() => {
    document.body.style.overflow = sidebarOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, searchOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* ── Luxury Minimalist Navbar ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-[var(--color-ivory)]/90 dark:bg-[#0e0d0c]/90 backdrop-blur-xl border-b border-[var(--color-sand)] dark:border-[#1e1b17] py-3' 
          : 'bg-transparent py-5 md:py-6'
      }`}>
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* LEFT — Hamburger (Mobile) + Desktop Links */}
          <div className="flex-1 flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex flex-col gap-[6px] p-2 hover:opacity-70 transition-opacity"
              aria-label="Open menu"
            >
              <span className={`w-6 h-[1px] ${scrolled ? 'bg-black dark:bg-white' : 'bg-current'} transition-colors`} />
              <span className={`w-4 h-[1px] ${scrolled ? 'bg-black dark:bg-white' : 'bg-current'} transition-colors`} />
              <span className={`w-6 h-[1px] ${scrolled ? 'bg-black dark:bg-white' : 'bg-current'} transition-colors`} />
            </button>

            <div className={`hidden md:flex items-center gap-8 ${scrolled ? 'text-[var(--color-charcoal)] dark:text-[#f0ede8]' : 'text-current'}`}>
              {NAV_LINKS.slice(1).map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `text-[0.65rem] uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:text-[var(--color-bronze)] ${
                      isActive ? 'text-[var(--color-bronze)]' : ''
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* CENTER — Luxury Logo */}
          <Link to="/" className="flex-shrink-0 text-center mx-4 group">
            <h1 className={`font-editorial text-3xl md:text-4xl tracking-wide transition-all duration-500 ${scrolled ? 'text-[var(--color-charcoal)] dark:text-[#f0ede8]' : 'text-current'} group-hover:opacity-80`}>
              GUPTA INTERNATIONAL
            </h1>
            <p className={`text-[0.5rem] tracking-[0.4em] uppercase mt-1 opacity-70 ${scrolled ? 'text-[var(--color-charcoal)] dark:text-[#f0ede8]' : 'text-current'}`}>
              India
            </p>
          </Link>

          {/* RIGHT — Icons */}
          <div className={`flex-1 flex items-center justify-end gap-5 ${scrolled ? 'text-[var(--color-charcoal)] dark:text-[#f0ede8]' : 'text-current'}`}>
            <button onClick={() => setSearchOpen(true)} className="p-2 -m-2 hover:text-[var(--color-bronze)] transition-colors" aria-label="Search">
              <MagnifyingGlassIcon className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button onClick={toggleTheme} className="p-2 -m-2 hover:text-[var(--color-bronze)] transition-colors hidden sm:block" aria-label="Theme">
              {theme === 'light' ? <MoonIcon className="w-5 h-5 stroke-[1.5]" /> : <SunIcon className="w-5 h-5 stroke-[1.5]" />}
            </button>
            <Link to="/wishlist" className="p-2 -m-2 hover:text-[var(--color-bronze)] transition-colors hidden sm:block" aria-label="Wishlist">
              <HeartIcon className="w-5 h-5 stroke-[1.5]" />
            </Link>
            <Link to="/cart" className="relative p-2 -m-2 hover:text-[var(--color-bronze)] transition-colors flex items-center gap-2" aria-label="Cart">
              <ShoppingBagIcon className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="text-xs font-medium">{cartCount}</span>
              )}
            </Link>
            <Link to={auth?.user ? '/dashboard' : '/login'} className="p-2 -m-2 hover:text-[var(--color-bronze)] transition-colors" aria-label="Account">
              <UserIcon className="w-5 h-5 stroke-[1.5]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Sidebar Overlay & Drawer ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm z-[70] bg-[var(--color-ivory)] dark:bg-[#0e0d0c] shadow-2xl flex flex-col transition-transform duration-500 ease-[var(--ease-luxury)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-8 py-8 border-b border-[var(--color-sand)] dark:border-[#1e1b17]">
          <span className="font-editorial text-2xl tracking-wide text-[var(--color-charcoal)] dark:text-[#f0ede8]">GUPTA INTERNATIONAL</span>
          <button onClick={() => setSidebarOpen(false)} className="p-2 -mr-2 text-[var(--color-charcoal)] dark:text-[#f0ede8] hover:opacity-70 transition-opacity">
            <XMarkIcon className="w-6 h-6 stroke-1" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-8">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className="text-xl font-editorial tracking-wide text-[var(--color-charcoal)] dark:text-[#f0ede8] hover:text-[var(--color-bronze)] dark:hover:text-[var(--color-taupe)] transition-colors"
            >
              {label}
            </Link>
          ))}
          
          <div className="pt-8 mt-4 border-t border-[var(--color-sand)] dark:border-[#1e1b17] flex flex-col gap-6">
            <Link to="/about" onClick={() => setSidebarOpen(false)} className="text-sm font-medium tracking-widest uppercase text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[#f0ede8] transition-colors">Our Story</Link>
            <Link to="/contact" onClick={() => setSidebarOpen(false)} className="text-sm font-medium tracking-widest uppercase text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[#f0ede8] transition-colors">Client Services</Link>
            <Link to="/wholesale" onClick={() => setSidebarOpen(false)} className="text-sm font-medium tracking-widest uppercase text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[#f0ede8] transition-colors">Wholesale</Link>
          </div>
        </nav>

        <div className="px-8 py-8 border-t border-[var(--color-sand)] dark:border-[#1e1b17] bg-[var(--color-parchment)] dark:bg-[#161412]">
          <button
            onClick={() => { toggleTheme(); setSidebarOpen(false); }}
            className="text-xs tracking-widest uppercase font-semibold text-[var(--color-charcoal)] dark:text-[#f0ede8] flex items-center gap-3"
          >
            {theme === 'light' ? <MoonIcon className="w-4 h-4 stroke-2" /> : <SunIcon className="w-4 h-4 stroke-2" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[80] bg-[var(--color-ivory)]/95 dark:bg-[#0e0d0c]/95 backdrop-blur-xl flex flex-col items-center pt-32 px-6 transition-all duration-500 animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <button 
            onClick={() => setSearchOpen(false)} 
            className="absolute top-10 right-10 p-2 text-[var(--color-charcoal)] dark:text-[#f0ede8] hover:opacity-70 transition-opacity"
          >
            <XMarkIcon className="w-8 h-8 stroke-1" />
          </button>
          
          <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <p className="text-center label-luxury mb-4 text-[var(--color-bronze)] animate-fade-up">What are you looking for?</p>
            <form onSubmit={handleSearch} className="relative animate-fade-up delay-100">
              <input
                autoFocus
                type="text"
                placeholder="Search collections, fabrics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[var(--color-charcoal)] dark:border-[#f0ede8] pb-4 text-3xl md:text-5xl font-editorial text-[var(--color-charcoal)] dark:text-[#f0ede8] placeholder-[var(--color-taupe)] outline-none text-center"
              />
            </form>
            <div className="mt-12 flex justify-center flex-wrap gap-6 animate-fade-up delay-200">
              {['Kimonos', 'Embroidered Jackets', 'Suzani Shorts', 'Quilt Sets', 'New Arrivals'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setSearchQuery(tag); handleSearch({ preventDefault: () => {} }); }}
                  className="text-sm font-medium tracking-wider text-gray-500 hover:text-[var(--color-charcoal)] dark:hover:text-[#f0ede8] transition-colors link-luxury"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
