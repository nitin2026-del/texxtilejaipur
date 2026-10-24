import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { MetaPixel } from '@/components/MetaPixel';
import './globals.css';
import { FloatingSupport } from '@/components/FloatingSupport';
import { GlobalModals } from '@/components/GlobalModals';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Textile Jaipur | Handmade Indian Clothing & Suzani Jackets',
  description: 'Shop handmade Indian clothing from Jaipur, including Suzani jackets, boho kimonos, embroidered dresses, skirts and traditional textiles. Worldwide free shipping.',
  keywords: [
    'Indian ethnic wear online', 'buy Indian textiles USA', 'handmade embroidered jacket', 'suzani jacket Europe',
    'boho dress India export', 'Jaipur textile online shop', 'Indian export clothing UK', 'authentic Rajasthani clothing',
    'handcrafted Indian fashion', 'buy Indian dress online USA', 'vintage embroidered jacket', 'block print dresses',
    'Indian artisan clothing', 'block print fabric', 'Indian boho fashion', 'sustainable Indian fashion',
    'Indian ethnic fashion Europe', 'ropa india artesanal', 'vêtements indiens artisanaux', 'indische Textilien kaufen',
    'comprar ropa india', 'Jaipur fashion store', 'Rajasthan handloom', 'ethnic wear worldwide shipping',
    'Indian dress for women', 'Indian luxury fashion', 'export quality Indian clothing'
  ].join(', '),
  authors: [{ name: 'Textile Jaipur', url: 'https://textilejaipur.com' }],
  creator: 'Textile Jaipur',
  publisher: 'Textile Jaipur',
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
    title: 'Textile Jaipur | Handmade Indian Clothing & Suzani Jackets',
    description: 'Shop handmade Indian clothing from Jaipur, including Suzani jackets, boho kimonos, embroidered dresses, skirts and traditional textiles. Worldwide free shipping.',
    url: 'https://textilejaipur.com',
    siteName: 'Textile Jaipur',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://textilejaipur.com/about/img1.jpg',
        width: 1200,
        height: 630,
        alt: 'Textile Jaipur - Handcrafted Indian Ethnic Wear'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Textile Jaipur | Handmade Indian Clothing & Suzani Jackets',
    description: 'Shop handmade Indian clothing from Jaipur, including Suzani jackets, boho kimonos, embroidered dresses, skirts and traditional textiles. Worldwide free shipping.',
    images: ['https://textilejaipur.com/about/img1.jpg'],
    creator: '@textileofjaipur',
    site: '@textileofjaipur'
  },
  verification: {
    google: 'Apib7-x98H0j5cPqHWwSMm6dNU4GmODRoqxLiDzdx9I',
    other: {
      'trustpilot-one-time-domain-verification-id': '73cedff9-9716-41ff-bac6-1a94638ffd9f',
    },
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
  name: 'Textile Jaipur',
  url: 'https://textilejaipur.com',
  logo: 'https://textilejaipur.com/about/img1.jpg',
  description: 'Premium handcrafted Indian ethnic wear — embroidered jackets, Boho dresses, block print textiles, suzani masterpieces — shipped worldwide from Jaipur, Rajasthan.',
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
    email: 'textileofrajasthan.info@gmail.com',
    availableLanguage: ['English', 'Hindi']
  },
  sameAs: [
    'https://instagram.com/textileofjaipur',
    'https://www.facebook.com/textileofjaipur',
    'https://www.youtube.com/@TextileJaipur'
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
  name: 'Textile Jaipur',
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
  name: 'Textile Jaipur',
  url: 'https://textilejaipur.com',
  image: 'https://textilejaipur.com/about/img1.jpg',
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
        {/* Google tag (gtag.js) */}
        <Script
          id="google-tag-src"
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-PTT2P19231"
        />
        <Script
          id="google-tag-init"
          strategy="lazyOnload"
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

        {/* Meta Pixel — server-rendered in <head> for instant loading */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var params = new URLSearchParams(window.location.search);
                  var fbclid = params.get('fbclid');
                  if (fbclid) {
                    var m = document.cookie.match(/(^| )_fbc=([^;]+)/);
                    var existingFbc = m ? m[2] : (localStorage.getItem('meta_fbc') || '');
                    var fbcVal = (existingFbc && existingFbc.slice(-fbclid.length - 1) === '.' + fbclid)
                      ? existingFbc
                      : ('fb.1.' + Date.now() + '.' + fbclid);
                    document.cookie = '_fbc=' + fbcVal + '; path=/; max-age=7776000; SameSite=Lax';
                    localStorage.setItem('meta_fbc', fbcVal);
                    sessionStorage.setItem('meta_fbc', fbcVal);
                  } else {
                    var mFbc = document.cookie.match(/(^| )_fbc=([^;]+)/);
                    var storedFbc = mFbc ? mFbc[2] : (localStorage.getItem('meta_fbc') || sessionStorage.getItem('meta_fbc') || '');
                    if (storedFbc) {
                      document.cookie = '_fbc=' + storedFbc + '; path=/; max-age=7776000; SameSite=Lax';
                      localStorage.setItem('meta_fbc', storedFbc);
                      sessionStorage.setItem('meta_fbc', storedFbc);
                    }
                  }
                  var mFbp = document.cookie.match(/(^| )_fbp=([^;]+)/);
                  var fbpVal = mFbp ? mFbp[2] : (localStorage.getItem('meta_fbp') || ('fb.1.' + Date.now() + '.' + Math.floor(Math.random() * 1000000000)));
                  document.cookie = '_fbp=' + fbpVal + '; path=/; max-age=7776000; SameSite=Lax';
                  localStorage.setItem('meta_fbp', fbpVal);
                  sessionStorage.setItem('meta_fbp', fbpVal);
                } catch (e) {}
              })();
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){if(window.location&&window.location.pathname&&window.location.pathname.indexOf('/track')===0){var cmd=arguments[0],ev=(cmd==='trackSingle'||cmd==='trackSingleCustom')?arguments[2]:arguments[1];if((cmd==='track'||cmd==='trackSingle'||cmd==='trackCustom'||cmd==='trackSingleCustom')&&ev&&ev!=='PageView')return;}n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              window.__INITIAL_PV_ID = 'pv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
              fbq('set', 'autoConfig', false, '1045219725239327');
              fbq('init', '1045219725239327');
              fbq('track', 'PageView', {}, { eventID: window.__INITIAL_PV_ID });
            `
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1045219725239327&ev=PageView&noscript=1" alt="" />
        </noscript>
      </head>
      <body className={`antialiased ${inter.variable} ${playfair.variable}`}>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <AuthProvider>
          <CartProvider>
            <div className="bg-mesh" />
            <FloatingSupport />
            <GlobalModals />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
