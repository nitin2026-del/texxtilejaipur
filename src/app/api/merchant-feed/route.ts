import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache feed for 5 minutes

// All 95 official Google Merchant Center supported target countries (<= 100 limit per item)
const GMC_COUNTRIES = [
  'AE', 'AO', 'AR', 'AT', 'AU', 'BD', 'BE', 'BF', 'BG', 'BH',
  'BR', 'BY', 'CA', 'CH', 'CI', 'CL', 'CM', 'CO', 'CR', 'CY',
  'CZ', 'DE', 'DK', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ES', 'ET',
  'FI', 'FR', 'GB', 'GE', 'GH', 'GR', 'GT', 'HK', 'HR', 'HU',
  'ID', 'IE', 'IL', 'IN', 'IT', 'JO', 'JP', 'KE', 'KH', 'KR',
  'KW', 'KZ', 'LB', 'LK', 'LU', 'LV', 'MA', 'MG', 'MM',
  'MT', 'MU', 'MX', 'MY', 'MZ', 'NG', 'NI', 'NL', 'NO', 'NP',
  'NZ', 'OM', 'PA', 'PE', 'PH', 'PK', 'PL', 'PR', 'PT', 'PY',
  'QA', 'RO', 'RU', 'SA', 'SE', 'SG', 'SI', 'SK', 'SN', 'SV',
  'TH', 'TN', 'TR', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ',
  'VE', 'VN', 'ZA', 'ZM', 'ZW',
].slice(0, 100);

function escapeXml(unsafe: string): string {
  return String(unsafe || '')
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
    MXN: 0.1936,
  };

  const currency = FX_RATES[currencyParam] ? currencyParam : 'INR';
  const rate = FX_RATES[currency];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return new NextResponse('Missing Supabase credentials', { status: 500 });
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/products?select=id,name,slug,description,seo_title,seo_description,price,stock,stock_quantity,details,categories(name),product_images(url,is_primary,display_order)&status=eq.active&order=display_rank.asc.nullslast`,
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
    const baseUrl = 'https://www.textilejaipur.com';

    // Pre-build the worldwide shipping XML block in the exact same currency as the item price
    const shippingXml = GMC_COUNTRIES.map(
      (countryCode) =>
        `      <g:shipping><g:country>${countryCode}</g:country><g:service>Free Worldwide Express Shipping</g:service><g:price>0.00 ${currency}</g:price><g:min_handling_time>1</g:min_handling_time><g:max_handling_time>3</g:max_handling_time><g:min_transit_time>5</g:min_transit_time><g:max_transit_time>12</g:max_transit_time></g:shipping>`
    ).join('\n');

    const itemsXml = (products || [])
      .filter((p: any) => p.price && Number(p.price) > 0)
      .map((item: any) => {
        const sku = `HT-${item.id.slice(0, 8).toUpperCase()}`;
        const sortedImages = item.product_images
          ? [...item.product_images]
              .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
              .map((img: any) => img.url)
              .filter((u: string) => Boolean(u) && !/\.(mp4|webm|mov|ogg)$/i.test(u))
          : [];

        if (sortedImages.length === 0) return '';

        const primaryImage =
          item.product_images?.find((img: any) => img.is_primary && !/\.(mp4|webm|mov|ogg)$/i.test(img.url))?.url ||
          sortedImages[0];

        const additionalImages = sortedImages
          .filter((imgUrl: string) => imgUrl !== primaryImage)
          .slice(0, 10);

        const categoryName = item.categories?.name || 'Velvet Suzani Jacket';
        const isBag = /bag|tote/i.test(categoryName);
        const isDress = /dress/i.test(categoryName);
        const googleProductCategory = isBag
          ? 'Apparel & Accessories > Handbags, Wallets & Cases > Handbags'
          : isDress
            ? 'Apparel & Accessories > Clothing > Dresses'
            : 'Apparel & Accessories > Clothing > Outerwear > Coats & Jackets';

        const color =
          item.details?.color ||
          item.details?.image_analysis?.colorPalette?.dominant?.replace(/\s*\(#.*?\)/g, '').trim() ||
          'Multicolor';
        const material =
          item.details?.material ||
          (/velvet/i.test(categoryName) ? '100% Plush Velvet & Cotton Lining' : '100% Organic Handloom Cotton');
        const pattern =
          item.details?.pattern ||
          item.details?.image_analysis?.craftTechnique ||
          'Suzani Floral Chain-Stitch Hand Embroidery';
        const sizeLabel = isBag ? 'One Size' : 'Free Size (Fits XS-XL)';
        const gtin = item.details?.gtin || '';

        // Google Merchant Center best practice title:
        // Brand + Gender + Product Name + Product Type + Color + Material + Size + Model/SKU
        const baseName = (item.name || '').split('—')[0].split('|')[0].trim();
        const productType = item.details?.product_type || `Hand-Embroidered ${categoryName}`;
        const richTitle = `Textile Jaipur Women's ${baseName} — ${color !== 'Multicolor' && !baseName.toLowerCase().includes(color.toLowerCase()) ? color + ' ' : ''}${productType} (${sizeLabel}, ${sku})`.slice(0, 150);

        const cleanDesc = (item.seo_description || item.description || item.name || '')
          .replace(/\*\*SEO Title:\*\*.*?\n/gi, '')
          .replace(/\*\*SEO Description:\*\*.*?\n/gi, '')
          .replace(/[*#_~`]/g, '')
          .trim();

        const convertedPrice = (Number(item.price) * rate).toFixed(2);
        const availability =
          item.stock_quantity > 0 || item.stock > 0 ? 'in_stock' : 'out_of_stock';
        const productUrl =
          currency === 'INR'
            ? `${baseUrl}/product/${item.id}`
            : `${baseUrl}/product/${item.id}?currency=${currency}`;

        const additionalImagesXml = additionalImages
          .map(
            (imgUrl: string) =>
              `      <g:additional_image_link>${escapeXml(imgUrl)}</g:additional_image_link>`
          )
          .join('\n');

        const identifierXml = gtin
          ? `      <g:gtin>${escapeXml(gtin)}</g:gtin>\n      <g:mpn>${escapeXml(sku)}</g:mpn>\n      <g:identifier_exists>yes</g:identifier_exists>`
          : `      <g:mpn>${escapeXml(sku)}</g:mpn>\n      <g:identifier_exists>no</g:identifier_exists>`;

        return `    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <g:item_group_id>${escapeXml(sku)}</g:item_group_id>
      <g:title>${escapeXml(richTitle)}</g:title>
      <g:description>${escapeXml(cleanDesc.slice(0, 4900))}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>
${additionalImagesXml ? additionalImagesXml + '\n' : ''}      <g:availability>${availability}</g:availability>
      <g:price>${convertedPrice} ${currency}</g:price>
      <g:brand>Textile Jaipur</g:brand>
      <g:condition>new</g:condition>
${identifierXml}
      <g:google_product_category>${escapeXml(googleProductCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(`Hand-Embroidered Outerwear > ${categoryName}`)}</g:product_type>
      <g:age_group>adult</g:age_group>
      <g:gender>female</g:gender>
      <g:color>${escapeXml(color)}</g:color>
      <g:material>${escapeXml(material)}</g:material>
      <g:pattern>${escapeXml(pattern)}</g:pattern>
      <g:size>${escapeXml(sizeLabel)}</g:size>
      <g:size_type>regular</g:size_type>
      <g:size_system>US</g:size_system>
      <g:product_highlight>100% Hand-Embroidered Suzani Needlework by Master Artisans in Jaipur, India</g:product_highlight>
      <g:product_highlight>Material: ${escapeXml(material)}</g:product_highlight>
      <g:product_highlight>Color: ${escapeXml(color)} | Size: ${escapeXml(sizeLabel)}</g:product_highlight>
      <g:product_highlight>Free Worldwide Express Shipping (5-10 Business Days) with 30-Day Returns</g:product_highlight>
${shippingXml}
    </item>`;
      })
      .filter(Boolean)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Textile Jaipur - Official Product Feed (${currency})</title>
    <link>${baseUrl}</link>
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
