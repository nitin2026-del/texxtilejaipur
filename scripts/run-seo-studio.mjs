import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment configurations
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const geminiKeys = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

/**
 * Downloads image and converts to inline base64 part
 */
async function fetchImageInlineData(imageUrl) {
  try {
    let resolvedUrl = (imageUrl || '').trim();
    if (!resolvedUrl) return null;
    if (resolvedUrl.startsWith('//')) resolvedUrl = `https:${resolvedUrl}`;
    else if (resolvedUrl.startsWith('/')) resolvedUrl = `https://textilejaipur.com${resolvedUrl}`;
    else if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
      resolvedUrl = `https://textilejaipur.com/${resolvedUrl}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(resolvedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TextileJaipur-SeoBot/1.0',
        Accept: 'image/webp,image/jpeg,image/png,image/*;q=0.8'
      }
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;

    let mimeType = resp.headers.get('content-type') || 'image/jpeg';
    if (!mimeType.startsWith('image/')) mimeType = 'image/jpeg';

    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType
      }
    };
  } catch {
    return null;
  }
}

/**
 * Rule-based fallback generator
 */
function generateFallbackSeo(input) {
  const name = input.name || 'Handcrafted Jaipur Garment';
  const category = input.category || 'Ethnic Wear';
  const material = input.material || 'Pure Cotton & Handloom Fabric';
  const origin = input.origin || 'Jaipur, Rajasthan, India';
  const cleanName = name.trim();
  const isSuzani = /suzani/i.test(cleanName) || /suzani/i.test(category);
  const isKimono = /kimono|robe/i.test(cleanName) || /kimono/i.test(category);
  const isDress = /dress|gown|maxi/i.test(cleanName) || /dress/i.test(category);
  const isJacket = /jacket|coat/i.test(cleanName) || /jacket/i.test(category);

  let craft = 'Hand Block Printing & Kantha Stitch';
  let silhouette = 'Relaxed Bohemian Cut';
  let mood = 'Bohemian Artisan Luxury';

  if (isSuzani) {
    craft = 'Artisanal Silk-Thread Suzani Needlework';
    silhouette = isJacket ? 'Structured Bohemian Duster & Jacket' : 'Artisanal Outerwear';
    mood = 'Vintage Heritage Boho-Chic';
  } else if (isKimono) {
    craft = 'Traditional Bagru Hand-Block Print';
    silhouette = 'Draped Open-Front Kimono Robe with Wide Sleeves';
    mood = 'Resort Wear & Bohemian Loungewear';
  } else if (isDress) {
    craft = 'Sanganeri Floral Block Print';
    silhouette = 'Flowing Tiered Bohemian Maxi Dress';
    mood = 'Ethereal Summer Chic';
  }

  let seoTitle = `${cleanName} | Handmade Jaipur Ethnic Wear | Textile Jaipur`;
  if (seoTitle.length > 68) seoTitle = `${cleanName} - Jaipur Boho Wear | Textile Jaipur`;
  if (seoTitle.length > 68) seoTitle = `${cleanName.substring(0, 48)}... | Textile Jaipur`;

  const seoDescription = `Shop authentic handmade ${cleanName.toLowerCase()} crafted from ${material.toLowerCase()} in Jaipur. Free express worldwide shipping at Textile Jaipur.`.slice(0, 158);

  const seoKeywords = [
    cleanName.toLowerCase(),
    'handmade indian clothing',
    'jaipur ethnic wear',
    'bohemian clothing online',
    'sustainable artisan fashion',
    isSuzani ? 'suzani jacket' : 'block print clothing',
    isSuzani ? 'vintage embroidered jacket' : 'cotton kimono robe',
    'authentic rajasthani clothing',
    'textile jaipur export',
    'worldwide shipping clothing'
  ];

  const productDescription = `Discover the extraordinary artistry of our ${cleanName}, an exquisite testament to Jaipur's centuries-old textile traditions. Handcrafted with meticulous precision, this piece showcases breathtaking artisanal details, organic textures, and a harmonious color palette that captures the romantic essence of Rajasthan.\n\nFashioned from high-grade ${material.toLowerCase()}, each garment is tailored for effortless comfort and a flattering silhouette. Whether layered over modern staples or worn as a statement piece, it reflects conscious sustainable craftsmanship born from the heritage ateliers of Jaipur.`;

  const culturalContext = `Handcrafted in the legendary artisan quarters of Jaipur, Rajasthan, this piece honors generations of master dyers and needleworkers. Authentic Indian textiles celebrate heritage techniques like wooden hand-block printing and needlepoint embroidery, preserving slow-fashion craft culture.`;

  const stylingAdvice = `Elevate this piece by pairing it with classic high-waisted denim and leather mules for an effortless bohemian fusion look, or drape it over a sleek slip dress with minimalist gold jewelry for evening elegance.`;

  const imageAltTexts = (input.imageUrls && input.imageUrls.length > 0)
    ? input.imageUrls.map((_, i) => `${cleanName} - View ${i + 1} - Handmade ${category} from Textile Jaipur`)
    : [`${cleanName} - Handmade ${category} from Textile Jaipur`];

  return {
    seoTitle,
    seoDescription,
    seoKeywords,
    productDescription,
    culturalContext,
    stylingAdvice,
    translations: {
      fr: `Découvrez la beauté artisanale de ${cleanName}, confectionné à la main à Jaipur avec des finitions d'exception. Livraison internationale offerte par Textile Jaipur.`,
      es: `Descubre la belleza artesanal de ${cleanName}, hecho a mano en Jaipur con técnicas tradicionales y materiales de primera calidad. Envío gratis a todo el mundo con Textile Jaipur.`,
      de: `Entdecken Sie das authentische, handgefertigte ${cleanName} aus Jaipur, veredelt mit traditioneller indischer Handwerkskunst. Weltweiter kostenloser Versand bei Textile Jaipur.`,
      ar: `اكتشف أناقة ${cleanName} المصنوع يدويًا في جايبور بحرفية راقية وأقمشة فاخرة. شحن مجاني لجميع أنحاء العالم من تيكستايل جايبور.`
    },
    imageAnalysis: {
      colorPalette: {
        dominant: 'Rich Earth Tones',
        secondary: 'Indigo & Terracotta',
        accents: ['Golden Ochre', 'Warm Ivory']
      },
      craftTechnique: craft,
      fabricTexture: material,
      garmentSilhouette: silhouette,
      aestheticMood: mood,
      artisanProvenance: origin,
      imageAltTexts
    }
  };
}

/**
 * AI Multimodal Vision + SEO Generator
 */
async function analyzeProduct(input) {
  if (geminiKeys.length === 0) {
    return generateFallbackSeo(input);
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const promptParts = [];
  const primaryImage = input.imageUrls?.[0] || null;

  if (primaryImage) {
    const inlinePart = await fetchImageInlineData(primaryImage);
    if (inlinePart) promptParts.push(inlinePart);
  }

  const promptText = `
You are the Chief SEO Strategist and Luxury Fashion Copywriter for "Textile Jaipur" (textilejaipur.com), an internationally acclaimed brand specializing in authentic handmade Indian clothing, Suzani jackets, bohemian robes, and artisan textiles shipped to customers in the USA, UK, Europe, Australia, and worldwide.

Analyze this product:
- Product Name: "${input.name}"
- Category: "${input.category || 'Ethnic Wear'}"
- Material / Fabric: "${input.material || 'Premium Handloom Fabric'}"
- Origin: "${input.origin || 'Jaipur, Rajasthan, India'}"
${input.currentDescription ? `- Existing Raw Notes: "${input.currentDescription}"` : ''}

${promptParts.length > 0 ? 'CRITICAL VISION INSTRUCTION: Inspect the attached product image closely. Identify the exact visible color shades, embroidery style (e.g. Suzani needlework, Aari chain stitch, Kantha, block print), pattern motifs (florals, paisleys, geometric borders), fabric texture, and silhouette cut. Weave these genuine visual observations into the SEO copy and image tags.' : 'Note: Generate optimized vision-inspired metadata based on the artisanal standards of Textile Jaipur.'}

Produce a complete SEO Copywriting and Image Analysis package adhering STRICTLY to these guidelines:
1. "seoTitle": 50 to 65 characters (ideal for Google Search SERP without truncation). Format: [Visual Highlight] + [Garment Type] | [Textile Jaipur]
2. "seoDescription": 145 to 160 characters (vital for Google meta description). Includes garment type, visible colors/fabrics, Jaipur artisan origin, free worldwide shipping, and CTA.
3. "seoKeywords": Array of 10-14 high-volume, long-tail search terms.
4. "productDescription": Exactly 2 rich, evocative narrative paragraphs in English.
5. "culturalContext": 2-3 sentences explaining historical Indian craft tradition.
6. "stylingAdvice": 2-3 sentences advising an international customer how to style this garment.
7. "imageAltTexts": Array of descriptive, accessible image alt strings.
8. "translations": Poetic, localized product descriptions in French (fr), Spanish (es), German (de), Arabic (ar).

Return ONLY valid JSON matching this schema:
{
  "seoTitle": "string",
  "seoDescription": "string",
  "seoKeywords": ["string"],
  "productDescription": "string",
  "culturalContext": "string",
  "stylingAdvice": "string",
  "imageAltTexts": ["string"],
  "translations": { "fr": "string", "es": "string", "de": "string", "ar": "string" },
  "imageAnalysis": {
    "colorPalette": { "dominant": "string", "secondary": "string", "accents": ["string"] },
    "craftTechnique": "string",
    "fabricTexture": "string",
    "garmentSilhouette": "string",
    "aestheticMood": "string",
    "artisanProvenance": "string"
  }
}
`;

  promptParts.push({ text: promptText });

  for (const apiKey of geminiKeys) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      for (const m of models) {
        try {
          const model = genAI.getGenerativeModel({ model: m });
          const res = await model.generateContent({
            contents: [{ role: 'user', parts: promptParts }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
          });
          if (res?.response) {
            const raw = res.response.text().trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
            const parsed = JSON.parse(raw);
            return {
              seoTitle: (parsed.seoTitle || input.name).trim(),
              seoDescription: (parsed.seoDescription || '').trim(),
              seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [],
              productDescription: parsed.productDescription || parsed.description || input.currentDescription || '',
              culturalContext: parsed.culturalContext || '',
              stylingAdvice: parsed.stylingAdvice || '',
              translations: parsed.translations || { fr: '', es: '', de: '', ar: '' },
              imageAnalysis: {
                colorPalette: {
                  dominant: parsed.imageAnalysis?.colorPalette?.dominant || 'Artisan Palette',
                  secondary: parsed.imageAnalysis?.colorPalette?.secondary || 'Heritage Tone',
                  accents: Array.isArray(parsed.imageAnalysis?.colorPalette?.accents) ? parsed.imageAnalysis.colorPalette.accents : []
                },
                craftTechnique: parsed.imageAnalysis?.craftTechnique || 'Handmade Jaipur Craft',
                fabricTexture: parsed.imageAnalysis?.fabricTexture || (input.material || 'Handloom Cotton'),
                garmentSilhouette: parsed.imageAnalysis?.garmentSilhouette || 'Bohemian Silhouette',
                aestheticMood: parsed.imageAnalysis?.aestheticMood || 'Artisanal Luxury',
                artisanProvenance: parsed.imageAnalysis?.artisanProvenance || 'Jaipur, Rajasthan',
                imageAltTexts: Array.isArray(parsed.imageAltTexts) && parsed.imageAltTexts.length > 0 ? parsed.imageAltTexts : [`${input.name} - Textile Jaipur`]
              }
            };
          }
        } catch {
          // Try next model
        }
      }
    } catch {
      // Try next key
    }
  }

  return generateFallbackSeo(input);
}

/**
 * Persists SEO metadata to Supabase
 */
async function saveToSupabase(supabase, productId, seoResult) {
  const { data: prod } = await supabase.from('products').select('id, details').eq('id', productId).single();
  const updatedDetails = {
    ...(prod?.details || {}),
    culturalContext: seoResult.culturalContext || prod?.details?.culturalContext,
    stylingAdvice: seoResult.stylingAdvice || prod?.details?.stylingAdvice,
    translations: seoResult.translations || prod?.details?.translations,
    seo_keywords: seoResult.seoKeywords,
    image_analysis: seoResult.imageAnalysis
  };

  const { error } = await supabase
    .from('products')
    .update({
      seo_title: seoResult.seoTitle,
      seo_description: seoResult.seoDescription,
      description: seoResult.productDescription,
      details: updatedDetails
    })
    .eq('id', productId);

  return !error;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'scan';

  console.log('===========================================================');
  console.log('  Textile Jaipur - AI Vision & SEO Copywriting Automation  ');
  console.log('  Target: https://textilejaipur.com                        ');
  console.log('===========================================================\n');

  // Flagship Textile Jaipur Catalog for Standalone Mode / Export
  const flagshipCatalog = [
    {
      id: 'tj-suz-cotswold-01',
      name: 'The Cotswold Garden Suzani Cotton Jacket',
      sku: 'TJ-SUZ-COTSWOLD',
      category: 'Suzani Jackets',
      material: '100% Khadi Handloom Cotton & Silk Thread Embroidery',
      origin: 'Jaipur, Rajasthan, India',
      currentDescription: 'Authentic handmade Suzani jacket featuring garden flora motifs and dense chain stitching.',
      imageUrls: [
        'https://textilejaipur.com/images/cotswold-garden-suzani-front.jpg',
        'https://textilejaipur.com/images/cotswold-garden-suzani-detail.jpg',
        'https://textilejaipur.com/images/cotswold-garden-suzani-back.jpg'
      ]
    },
    {
      id: 'tj-vlvt-bkimono-02',
      name: 'Black Velvet Suzani Embroidered Short Kimono Jacket',
      sku: 'TJ-VLVT-BKIMONO',
      category: 'Velvet Jackets',
      material: 'Plush Micro-Velvet with Vibrant Silk-Thread Needlework',
      origin: 'Jaipur, Rajasthan, India',
      currentDescription: 'Luxurious black velvet short kimono coat with floral needlepoint embroidery inspired by royal Rajasthani court textiles.',
      imageUrls: [
        'https://textilejaipur.com/images/black-velvet-suzani-kimono-front.jpg',
        'https://textilejaipur.com/images/black-velvet-suzani-kimono-embroidery.jpg'
      ]
    },
    {
      id: 'tj-suz-indigo-03',
      name: 'Royal Indigo Silk-Thread Suzani TNT Jacket',
      sku: 'TJ-SUZ-TNT-INDIGO',
      category: 'Suzani Jackets',
      material: 'Dense Handwoven Cotton TNT Canvas & Natural Indigo Thread',
      origin: 'Jaipur, Rajasthan, India',
      currentDescription: 'Statement bohemian duster jacket in deep indigo, adorned with hand-stitched sunburst medallions and floral vines.',
      imageUrls: [
        'https://textilejaipur.com/images/royal-indigo-suzani-tnt-front.jpg',
        'https://textilejaipur.com/images/royal-indigo-suzani-tnt-back.jpg'
      ]
    },
    {
      id: 'tj-kan-ivory-04',
      name: 'Ivory Bloom Reversible Kantha Stitch Worker Jacket',
      sku: 'TJ-KAN-IVORY',
      category: 'Kantha Jackets',
      material: 'Vintage Kantha Quilted Handloom Cotton with Wooden Button Accents',
      origin: 'Jaipur, Rajasthan, India',
      currentDescription: 'Two jackets in one: an artisan reversible quilted coat featuring continuous running Kantha needlework on organic cotton.',
      imageUrls: [
        'https://textilejaipur.com/images/ivory-bloom-kantha-front.jpg',
        'https://textilejaipur.com/images/ivory-bloom-kantha-reverse.jpg'
      ]
    },
    {
      id: 'tj-kim-bagru-05',
      name: 'Bagru Dabu Hand-Block Printed Cotton Kimono Robe',
      sku: 'TJ-KIM-BAGRU',
      category: 'Kimono Robes',
      material: 'Pure Mulmul Cotton with Natural Plant Dyes (Mud-Resist Dabu)',
      origin: 'Bagru / Jaipur, Rajasthan, India',
      currentDescription: 'Airy bohemian duster kimono robe crafted using Bagru mud-resist woodblock printing, styled with wide bell sleeves.',
      imageUrls: [
        'https://textilejaipur.com/images/bagru-dabu-kimono-robe-front.jpg',
        'https://textilejaipur.com/images/bagru-dabu-kimono-detail.jpg'
      ]
    },
    {
      id: 'tj-drs-marigold-06',
      name: 'Jaipur Marigold Tiered Bohemian Summer Maxi Dress',
      sku: 'TJ-DRS-MARIGOLD',
      category: 'Bohemian Dresses',
      material: 'Airy Hand-Block Cambric Cotton with Natural Botanical Pigments',
      origin: 'Jaipur, Rajasthan, India',
      currentDescription: 'Ethereal tiered maxi dress featuring festive Jaipur floral motifs, adjustable tassel ties, and sweeping silhouette.',
      imageUrls: [
        'https://textilejaipur.com/images/jaipur-marigold-maxi-dress-front.jpg',
        'https://textilejaipur.com/images/jaipur-marigold-maxi-dress-back.jpg'
      ]
    },
    {
      id: 'tj-bag-tote-07',
      name: 'Handcrafted Quilted Cotton Weekender Shopping Tote',
      sku: 'TJ-BAG-WEEKEND',
      category: 'Artisan Bags',
      material: 'Triple-Layered Quilted Cotton with Sturdy Webbed Handles',
      origin: 'Jaipur, Rajasthan, India',
      currentDescription: 'Sustainable, reusable artisanal shopper tote with geometric block printing and reinforced quilting for daily luxury.',
      imageUrls: [
        'https://textilejaipur.com/images/quilted-cotton-shopper-tote.jpg'
      ]
    },
    {
      id: 'tj-vlvt-emerald-08',
      name: 'Midnight Emerald Velvet Suzani Longline Duster Coat',
      sku: 'TJ-VLVT-EMERALD',
      category: 'Velvet Jackets',
      material: 'Heavyweight Silk-Blend Velvet with Golden Zari & Pastel Threadwork',
      origin: 'Jaipur, Rajasthan, India',
      currentDescription: 'Floor-skimming evening luxury duster coat in royal emerald green with historical Mughal flower medallions.',
      imageUrls: [
        'https://textilejaipur.com/images/midnight-emerald-velvet-duster-front.jpg',
        'https://textilejaipur.com/images/midnight-emerald-velvet-duster-lining.jpg'
      ]
    }
  ];

  // 0. STANDALONE CATALOG PREVIEW & EXPORT MODE
  if (command === 'catalog' || command === 'export') {
    const { writeFileSync } = await import('fs');
    console.log(`✨ Running Vision Analysis & SEO Copywriting for ${flagshipCatalog.length} Flagship Products...\n`);
    const results = [];

    for (let i = 0; i < flagshipCatalog.length; i++) {
      const p = flagshipCatalog[i];
      console.log(`[${i + 1}/${flagshipCatalog.length}] Analyzing: "${p.name}" (${p.sku})...`);
      const res = await analyzeProduct(p);
      const fullPackage = {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        material: p.material,
        origin: p.origin,
        ...res
      };
      results.push(fullPackage);
      console.log(`   ✅ Title (${res.seoTitle.length}ch): "${res.seoTitle}"`);
      console.log(`   🎨 Color: ${res.imageAnalysis.colorPalette.dominant} | Silhouette: ${res.imageAnalysis.garmentSilhouette}`);
    }

    const outputPath = resolve(process.cwd(), 'textilejaipur-seo-catalog.json');
    writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n🎉 Generated and exported ${results.length} complete SEO packages to:`);
    console.log(`   📂 ${outputPath}`);
    return;
  }

  // Supabase checks for live database commands
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing in .env.local');
    console.log('💡 Tip: You can run standalone catalog analysis without DB:');
    console.log('   node scripts/run-seo-studio.mjs catalog');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. SCAN MODE
  if (command === 'scan') {
    console.log('🔍 Auditing catalog SEO & Vision metadata...\n');
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, sku, seo_title, seo_description, description, details, product_images(url, is_primary)')
      .order('name', { ascending: true });

    if (error) {
      console.error('Database error:', error.message);
      return;
    }

    const total = products?.length || 0;
    let missingTitle = 0;
    let missingDesc = 0;
    let missingVision = 0;
    let fullyOptimized = 0;

    for (const p of products || []) {
      const hasTitle = Boolean(p.seo_title && p.seo_title.trim().length > 15);
      const hasDesc = Boolean(p.seo_description && p.seo_description.trim().length > 50);
      const hasVision = Boolean(p.details?.image_analysis);
      if (!hasTitle) missingTitle++;
      if (!hasDesc) missingDesc++;
      if (!hasVision) missingVision++;
      if (hasTitle && hasDesc && hasVision) fullyOptimized++;
    }

    const health = total > 0 ? Math.round((fullyOptimized / total) * 100) : 100;
    console.log(`📊 Catalog SEO Health Score: ${health}%`);
    console.log(`📦 Total Products:            ${total}`);
    console.log(`✅ Fully Optimized:           ${fullyOptimized}`);
    console.log(`⚠️  Missing SEO Titles:        ${missingTitle}`);
    console.log(`⚠️  Missing Meta Descriptions: ${missingDesc}`);
    console.log(`👁️  Missing Image Analysis:    ${missingVision}`);
    console.log('\nRun "node scripts/run-seo-studio.mjs batch" to optimize all unoptimized products.');
    return;
  }

  // 2. BATCH OPTIMIZATION MODE
  if (command === 'batch') {
    const limit = parseInt(args[1] || '50', 10);
    console.log(`🚀 Starting Automated Vision Analysis & SEO Copywriting (limit: ${limit})...\n`);

    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories(name), product_images(url, is_primary, display_order)')
      .or('seo_title.is.null,seo_description.is.null,seo_title.eq."",seo_description.eq.""')
      .limit(limit);

    if (error) {
      console.error('Database query error:', error.message);
      return;
    }

    if (!products || products.length === 0) {
      console.log('✨ All products are already fully optimized!');
      return;
    }

    console.log(`Found ${products.length} products needing optimization.\n`);
    let count = 0;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const sortedImages = p.product_images
        ? [...p.product_images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(img => img.url)
        : [];

      console.log(`[${i + 1}/${products.length}] Analyzing: "${p.name}" (${p.sku || p.id.slice(0, 8)})...`);

      const input = {
        id: p.id,
        name: p.name,
        category: p.categories?.name || 'Ethnic Wear',
        material: p.details?.material,
        origin: p.details?.origin,
        currentDescription: p.description,
        imageUrls: sortedImages
      };

      const result = await analyzeProduct(input);
      const saved = await saveToSupabase(supabase, p.id, result);

      if (saved) {
        count++;
        console.log(`   ✅ Saved! Title: "${result.seoTitle}" (${result.seoTitle.length} chars)`);
        console.log(`   🎨 Vision: Dominant Color: "${result.imageAnalysis.colorPalette.dominant}", Craft: "${result.imageAnalysis.craftTechnique}"`);
      } else {
        console.log(`   ❌ Failed to persist to Supabase`);
      }

      // Safe rate-limit delay
      if (i < products.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log(`\n🎉 Batch complete! Successfully optimized ${count}/${products.length} products.`);
    return;
  }

  // 3. SINGLE PRODUCT OPTIMIZATION MODE
  if (command === 'optimize') {
    const id = args[1];
    if (!id) {
      console.error('Please specify a product ID: node scripts/run-seo-studio.mjs optimize <productId>');
      return;
    }

    console.log(`🔍 Fetching product: ${id}...`);
    const { data: p, error } = await supabase
      .from('products')
      .select('*, categories(name), product_images(url, is_primary, display_order)')
      .eq('id', id)
      .single();

    if (error || !p) {
      console.error('Product not found:', error?.message);
      return;
    }

    const sortedImages = p.product_images
      ? [...p.product_images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(img => img.url)
      : [];

    console.log(`✨ Running Vision Analysis & SEO Copywriting for "${p.name}"...`);
    const result = await analyzeProduct({
      id: p.id,
      name: p.name,
      category: p.categories?.name,
      material: p.details?.material,
      origin: p.details?.origin,
      currentDescription: p.description,
      imageUrls: sortedImages
    });

    console.log('\n--- Generated SEO Package ---');
    console.log('SEO Title:       ', result.seoTitle);
    console.log('SEO Description: ', result.seoDescription);
    console.log('Keywords:        ', result.seoKeywords.join(', '));
    console.log('Dominant Color:  ', result.imageAnalysis.colorPalette.dominant);
    console.log('Craft Technique: ', result.imageAnalysis.craftTechnique);
    console.log('Silhouette:      ', result.imageAnalysis.garmentSilhouette);
    console.log('Alt Texts:       ', result.imageAnalysis.imageAltTexts);
    console.log('\nArtisan Story:\n', result.productDescription);

    const saved = await saveToSupabase(supabase, p.id, result);
    if (saved) console.log('\n💾 Successfully saved to Supabase database!');
    return;
  }

  console.log(`Commands available:`);
  console.log(`  node scripts/run-seo-studio.mjs catalog               Run automated Vision & SEO on flagship products`);
  console.log(`  node scripts/run-seo-studio.mjs export                Generate and export JSON dataset of optimized catalog`);
  console.log(`  node scripts/run-seo-studio.mjs scan                  Audit live Supabase catalog SEO health`);
  console.log(`  node scripts/run-seo-studio.mjs batch [limit]         Auto-optimize unoptimized products in Supabase`);
  console.log(`  node scripts/run-seo-studio.mjs optimize <productId>  Optimize a specific product in Supabase`);
}

main().catch(console.error);
