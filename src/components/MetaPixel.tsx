'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trackMetaEvent } from '@/utils/metaTracking';

export const MetaPixel = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render — the <head> script already fired the initial PageView
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Fire PageView on client-side route changes (SPA navigation)
    trackMetaEvent('PageView');
  }, [pathname, searchParams]);

  // No HTML output — the pixel script is in layout.tsx <head>
  return null;
};
