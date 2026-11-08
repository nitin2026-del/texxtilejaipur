import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SETTINGS_KEY = 'SYS_STYLE_RECOMMENDATIONS';

export async function POST(request: Request) {
  try {
    const { categoryId, occasion } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ products: [] }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Fetch recommendation rules
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    const rules = settingData?.value || {};
    // Key format: `${categoryId}___${occasion}`
    const ruleKey = `${categoryId}___${occasion}`;
    const configuredProductIds: string[] = rules[ruleKey]?.product_ids || [];

    let products: any[] = [];

    // 2. If configured product IDs exist, fetch them in order
    if (configuredProductIds.length > 0) {
      const { data: matched } = await supabase
        .from('products')
        .select('id, name, price, sale_price, category_id, stock_quantity, product_images(url, is_primary, display_order)')
        .in('id', configuredProductIds);

      if (matched && matched.length > 0) {
        // preserve the exact order configured by admin
        const map = new Map(matched.map(p => [p.id, p]));
        products = configuredProductIds
          .map(id => map.get(id))
          .filter(Boolean) as any[];
      }
    }

    // 3. Fallback: if no specific products configured yet, pick top products from that category
    if (products.length === 0 && categoryId) {
      const { data: fallback } = await supabase
        .from('products')
        .select('id, name, price, sale_price, category_id, stock_quantity, product_images(url, is_primary, display_order)')
        .eq('category_id', categoryId)
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
