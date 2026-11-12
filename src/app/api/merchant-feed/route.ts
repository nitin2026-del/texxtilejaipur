import { NextResponse } from 'next/server';

export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return new NextResponse('Missing Supabase configuration', { status: 500 });
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/products?select=id,name,slug,description,seo_title,seo_description,price,stock,stock_quantity,details,categories(name),product_images(url,is_primary,display_order)&status=eq.active&order=display_rank.asc.nullslast`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return new NextResponse('Failed to fetch products', { status: 500 });
    }

    const products = await res.json();
    const baseUrl = 'https://www.textilejaipur.com';

    const itemsXml = (products as any[])
      .map((p) => {
        const sortedImages = (p.product_images || [])
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((img: any) => img.url)
          .filter(Boolean);

        if (sortedImages.length === 0) return '';

        const primaryImage = sortedImages[0];
        const additionalImages = sortedImages.slice(1, 10);
        const categoryName = p.categories?.name || 'Embroidered Jacket';
        const isBag = /bag/i.test(categoryName);
        const isDress = /dress/i.test(categoryName);
        const googleProductCategory = isBag
          ? 'Apparel & Accessories > Handbags, Wallets & Cases > Handbags'
          : isDress
            ? 'Apparel & Accessories > Clothing > Dresses'
            : 'Apparel & Accessories > Clothing > Outerwear > Coats & Jackets';

        const cleanTitle = p.seo_title
          ? p.seo_title.replace(/\s*\|\s*Textile Jaipur.*$/i, '').replace(/\.\.\./g, '').trim()
          : `${p.name} — Hand-Embroidered ${categoryName}`;

        const cleanDesc = (p.seo_description || p.description || `Authentic hand-embroidered ${p.name} handcrafted by master artisans in Jaipur, Rajasthan.`)
          .replace(/[*#_~`]/g, '')
          .trim()
          .slice(0, 4900);

        const inStock = (p.stock_quantity || p.stock || 0) > 0;
        const priceInr = Number(p.price || 0).toFixed(2);
        const material = p.details?.material || (/velvet/i.test(categoryName) ? 'Velvet' : 'Cotton');
        const color = p.details?.image_analysis?.colorPalette?.dominant || 'Multicolor';
        const sku = `HT-${String(p.id).slice(0, 8).toUpperCase()}`;

        return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:mpn>${escapeXml(sku)}</g:mpn>
      <g:title>${escapeXml(cleanTitle)}</g:title>
      <g:description>${escapeXml(cleanDesc)}</g:description>
      <g:link>${baseUrl}/product/${escapeXml(p.id)}</g:link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>
${additionalImages.map((img: string) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n')}
      <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${priceInr} INR</g:price>
      <g:brand>Textile Jaipur</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${escapeXml(googleProductCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(`Hand-Embroidered Outerwear > ${categoryName}`)}</g:product_type>
      <g:age_group>adult</g:age_group>
      <g:gender>female</g:gender>
      <g:material>${escapeXml(material)}</g:material>
      <g:color>${escapeXml(color)}</g:color>
      <g:size>Free Size</g:size>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Express</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Express</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
      })
      .filter(Boolean)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Textile Jaipur — Hand-Embroidered Suzani Jackets &amp; Artisan Outerwear</title>
    <link>${baseUrl}</link>
    <description>Authentic hand-embroidered Suzani jackets, velvet coats, cotton jackets, and boho kimonos handcrafted by master artisans in Jaipur, Rajasthan.</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Merchant feed error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
