import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Textile Jaipur | Luxury Traditional Ethnic Clothing',
  description: 'Explore the finest handcrafted ethnic fashion, vintage embroidered jackets, boho dresses, and premium Indian export clothing from Textile Jaipur.',
  keywords: 'ethnic wear, boho fashion, suzani jackets, handmade jackets, vintage embroidered jackets, Indian export clothing, sustainable fashion, Hiya Wear, luxury fashion, Jaipur handloom',
  authors: [{ name: 'Hiya Wear' }],
  manifest: '/manifest.json',
  metadataBase: new URL('https://textilejaipur.com'),
  openGraph: {
    title: 'Hiya Wear | Luxury Ethnic Fashion',
    description: 'Premium handcrafted ethnic wear and sustainable fashion shipped worldwide.',
    url: 'https://textilejaipur.com',
    siteName: 'Hiya Wear',
    locale: 'en_US',
    type: 'website',
    images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hiya Wear | Luxury Ethnic Fashion',
    description: 'Premium handcrafted ethnic wear and sustainable fashion shipped worldwide.',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80'],
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
