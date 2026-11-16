import { NextRequest, NextResponse } from 'next/server';

const MAX_AGE_90_DAYS = 7776000;

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const searchParams = url.searchParams;
    const urlFbclid = searchParams.get('fbclid');
    const hasUtm =
      searchParams.has('utm_source') ||
      searchParams.has('utm_campaign') ||
      searchParams.has('utm_content') ||
      searchParams.has('utm_id');

    const existingFbc = req.cookies.get('_fbc')?.value;
    const existingFbp = req.cookies.get('_fbp')?.value;
    const existingLanding = req.cookies.get('_tj_landing')?.value;

    const ua = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    // Detect iOS ATT / EU DMA visits from Facebook or Instagram where Meta/Apple stripped ?fbclid=
    const isMetaAppOrReferer =
      /FBAN|FBAV|FBIOS|Instagram|MetaIAB/i.test(ua) ||
      /facebook\.com|instagram\.com|fb\.com|messenger\.com/i.test(referer);

    // Fast path: if no ad params, not coming from Meta app/referer, and no existing _fbc cookie to refresh, do nothing
    if (!urlFbclid && !hasUtm && !existingFbc && !isMetaAppOrReferer) {
      return NextResponse.next();
    }

    const res = NextResponse.next();
    const host = req.headers.get('host') || '';
    const isProdDomain = host.includes('textilejaipur.com');
    const now = Date.now();

    const isOrganicBioLink =
      searchParams.get('utm_content') === 'link_in_bio' ||
      searchParams.get('utm_medium') === 'social';

    // 1. Resolve _fbc (preserve creation timestamp if fbclid matches existing _fbc; never let an organic link_in_bio fbclid overwrite an existing _fbc)
    let fbcToSet = existingFbc;
    if (urlFbclid && !(isOrganicBioLink && existingFbc)) {
      if (existingFbc && existingFbc.endsWith(`.${urlFbclid}`)) {
        fbcToSet = existingFbc;
      } else {
        fbcToSet = `fb.1.${now}.${urlFbclid}`;
      }
    }

    // 2. Resolve _fbp (ensure every ad clicker — including iOS ATT / EU visitors without fbclid — gets a server-set 90-day _fbp immediately)
    const fbpToSet =
      existingFbp || `fb.1.${now}.${Math.floor(Math.random() * 1000000000)}`;

    const appendServerCookie = (name: string, val: string) => {
      const safeVal = val.replace(/[;\r\n]/g, '');
      res.headers.append(
        'Set-Cookie',
        `${name}=${safeVal}; Path=/; Max-Age=${MAX_AGE_90_DAYS}; SameSite=Lax`
      );
      if (isProdDomain) {
        res.headers.append(
          'Set-Cookie',
          `${name}=${safeVal}; Domain=.textilejaipur.com; Path=/; Max-Age=${MAX_AGE_90_DAYS}; SameSite=Lax`
        );
      }
    };

    if (fbcToSet) {
      appendServerCookie('_fbc', fbcToSet);
    }
    if (fbpToSet) {
      appendServerCookie('_fbp', fbpToSet);
    }
    const isPaymentReturn =
      searchParams.has('payment') || url.pathname.startsWith('/payment/');
    if (!isPaymentReturn && !(isOrganicBioLink && existingLanding) && (urlFbclid || hasUtm || (isMetaAppOrReferer && !existingLanding))) {
      appendServerCookie('_tj_landing', encodeURIComponent(req.url));
    }

    return res;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico|txt|xml|json|css|js|woff|woff2)$).*)',
  ],
};
