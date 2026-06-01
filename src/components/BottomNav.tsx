'use client';

import React, { useEffect, useState } from 'react';
import { Home, Search, Heart, ShoppingBag, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface BottomNavProps {
  onCartOpen?: () => void;
  onMenuOpen?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onCartOpen, onMenuOpen }) => {
  const { cart } = useCart();
  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    try {
      const wl = JSON.parse(localStorage.getItem('hiyawear_wishlist') || '[]');
      setWishlistCount(wl.length);
    } catch {}

    // Listen for wishlist changes
    const onStorage = () => {
      try {
        const wl = JSON.parse(localStorage.getItem('hiyawear_wishlist') || '[]');
        setWishlistCount(wl.length);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/#categories', icon: Search, label: 'Shop' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', badge: wishlistCount },
    { href: '#cart', icon: ShoppingBag, label: 'Cart', badge: cartCount, onClick: onCartOpen },
    { href: '#menu', icon: Menu, label: 'Menu', onClick: onMenuOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-zinc-200 shadow-2xl md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = item.href !== '#cart' && item.href !== '#menu' && currentPath === item.href;
          return (
            <a
              key={item.label}
              href={item.onClick ? '#' : item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative min-w-[52px] ${
                isActive ? 'text-brand-700' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <div className="relative">
                <item.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-600 flex items-center justify-center text-[9px] font-bold text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-brand-700' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-600 rounded-full" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
};
