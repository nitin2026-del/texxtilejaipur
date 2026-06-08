import { CurrencyCode, FX_RATES, CURRENCIES } from '../types';

/**
 * Convert a price from INR to the target currency.
 * Applies a 3% FX markup to protect against rate fluctuation.
 */
export function convertFromINR(priceInr: number, targetCurrency: CurrencyCode): number {
  if (targetCurrency === 'INR') return priceInr;
  const rate = FX_RATES[targetCurrency];
  const FX_MARKUP = 1.03; // 3% markup
  return parseFloat((priceInr * rate * FX_MARKUP).toFixed(2));
}

/**
 * Format a price with the appropriate currency symbol.
 */
export function formatPrice(amount: number, currency: CurrencyCode): string {
  const info = CURRENCIES[currency];
  if (!info) return `${amount}`;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'INR' ? 0 : 2,
      maximumFractionDigits: currency === 'INR' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${info.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get the product price in the specified currency.
 * Falls back to converting from INR if specific currency price is not set.
 */
export function getProductPrice(
  product: {
    price_inr: number;
    price_usd?: number | null;
    price_eur?: number | null;
    price_gbp?: number | null;
    price_aud?: number | null;
  },
  currency: CurrencyCode
): number {
  switch (currency) {
    case 'USD': return product.price_usd ?? convertFromINR(product.price_inr, 'USD');
    case 'EUR': return product.price_eur ?? convertFromINR(product.price_inr, 'EUR');
    case 'GBP': return product.price_gbp ?? convertFromINR(product.price_inr, 'GBP');
    case 'AUD': return product.price_aud ?? convertFromINR(product.price_inr, 'AUD');
    default: return convertFromINR(product.price_inr, currency);
  }
}

/**
 * Detect user's likely currency from their locale.
 * In production, use MaxMind GeoIP2 or a similar service.
 */
export function detectCurrency(): CurrencyCode {
  try {
    const locale = navigator.language || 'en-US';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timezone.includes('Australia')) return 'AUD';
    if (timezone.includes('London') || locale.startsWith('en-GB')) return 'GBP';
    if (timezone.includes('Dubai') || timezone.includes('Abu_Dhabi')) return 'AED';
    if (timezone.includes('Europe') || locale.startsWith('de') || locale.startsWith('fr') || locale.startsWith('es')) return 'EUR';
    if (timezone.includes('Canada') || locale.startsWith('en-CA')) return 'CAD';
    if (timezone.includes('Asia/Kolkata')) return 'INR';
    return 'USD';
  } catch {
    return 'USD';
  }
}
