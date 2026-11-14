import { SupabaseClient } from '@supabase/supabase-js';

export const META_CLICK_VAULT_KEY = 'SYS_META_CLICK_VAULT';
export const FBC_MAX_AGE_SECONDS = 7776000; // 90 days (Meta official _fbc lifespan)
export const FBC_LOOKBACK_MS = 90 * 24 * 60 * 60 * 1000;

export interface VaultEntry {
  fbc?: string;
  fbp?: string;
  landingUrl?: string;
  clientIp?: string;
  userAgent?: string;
  ts: number;
}

interface VaultStore {
  byFbp: Record<string, VaultEntry>;
  byEmail: Record<string, VaultEntry>;
  byPhone: Record<string, VaultEntry>;
}

const normEmailKey = (email?: string) => (email ? email.trim().toLowerCase() : '');
const normPhoneTailKey = (phone?: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 ? digits.slice(-9) : '';
};

/**
 * Parse a specific cookie from a raw HTTP Cookie header string.
 * If multiple cookies with the same name exist (e.g., host-only and .textilejaipur.com),
 * returns the one with the newest creation timestamp.
 */
export function getCookieFromHeader(cookieHeader: string | null | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  try {
    const parts = cookieHeader.split(';');
    let best: string | undefined;
    let bestTs = -1;
    for (const raw of parts) {
      const p = raw.trim();
      if (p.startsWith(`${name}=`)) {
        const val = decodeURIComponent(p.substring(name.length + 1));
        const segs = val.split('.');
        const ts = segs.length >= 3 ? Number(segs[2]) : 0;
        if (!best || (ts && ts >= bestTs)) {
          best = val;
          if (ts) bestTs = ts;
        }
      }
    }
    return best;
  } catch {
    return undefined;
  }
}

/**
 * Build Set-Cookie header strings for first-party server-side persistence (defeats Safari ITP 24h JS cookie cap).
 */
export function buildMetaSetCookieHeaders(
  host: string | null | undefined,
  opts: { fbc?: string; fbp?: string; landingUrl?: string }
): string[] {
  const headers: string[] = [];
  const isProdDomain = Boolean(host && host.includes('textilejaipur.com'));
  const pushCookie = (name: string, val: string) => {
    const safeVal = val.replace(/[;\r\n]/g, '');
    headers.push(`${name}=${safeVal}; Path=/; Max-Age=${FBC_MAX_AGE_SECONDS}; SameSite=Lax`);
    if (isProdDomain) {
      headers.push(`${name}=${safeVal}; Domain=.textilejaipur.com; Path=/; Max-Age=${FBC_MAX_AGE_SECONDS}; SameSite=Lax`);
    }
  };
  if (opts.fbc && opts.fbc.startsWith('fb.')) pushCookie('_fbc', opts.fbc);
  if (opts.fbp && opts.fbp.startsWith('fb.')) pushCookie('_fbp', opts.fbp);
  if (opts.landingUrl) {
    const encoded = encodeURIComponent(opts.landingUrl);
    pushCookie('_tj_landing', encoded);
  }
  return headers;
}

/**
 * Save a visitor's Day-1 Meta Ad Click (_fbc) into the server-side vault indexed by:
 *   1. _fbp (browser ID)
 *   2. email (if provided via Lead popup, login, or checkout form blur)
 *   3. phone tail (if provided via checkout form blur)
 * This guarantees that even if a customer clicks an ad on Day 1, only views a product or adds to cart
 * (without creating an order), leaves, and returns 3+ days later to purchase, we still recover their Day-1 _fbc!
 */
export async function saveAdClickToVault(
  supabaseAdmin: SupabaseClient,
  data: {
    fbc?: string;
    fbp?: string;
    email?: string;
    phone?: string;
    landingUrl?: string;
    clientIp?: string;
    userAgent?: string;
  }
): Promise<void> {
  const hasValidFbc = Boolean(data.fbc && data.fbc.startsWith('fb.'));
  const isMetaSession =
    hasValidFbc ||
    Boolean(data.landingUrl && (data.landingUrl.includes('fbclid=') || data.landingUrl.includes('utm_'))) ||
    /FBAN|FBAV|FBIOS|Instagram|MetaIAB/i.test(data.userAgent || '');

  if (!isMetaSession) return;
  const fbpKey = data.fbp?.trim() || '';
  const emailKey = normEmailKey(data.email);
  const phoneKey = normPhoneTailKey(data.phone);
  if (!fbpKey && !emailKey && !phoneKey) return;

  try {
    const { data: existingRow } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', META_CLICK_VAULT_KEY)
      .maybeSingle();

    const now = Date.now();
    const rawVault = (existingRow?.value || {}) as Partial<VaultStore>;
    const vault: VaultStore = {
      byFbp: { ...(rawVault.byFbp || {}) },
      byEmail: { ...(rawVault.byEmail || {}) },
      byPhone: { ...(rawVault.byPhone || {}) },
    };

    const entry: VaultEntry = {
      fbc: hasValidFbc ? data.fbc : undefined,
      fbp: fbpKey || undefined,
      landingUrl: data.landingUrl || undefined,
      clientIp: data.clientIp || undefined,
      userAgent: data.userAgent || undefined,
      ts: now,
    };

    const mergeEntry = (prev?: VaultEntry): VaultEntry => ({
      fbc: entry.fbc || prev?.fbc,
      fbp: entry.fbp || prev?.fbp,
      landingUrl:
        entry.landingUrl && (entry.landingUrl.includes('fbclid=') || entry.landingUrl.includes('utm_'))
          ? entry.landingUrl
          : prev?.landingUrl && (prev.landingUrl.includes('fbclid=') || prev.landingUrl.includes('utm_') || prev.landingUrl.includes('/product/'))
            ? prev.landingUrl
            : entry.landingUrl || prev?.landingUrl,
      clientIp: entry.clientIp || prev?.clientIp,
      userAgent: entry.userAgent || prev?.userAgent,
      ts: now,
    });

    if (fbpKey) vault.byFbp[fbpKey] = mergeEntry(vault.byFbp[fbpKey]);
    if (emailKey) vault.byEmail[emailKey] = mergeEntry(vault.byEmail[emailKey]);
    if (phoneKey) vault.byPhone[phoneKey] = mergeEntry(vault.byPhone[phoneKey]);

    // Prune expired entries (> 90 days) and cap map size to 1500 most recent entries per index
    const pruneMap = (map: Record<string, VaultEntry>) => {
      const entries = Object.entries(map).filter(([, v]) => v && (v.fbc || v.fbp) && now - (v.ts || 0) <= FBC_LOOKBACK_MS);
      if (entries.length > 1500) {
        entries.sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
        return Object.fromEntries(entries.slice(0, 1500));
      }
      return Object.fromEntries(entries);
    };

    vault.byFbp = pruneMap(vault.byFbp);
    vault.byEmail = pruneMap(vault.byEmail);
    vault.byPhone = pruneMap(vault.byPhone);

    await supabaseAdmin
      .from('site_settings')
      .upsert({ key: META_CLICK_VAULT_KEY, value: vault }, { onConflict: 'key' });
  } catch (err) {
    // Non-critical background persistence
  }
}

/**
 * Look up a returning visitor's Day-1 Meta Ad Click (_fbc and landingUrl) from the server-side vault
 * using their _fbp cookie, email(s), or phone number.
 */
export async function lookupAdClickFromVault(
  supabaseAdmin: SupabaseClient,
  query: {
    fbp?: string;
    emails?: (string | undefined)[];
    phone?: string;
  }
): Promise<VaultEntry | undefined> {
  try {
    const { data: row } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', META_CLICK_VAULT_KEY)
      .maybeSingle();

    if (!row?.value) return undefined;
    const vault = row.value as Partial<VaultStore>;
    const now = Date.now();
    const isValid = (e?: VaultEntry) => Boolean(e && (e.fbc || e.fbp) && now - (e.ts || 0) <= FBC_LOOKBACK_MS);

    // 1. Check by email (strongest cross-device & cross-browser identifier)
    for (const rawEmail of query.emails || []) {
      const ek = normEmailKey(rawEmail);
      if (ek && vault.byEmail?.[ek] && isValid(vault.byEmail[ek])) {
        return vault.byEmail[ek];
      }
    }

    // 2. Check by phone tail (9 digits)
    const pk = normPhoneTailKey(query.phone);
    if (pk && vault.byPhone?.[pk] && isValid(vault.byPhone[pk])) {
      return vault.byPhone[pk];
    }

    // 3. Check by _fbp browser identifier (same browser returning days later after _fbc expired)
    const fk = query.fbp?.trim();
    if (fk && vault.byFbp?.[fk] && isValid(vault.byFbp[fk])) {
      return vault.byFbp[fk];
    }
  } catch {
    // ignore lookup error
  }
  return undefined;
}
