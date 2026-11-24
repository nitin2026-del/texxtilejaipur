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
import { StyleFinderButton } from '@/components/StyleFinderButton';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Handmade Embroidered Jackets & Boho Kimonos | Textile Jaipur',
  description: "Shop handmade embroidered Suzani jackets, velvet coats, boho kimonos & tote bags crafted in Jaipur. Free worldwide express shipping & 14-day returns.",
  keywords: [
    'Indian ethnic wear online', 'buy Indian textiles USA', 'handmade embroidered jacket', 'suzani jacket Europe',
    'boho dress India export', 'Jaipur textile online shop', 'Indian export clothing UK', 'authentic Rajasthani clothing',
    'handcrafted Indian fashion', 'buy Indian dress online USA', 'vintage embroidered jacket', 'block print dresses',
    'Indian artisan clothing', 'block print fabric', 'Indian boho fashion', 'sustainable Indian fashion',
    'Indian ethnic fashion Europe', 'ropa india artesanal', 'vêtements indiens artisanaux', 'indische Textilien kaufen',
    'comprar ropa india', 'Jaipur fashion store', 'Rajasthan handloom', 'ethnic wear worldwide shipping',
    'Indian dress for women', 'Indian luxury fashion', 'export quality Indian clothing'
  ].join(', '),
  authors: [{ name: 'Textile Jaipur', url: 'https://www.textilejaipur.com' }],
  creator: 'Textile Jaipur',
  publisher: 'Textile Jaipur',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.textilejaipur.com'),
  alternates: {
    canonical: './',
    languages: {
      'en': 'https://www.textilejaipur.com',
      'x-default': 'https://www.textilejaipur.com',
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
    title: 'Handmade Embroidered Jackets & Boho Kimonos | Textile Jaipur',
    description: "Shop handmade embroidered Suzani jackets, velvet coats, boho kimonos & tote bags crafted in Jaipur. Free worldwide express shipping & 14-day returns.",
    url: 'https://www.textilejaipur.com',
    siteName: 'Textile Jaipur',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.textilejaipur.com/about/img1.jpg',
        width: 1200,
        height: 630,
        alt: 'Textile Jaipur - Handcrafted Indian Ethnic Wear'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Handmade Embroidered Jackets & Boho Kimonos | Textile Jaipur',
    description: "Shop handmade embroidered Suzani jackets, velvet coats, boho kimonos & tote bags crafted in Jaipur. Free worldwide express shipping & 14-day returns.",
    images: ['https://www.textilejaipur.com/about/img1.jpg'],
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
  url: 'https://www.textilejaipur.com',
  logo: 'https://www.textilejaipur.com/about/img1.jpg',
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
    telephone: '+91-8764655537',
    email: 'textileofrajasthan.info@gmail.com',
    availableLanguage: ['English', 'Hindi']
  },
  sameAs: [
    'https://instagram.com/textileofjaipur',
    'https://www.facebook.com/textileofjaipur',
    'https://www.youtube.com/@TextileJaipur'
  ],
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: ['US', 'GB', 'CA', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES', 'NL', 'AE', 'MX', 'IN'],
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    customerRemorseReturnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    itemDefectReturnFees: 'https://schema.org/FreeReturn',
    merchantReturnLink: 'https://www.textilejaipur.com/refund-policy'
  }
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Textile Jaipur',
  url: 'https://www.textilejaipur.com',
  description: 'Authentic handcrafted Indian ethnic wear shipped worldwide',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.textilejaipur.com/collection?search={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Textile Jaipur',
  url: 'https://www.textilejaipur.com',
  image: 'https://www.textilejaipur.com/about/img1.jpg',
  priceRange: '$$',
  currenciesAccepted: 'USD, EUR, GBP, INR',
  paymentAccepted: 'Credit Card, Debit Card, PayPal',
  openingHours: 'Mo-Su 00:00-24:00',
  telephone: '+91-8764655537',
  hasMap: 'https://www.google.com/maps?q=26.9124,75.7873',
  geo: { '@type': 'GeoCoordinates', latitude: 26.9124, longitude: 75.7873 },
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
        <link rel="preconnect" href="https://images.weserv.nl" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.weserv.nl" />
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
                var lGet = function(k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
                var lSet = function(k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
                var sGet = function(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
                var sSet = function(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} };
                var cSet = function(k, v) {
                  try { document.cookie = k + '=' + v + '; path=/; max-age=7776000; SameSite=Lax'; } catch (e) {}
                  try {
                    if (window.location && window.location.hostname && window.location.hostname.indexOf('textilejaipur.com') !== -1) {
                      document.cookie = k + '=' + v + '; domain=.textilejaipur.com; path=/; max-age=7776000; SameSite=Lax';
                    }
                  } catch (e) {}
                };
                var cGet = function(k) {
                  try {
                    var parts = (document.cookie || '').split(';');
                    var best = '';
                    var bestTs = -1;
                    for (var i = 0; i < parts.length; i++) {
                      var p = parts[i].replace(/^\s+/, '');
                      if (p.indexOf(k + '=') === 0) {
                        var v = p.substring(k.length + 1);
                        var segs = v.split('.');
                        var ts = segs.length >= 3 ? Number(segs[2]) : 0;
                        if (!best || (ts && ts >= bestTs)) {
                          best = v;
                          if (ts) bestTs = ts;
                        }
                      }
                    }
                    return best;
                  } catch (e) { return ''; }
                };
                try {
                  var href = window.location.href || '';
                  var params = new URLSearchParams(window.location.search);
                  var fbclid = params.get('fbclid');
                  if (!fbclid) {
                    var mHref = href.match(/[\?&#]fbclid=([^&#]+)/);
                    if (mHref && mHref[1]) { try { fbclid = decodeURIComponent(mHref[1]); } catch (e) { fbclid = mHref[1]; } }
                  }
                  var isBioLink = params.get('utm_content') === 'link_in_bio' || params.get('utm_medium') === 'social';
                  var existingFbc = cGet('_fbc') || lGet('meta_fbc') || sGet('meta_fbc') || '';
                  if (fbclid && !(isBioLink && existingFbc)) {
                    var nowTs = String(Date.now());
                    var fbcVal = (existingFbc && existingFbc.slice(-fbclid.length - 1) === '.' + fbclid)
                      ? existingFbc
                      : ('fb.1.' + nowTs + '.' + fbclid);
                    cSet('_fbc', fbcVal);
                    window.__META_FBC = fbcVal;
                    lSet('meta_fbc', fbcVal);
                    sSet('meta_fbc', fbcVal);
                    lSet('meta_fbclid', fbclid);
                    lSet('meta_fbclid_ts', nowTs);
                    sSet('meta_fbclid', fbclid);
                    sSet('meta_fbclid_ts', nowTs);
                  } else {
                    var storedFbc = existingFbc;
                    if (!storedFbc) {
                      var savedClid = lGet('meta_fbclid') || sGet('meta_fbclid');
                      var savedTs = lGet('meta_fbclid_ts') || sGet('meta_fbclid_ts') || String(Date.now());
                      if (savedClid) storedFbc = 'fb.1.' + savedTs + '.' + savedClid;
                    }
                    if (storedFbc) {
                      cSet('_fbc', storedFbc);
                      window.__META_FBC = storedFbc;
                      lSet('meta_fbc', storedFbc);
                      sSet('meta_fbc', storedFbc);
                    }
                  }
                  var fbpVal = cGet('_fbp') || lGet('meta_fbp') || sGet('meta_fbp') || ('fb.1.' + Date.now() + '.' + Math.floor(Math.random() * 1000000000));
                  cSet('_fbp', fbpVal);
                  window.__META_FBP = fbpVal;
                  lSet('meta_fbp', fbpVal);
                  sSet('meta_fbp', fbpVal);
                  var isPayReturn = params.has('payment') || (window.location.pathname && window.location.pathname.indexOf('/payment/') === 0);
                  var hasExistingLanding = Boolean(sGet('meta_landing_url') || lGet('meta_landing_url') || cGet('_tj_landing'));
                  if (!isPayReturn && !(isBioLink && hasExistingLanding) && (fbclid || params.get('utm_source') || params.get('utm_campaign') || params.get('utm_content') || params.get('utm_id'))) {
                    window.__META_LANDING_URL = href;
                    lSet('meta_landing_url', href);
                    sSet('meta_landing_url', href);
                    cSet('_tj_landing', encodeURIComponent(href));
                  } else if (!sGet('meta_landing_url') && !lGet('meta_landing_url') && !cGet('_tj_landing')) {
                    window.__META_LANDING_URL = href;
                    lSet('meta_landing_url', href);
                    sSet('meta_landing_url', href);
                    cSet('_tj_landing', encodeURIComponent(href));
                  }
                } catch (e) {}
              })();
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){if(navigator&&(navigator.webdriver||/googlebot|bingbot|yandexbot|baiduspider|duckduckbot|slurp|applebot|facebookexternalhit|meta-externalagent|facebot|twitterbot|linkedinbot|pinterestbot|ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|perplexitybot|headlesschrome|phantomjs|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake/i.test(navigator.userAgent||'')))return;var cmd=arguments[0],ev=(cmd==='trackSingle'||cmd==='trackSingleCustom')?arguments[2]:arguments[1];if((cmd==='track'||cmd==='trackSingle'||cmd==='trackCustom'||cmd==='trackSingleCustom')&&ev!=='PageView'&&!window.__ALLOW_META_TRACK)return;if(window.location&&window.location.pathname){var p=window.location.pathname;if(p.indexOf('/admin')===0&&cmd!=='set'&&cmd!=='init')return;}n.callMethod?
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
            <StyleFinderButton />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
