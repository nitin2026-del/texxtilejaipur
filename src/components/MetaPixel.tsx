'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trackMetaEvent, initMetaCookies } from '@/utils/metaTracking';

export const MetaPixel = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Capture fbclid and initialize cookies immediately on mount
    initMetaCookies();

    // On first render, <head> already fired the Browser Pixel PageView with window.__INITIAL_PV_ID.
    // We still forward the initial PageView to Server CAPI with that exact eventID so ad blockers / ITP never drop landing page views!
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const initialPvId = typeof window !== 'undefined' ? (window as any).__INITIAL_PV_ID : undefined;
      trackMetaEvent('PageView', {}, initialPvId, false, undefined, true);
      return;
    }

    // Fire PageView on client-side route changes (SPA navigation)
    trackMetaEvent('PageView');
  }, [pathname, searchParams]);

  // No HTML output — the pixel script is in layout.tsx <head>
  return null;
};
