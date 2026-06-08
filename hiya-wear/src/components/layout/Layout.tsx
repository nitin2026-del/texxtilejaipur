import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

interface LayoutProps {
  children: React.ReactNode;
  noFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, noFooter = false }) => {
  return (
    <div className="relative min-h-screen">
      <div className="bg-mesh" />
      <Navbar />
      <main className="relative z-10 pt-16 lg:pt-20">
        {children}
      </main>
      {!noFooter && <Footer />}
      <CartDrawer />
    </div>
  );
};
