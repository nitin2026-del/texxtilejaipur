'use client';

import { useEffect } from 'react';

interface GoogleCustomerReviewsOptInProps {
  orderId: string;
  email: string;
  country?: string;
  estimatedDeliveryDate?: string;
}

const COUNTRY_TO_ISO2: Record<string, string> = {
  'united states': 'US', 'usa': 'US', 'united states of america': 'US',
  'united kingdom': 'GB', 'uk': 'GB', 'great britain': 'GB', 'england': 'GB', 'scotland': 'GB', 'wales': 'GB',
  'india': 'IN',
  'australia': 'AU',
  'canada': 'CA',
  'germany': 'DE', 'deutschland': 'DE',
  'france': 'FR',
  'italy': 'IT', 'italia': 'IT',
  'spain': 'ES', 'espana': 'ES', 'españa': 'ES',
  'netherlands': 'NL', 'holland': 'NL', 'the netherlands': 'NL',
  'belgium': 'BE',
  'switzerland': 'CH',
  'austria': 'AT',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'ireland': 'IE', 'republic of ireland': 'IE',
  'portugal': 'PT',
  'greece': 'GR',
  'poland': 'PL',
  'hungary': 'HU',
  'czech republic': 'CZ', 'czechia': 'CZ',
  'romania': 'RO',
  'croatia': 'HR',
  'slovenia': 'SI',
  'slovakia': 'SK',
  'bulgaria': 'BG',
  'luxembourg': 'LU',
  'malta': 'MT',
  'cyprus': 'CY',
  'estonia': 'EE',
  'latvia': 'LV',
  'lithuania': 'LT',
  'iceland': 'IS',
  'mexico': 'MX', 'méxico': 'MX',
  'brazil': 'BR', 'brasil': 'BR',
  'argentina': 'AR',
  'chile': 'CL',
  'colombia': 'CO',
  'peru': 'PE',
  'new zealand': 'NZ',
  'united arab emirates': 'AE', 'uae': 'AE', 'dubai': 'AE',
  'saudi arabia': 'SA',
  'qatar': 'QA',
  'kuwait': 'KW',
  'bahrain': 'BH',
  'oman': 'OM',
  'israel': 'IL',
  'turkey': 'TR', 'türkiye': 'TR',
  'singapore': 'SG',
  'hong kong': 'HK',
  'japan': 'JP',
  'south korea': 'KR', 'korea': 'KR',
  'taiwan': 'TW',
  'malaysia': 'MY',
  'thailand': 'TH',
  'indonesia': 'ID',
  'philippines': 'PH',
  'vietnam': 'VN',
  'south africa': 'ZA',
};

function toIsoCountryCode(country?: string): string {
  if (!country) return 'US';
  const cleaned = country.trim().toLowerCase();
  if (COUNTRY_TO_ISO2[cleaned]) return COUNTRY_TO_ISO2[cleaned];
  if (cleaned.length === 2) return cleaned.toUpperCase();
  return 'US';
}

export function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  country,
  estimatedDeliveryDate,
}: GoogleCustomerReviewsOptInProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !orderId || !email) return;

    // Delay loading by 1.5s so Meta Pixel Purchase event & CAPI network requests
    // finish with 100% priority before Google's script even starts loading.
    const timer = setTimeout(() => {
      try {
        const deliveryCountry = toIsoCountryCode(country);
        const deliveryDate =
          estimatedDeliveryDate ||
          new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        (window as any).renderOptIn = function () {
          try {
            if ((window as any).gapi) {
              (window as any).gapi.load('surveyoptin', function () {
                try {
                  (window as any).gapi.surveyoptin.render({
                    merchant_id: 5837483254,
                    order_id: String(orderId),
                    email: String(email).trim(),
                    delivery_country: deliveryCountry,
                    estimated_delivery_date: deliveryDate,
                  });
                } catch {}
              });
            }
          } catch {}
        };

        if ((window as any).gapi) {
          (window as any).renderOptIn();
          return;
        }

        const existingScript = document.getElementById('google-customer-reviews-optin');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-customer-reviews-optin';
          script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
        }
      } catch {}
    }, 1500);

    return () => clearTimeout(timer);
  }, [orderId, email, country, estimatedDeliveryDate]);

  return null;
}
