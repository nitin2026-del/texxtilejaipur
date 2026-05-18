import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'IndiThread | Premium Indian Textiles & Clothes Exporter',
  description: 'Discover handcrafted heritage ethnic wear, sarees, premium block-print fabrics, and home textiles direct from Jaipur, India. Cross-border delivery with multi-currency pricing.',
  keywords: 'Indian apparel export, traditional wear, block print, Banarasi silk, Jaipur textiles, B2B garment export, IndiThread',
  authors: [{ name: 'IndiThread Team' }],
  openGraph: {
    title: 'IndiThread | Premium Indian Textiles',
    description: 'Heritage ethnic wear and fabrics shipped worldwide.',
    url: 'https://indithread.com',
    type: 'website',
    images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80' }]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="bg-mesh" />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
