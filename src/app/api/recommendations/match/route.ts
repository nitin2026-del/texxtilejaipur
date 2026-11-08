import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SETTINGS_KEY = 'SYS_STYLE_RECOMMENDATIONS';

export async function POST(request: Request) {
  try {
    const { categoryId, categoryName, occasion } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ products: [] }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Fetch all categories to resolve UUID, slug, or name
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name, slug');

    const cleanInputId = String(categoryId || '').trim();
    const cleanInputName = String(categoryName || '').trim();

    const matchedCat = (allCategories || []).find(c => 
      c.id === cleanInputId ||
      c.slug === cleanInputId ||
      c.name.toLowerCase() === cleanInputId.toLowerCase() ||
      c.name.toLowerCase().replace(/\s+/g, '-') === cleanInputId.toLowerCase() ||
      (cleanInputName && c.name.toLowerCase() === cleanInputName.toLowerCase())
    );

    const resolvedCatId = matchedCat?.id || cleanInputId;

    // 2. Fetch recommendation rules
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    const rules = settingData?.value || {};

    // Check multiple key patterns for 100% match resilience
    const candidateKeys = [
      `${resolvedCatId}___${occasion}`,
      `${cleanInputId}___${occasion}`,
      matchedCat?.slug ? `${matchedCat.slug}___${occasion}` : null,
      matchedCat?.name ? `${matchedCat.name}___${occasion}` : null,
    ].filter(Boolean) as string[];

    let configuredProductIds: string[] = [];
    for (const key of candidateKeys) {
      if (rules[key]?.product_ids && rules[key].product_ids.length > 0) {
        configuredProductIds = rules[key].product_ids;
        break;
      }
    }

    // Fuzzy check if exact key wasn't matched
    if (configuredProductIds.length === 0) {
      const lowerOccasion = String(occasion || '').toLowerCase().trim();
      for (const [key, val] of Object.entries(rules)) {
        const parts = key.split('___');
        if (parts.length === 2) {
          const [keyCat, keyOcc] = parts;
          const catMatches = keyCat === resolvedCatId || keyCat === cleanInputId || (matchedCat && keyCat === matchedCat.slug);
          const occMatches = keyOcc.toLowerCase().trim() === lowerOccasion;
          if (catMatches && occMatches && Array.isArray((val as any)?.product_ids)) {
            configuredProductIds = (val as any).product_ids;
            break;
          }
        }
      }
    }

    let products: any[] = [];

    // 3. If configured product IDs exist, fetch them in order
    if (configuredProductIds.length > 0) {
      const { data: matched } = await supabase
        .from('products')
        .select('id, name, price, sale_price, category_id, stock_quantity, product_images(url, is_primary, display_order)')
        .in('id', configuredProductIds);

      if (matched && matched.length > 0) {
        const map = new Map(matched.map(p => [p.id, p]));
        products = configuredProductIds
          .map(id => map.get(id))
          .filter(Boolean) as any[];
      }
    }

    // 4. Fallback: if no specific products configured yet, pick top products from that category
    if (products.length === 0 && resolvedCatId) {
      let query = supabase
        .from('products')
        .select('id, name, price, sale_price, category_id, stock_quantity, product_images(url, is_primary, display_order)');

      if (matchedCat?.id) {
        query = query.eq('category_id', matchedCat.id);
      } else {
        query = query.eq('category_id', resolvedCatId);
      }

      const { data: fallback } = await query
        .order('display_rank', { ascending: true, nullsFirst: false })
        .limit(6);

      if (fallback && fallback.length > 0) {
        products = fallback;
      }
    }

    // Format primary images
    const formatted = products.map(p => {
      const sortedImages = p.product_images
        ? [...p.product_images]
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map(img => img.url)
        : [];
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        sale_price: p.sale_price,
        image: sortedImages[0] || '/placeholder.jpg',
        images: sortedImages,
        stock_quantity: p.stock_quantity
      };
    });

    return NextResponse.json({
      products: formatted,
      isCurated: configuredProductIds.length > 0
    });
  } catch (error: any) {
    console.error('Match recommendations error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
