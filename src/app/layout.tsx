import type { Metadata } from 'next';
import Script from 'next/script';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Texxtile Jaipur | Handcrafted Indian Ethnic Wear',
  description: 'Shop authentic handcrafted Indian textiles direct from Jaipur. Buy embroidered jackets, Boho dresses & Banarasi silk. Free global shipping!',
  keywords: [
    'Indian ethnic wear online', 'buy Indian textiles USA', 'handmade embroidered jacket', 'suzani jacket Europe',
    'boho dress India export', 'Jaipur textile online shop', 'Indian export clothing UK', 'authentic Rajasthani clothing',
    'handcrafted Indian fashion', 'buy Indian dress online USA', 'vintage embroidered jacket', 'Banarasi silk saree',
    'Indian artisan clothing', 'block print fabric', 'Indian boho fashion', 'sustainable Indian fashion',
    'Indian ethnic fashion Europe', 'ropa india artesanal', 'vêtements indiens artisanaux', 'indische Textilien kaufen',
    'comprar ropa india', 'Jaipur fashion store', 'Rajasthan handloom', 'ethnic wear worldwide shipping',
    'Indian dress for women', 'Indian luxury fashion', 'export quality Indian clothing'
  ].join(', '),
  authors: [{ name: 'Texxtile Jaipur', url: 'https://textilejaipur.com' }],
  creator: 'Texxtile Jaipur',
  publisher: 'Texxtile Jaipur',
  manifest: '/manifest.json',
  metadataBase: new URL('https://textilejaipur.com'),
  alternates: {
    canonical: 'https://textilejaipur.com',
    languages: {
      'en-US': 'https://textilejaipur.com',
      'en-GB': 'https://textilejaipur.com',
      'es': 'https://textilejaipur.com',
      'fr': 'https://textilejaipur.com',
      'de': 'https://textilejaipur.com',
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Texxtile Jaipur | Authentic Handcrafted Indian Ethnic Wear',
    description: 'Direct from master artisans in Jaipur — embroidered jackets, Boho dresses, Banarasi silk. Worldwide UPS shipping. Trusted by 3,200+ buyers across 30+ countries.',
    url: 'https://textilejaipur.com',
    siteName: 'Texxtile Jaipur',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Texxtile Jaipur - Handcrafted Indian Ethnic Wear'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Texxtile Jaipur | Authentic Indian Ethnic Wear — Worldwide Shipping',
    description: 'Shop embroidered jackets, Boho dresses & Banarasi silk direct from Jaipur artisans. Free UPS Express worldwide shipping. Trusted by 3,200+ happy customers across 30+ countries.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=80&w=1200&auto=format&fit=crop'],
    creator: '@textileofjaipur',
    site: '@textileofjaipur'
  },
  category: 'fashion',
  classification: 'Clothing & Apparel',
  other: {
    'geo.region': 'IN-RJ',
    'geo.placename': 'Jaipur, Rajasthan, India',
    'geo.position': '26.9124;75.7873',
    'ICBM': '26.9124, 75.7873',
    'rating': 'general',
    'revisit-after': '7 days',
    'language': 'English',
    'coverage': 'Worldwide',
    'distribution': 'Global',
    'target': 'all',
  }
};

// JSON-LD Structured Data
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Texxtile Jaipur',
  url: 'https://textilejaipur.com',
  logo: 'https://textilejaipur.com/icon.png',
  description: 'Premium handcrafted Indian ethnic wear — embroidered jackets, Boho dresses, Banarasi silk, suzani masterpieces — shipped worldwide from Jaipur, Rajasthan.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    addressCountry: 'IN',
    postalCode: '302001'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'priyanshug863@gmail.com',
    availableLanguage: ['English', 'Hindi']
  },
  sameAs: [
    'https://instagram.com/textileofjaipur',
    'https://www.facebook.com/textileofjaipur',
    'https://youtube.com/@textilejaipur',
    'https://linkedin.com/company/textilejaipur'
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '3247',
    bestRating: '5'
  }
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Texxtile Jaipur',
  url: 'https://textilejaipur.com',
  description: 'Authentic handcrafted Indian ethnic wear shipped worldwide',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://textilejaipur.com/?search={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Texxtile Jaipur',
  url: 'https://textilejaipur.com',
  image: 'https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=80&w=1200&auto=format&fit=crop',
  priceRange: '$$',
  currenciesAccepted: 'USD, EUR, GBP, INR',
  paymentAccepted: 'Credit Card, Debit Card, PayPal',
  openingHours: 'Mo-Su 00:00-24:00',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    addressCountry: 'IN'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1325173556217164');
              fbq('track', 'PageView');
            `
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1325173556217164&ev=PageView&noscript=1" alt="" />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Google tag (gtag.js) */}
        <Script
          id="google-tag-src"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-PTT2P19231"
        />
        <Script
          id="google-tag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PTT2P19231');
            `
          }}
        />
        {/* End Google tag */}

        {/* Microsoft Clarity */}
        <Script
          id="microsoft-clarity"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "x71ef22e2e");
            `
          }}
        />
        {/* End Microsoft Clarity */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
      </head>
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
