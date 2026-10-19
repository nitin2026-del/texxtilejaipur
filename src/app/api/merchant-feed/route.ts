import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache feed for 5 minutes

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currencyParam = (searchParams.get('currency') || 'INR').toUpperCase();

  const FX_RATES: Record<string, number> = {
    INR: 1,
    USD: 0.0104,
    EUR: 0.0091,
    GBP: 0.0079,
    AED: 0.03948,
    AUD: 0.01615,
    NZD: 0.02,
    CAD: 0.0165,
  };

  const currency = FX_RATES[currencyParam] ? currencyParam : 'INR';
  const rate = FX_RATES[currency];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return new NextResponse('Missing Supabase configuration', { status: 500 });
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/products?select=id,name,description,price,stock,stock_quantity,details,categories(name),product_images(url,is_primary,display_order)&order=display_rank.asc.nullslast`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return new NextResponse('Failed to fetch products', { status: 500 });
    }

    const products = await res.json();

    const itemsXml = (products || [])
      .filter((p: any) => p.price && Number(p.price) > 0)
      .map((item: any) => {
        const sku = `HT-${item.id.slice(0, 8).toUpperCase()}`;
        const sortedImages = item.product_images
          ? [...item.product_images]
              .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
              .map((img: any) => img.url)
              .filter(Boolean)
          : [];

        const primaryImage =
          item.product_images?.find((img: any) => img.is_primary)?.url ||
          sortedImages[0] ||
          'https://textilejaipur.com/about/img1.jpg';

        const additionalImages = sortedImages
          .filter((imgUrl: string) => imgUrl !== primaryImage)
          .slice(0, 10);

        const cleanDesc = (item.description || item.name || '')
          .replace(/\*\*SEO Title:\*\*.*?\n/gi, '')
          .replace(/\*\*SEO Description:\*\*.*?\n/gi, '')
          .replace(/[*#_~`]/g, '')
          .trim();

        const convertedPrice = (Number(item.price) * rate).toFixed(2);
        const availability =
          (item.stock_quantity > 0 || item.stock > 0) ? 'in_stock' : 'out_of_stock';
        const categoryName = item.categories?.name || 'Ethnic Wear';
        const color =
          item.details?.image_analysis?.colorPalette?.dominant || 'Multicolor';
        const material = item.details?.material || 'Handloom Cotton & Velvet';
        const productUrl =
          currency === 'INR'
            ? `https://textilejaipur.com/product/${item.id}`
            : `https://textilejaipur.com/product/${item.id}?currency=${currency}`;

        const additionalImagesXml = additionalImages
          .map((imgUrl: string) => `      <g:additional_image_link>${escapeXml(imgUrl)}</g:additional_image_link>`)
          .join('\n');

        return `    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <g:title>${escapeXml(item.name)}</g:title>
      <g:description>${escapeXml(cleanDesc.slice(0, 4900))}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>
${additionalImagesXml ? additionalImagesXml + '\n' : ''}      <g:availability>${availability}</g:availability>
      <g:price>${convertedPrice} ${currency}</g:price>
      <g:brand>Textile Jaipur</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
      <g:product_type>${escapeXml(categoryName)}</g:product_type>
      <g:age_group>adult</g:age_group>
      <g:gender>female</g:gender>
      <g:color>${escapeXml(color)}</g:color>
      <g:material>${escapeXml(material)}</g:material>
      <g:size>One Size</g:size>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Free Shipping</g:service>
        <g:price>0.00 ${currency}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>International Express Free Shipping</g:service>
        <g:price>0.00 ${currency}</g:price>
      </g:shipping>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Textile Jaipur - Official Product Feed (${currency})</title>
    <link>https://textilejaipur.com</link>
    <description>Authentic Handmade Jaipur Ethnic Wear &amp; Suzani Jackets</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Error generating Google Merchant feed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
