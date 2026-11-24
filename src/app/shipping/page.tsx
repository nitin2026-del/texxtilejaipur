import type { Metadata } from 'next';
import { ShippingPageClient } from '@/components/ShippingPageClient';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Free Worldwide Express | Textile Jaipur',
  description: 'Free UPS Express worldwide shipping from Jaipur in 1-3 business days handling and 5-9 days to the US, with customs duties handled and live tracking.',
  alternates: {
    canonical: 'https://www.textilejaipur.com/shipping',
  },
};

export default function ShippingPolicyPage() {
  return <ShippingPageClient />;
}
