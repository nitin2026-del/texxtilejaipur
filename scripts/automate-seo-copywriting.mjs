/**
 * Automated Product Image Analysis and SEO Copywriting Script
 * For Textile Jaipur (https://textilejaipur.com)
 * 
 * Usage:
 *   node scripts/automate-seo-copywriting.mjs [--dry-run] [--limit=10] [--all]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load .env.local or .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocalPath = path.join(rootDir, '.env.local');
const envPath = path.join(rootDir, '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const GEMINI_KEYS = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

console.log('======================================================================');
console.log('  TEXTILE JAIPUR — AUTOMATED PRODUCT IMAGE ANALYSIS & SEO COPYWRITING ');
console.log('  Target Domain: https://textilejaipur.com');
console.log('======================================================================\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase URL or Key in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const isDryRun = process.argv.includes('--dry-run');
const processAll = process.argv.includes('--all');
const limitArg = process.argv.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : (processAll ? 200 : 20);

console.log(`Config: Limit=${limit}, ProcessAll=${processAll}, DryRun=${isDryRun}`);
console.log(`Gemini Keys Available: ${GEMINI_KEYS.length}\n`);

async function fetchImageBuffer(imageUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TextileJaipur-SeoAutomation/1.0',
        Accept: 'image/webp,image/jpeg,image/png,image/*;q=0.8'
      }
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    let mimeType = resp.headers.get('content-type') || 'image/jpeg';
    if (!mimeType.startsWith('image/')) mimeType = 'image/jpeg';
    const ab = await resp.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(ab).toString('base64'),
        mimeType
      }
    };
  } catch {
    return null;
  }
}

function generateRuleBasedSeo(prod) {
  const name = prod.name.trim();
  const cat = prod.categories?.name || 'Ethnic Wear';
  const mat = prod.details?.material || 'Handloom Fabric';
  const isSuzani = /suzani/i.test(name) || /suzani/i.test(cat);
  const isKimono = /kimono|robe/i.test(name) || /kimono/i.test(cat);
  const isDress = /dress|gown|maxi/i.test(name) || /dress/i.test(cat);

  let craft = 'Jaipur Hand-Block Printing & Kantha Stitch';
  let silhouette = 'Bohemian Artisan Silhouette';
  let mood = 'Bohemian Luxury';

  if (isSuzani) {
    craft = 'Artisanal Silk-Thread Suzani Embroidery';
    silhouette = 'Bohemian Duster & Embroidered Coat';
    mood = 'Vintage Heritage Boho-Chic';
  } else if (isKimono) {
    craft = 'Bagru Hand-Block Indigo Print';
    silhouette = 'Open-Front Kimono Duster Robe';
    mood = 'Resort Wear & Bohemian Loungewear';
  } else if (isDress) {
    craft = 'Sanganeri Botanical Floral Print';
    silhouette = 'Tiered Bohemian Maxi Dress';
    mood = 'Ethereal Summer Chic';
  }

  let seoTitle = `${name} | Handmade Jaipur Ethnic Wear | Textile Jaipur`;
  if (seoTitle.length > 68) {
    seoTitle = `${name} - Jaipur Boho Wear | Textile Jaipur`;
  }
  if (seoTitle.length > 68) {
    seoTitle = `${name.substring(0, 48)}... | Textile Jaipur`;
  }

  const seoDescription = `Shop authentic handmade ${name.toLowerCase()} in ${mat.toLowerCase()} from Jaipur. Floral artisan craft with free express worldwide shipping at Textile Jaipur.`.slice(0, 158);

  const seoKeywords = [
    name.toLowerCase(),
    'handmade indian clothing',
    'jaipur ethnic wear',
    'bohemian clothing online',
    isSuzani ? 'suzani jacket' : 'block print kimono',
    isSuzani ? 'vintage embroidered jacket' : 'cotton boho dress',
    'authentic rajasthani clothing',
    'textile jaipur export',
    'worldwide shipping clothing'
  ];

  return {
    seoTitle,
    seoDescription,
    seoKeywords,
    productDescription: `Discover the exquisite artistry of our ${name}, handcrafted in the historic workshops of Jaipur, Rajasthan. Every stitch and motif reflects centuries of slow-fashion mastery and sustainable textile heritage.\n\nCrafted from premium ${mat.toLowerCase()}, this versatile piece pairs effortlessly with modern wardrobe staples or stands out as a luxurious bohemian statement.`,
    culturalContext: `Handcrafted in Jaipur, Rajasthan, this piece celebrates time-honored artisanal traditions such as hand-block printing and fine needlework preserved across generations.`,
    stylingAdvice: `Pair with high-waisted denim and leather boots for effortless daytime chic, or layer over a silk slip dress for an elevated bohemian evening ensemble.`,
    translations: {
      fr: `Découvrez la beauté artisanale de ${name}, confectionné à la main à Jaipur avec des finitions d'exception. Livraison internationale offerte.`,
      es: `Descubre la belleza artesanal de ${name}, hecho a mano en Jaipur con técnicas tradicionales y telas nobles. Envío gratis mundial.`,
      de: `Entdecken Sie das authentische, handgefertigte ${name} aus Jaipur. Hochwertige Handwerkskunst mit kostenlosem weltweiten Versand.`,
      ar: `اكتشف أناقة ${name} المصنوع يدويًا في جايبور بحرفية راقية وأقمشة فاخرة مع شحن مجاني عالمي.`
    },
    imageAnalysis: {
      colorPalette: {
        dominant: 'Artisan Palette',
        secondary: 'Heritage Indigo & Ochre',
        accents: ['Warm Sand', 'Crimson']
      },
      craftTechnique: craft,
      fabricTexture: mat,
      garmentSilhouette: silhouette,
      aestheticMood: mood,
      artisanProvenance: 'Jaipur, Rajasthan, India'
    }
  };
}

async function analyzeProduct(prod) {
  const images = (prod.product_images || [])
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map(i => i.url);

  const primaryImage = images[0] || null;

  if (GEMINI_KEYS.length === 0) {
    return generateRuleBasedSeo(prod);
  }

  const promptParts = [];
  if (primaryImage) {
    const inlinePart = await fetchImageBuffer(primaryImage);
    if (inlinePart) promptParts.push(inlinePart);
  }

  const promptText = `
You are the Lead SEO Strategist & Luxury Copywriter for Textile Jaipur (textilejaipur.com).
Product: "${prod.name}"
Category: "${prod.categories?.name || 'Ethnic Wear'}"
Material: "${prod.details?.material || 'Handloom Fabric'}"
Origin: "Jaipur, Rajasthan, India"

Examine the product and attached image closely.
Output strict JSON matching:
{
  "seoTitle": "50-65 chars high-CTR title ending in | Textile Jaipur",
  "seoDescription": "145-160 chars meta description with CTA and free worldwide shipping hook",
  "seoKeywords": ["10-14 search terms"],
  "productDescription": "2 evocative paragraphs in English",
  "culturalContext": "2-3 sentences explaining craft heritage",
  "stylingAdvice": "2-3 sentences styling tips for international buyers",
  "translations": { "fr": "...", "es": "...", "de": "...", "ar": "..." },
  "imageAnalysis": {
    "colorPalette": { "dominant": "...", "secondary": "...", "accents": ["..."] },
    "craftTechnique": "...",
    "fabricTexture": "...",
    "garmentSilhouette": "...",
    "aestheticMood": "...",
    "artisanProvenance": "Jaipur, Rajasthan"
  }
}
`;
  promptParts.push({ text: promptText });

  for (const key of GEMINI_KEYS) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
      const res = await model.generateContent({
        contents: [{ role: 'user', parts: promptParts }],
        generationConfig: { responseMimeType: 'application/json' }
      });
      return JSON.parse(res.response.text());
    } catch {
      // try next key
    }
  }

  return generateRuleBasedSeo(prod);
}

async function run() {
  console.log('Fetching products from Supabase...');
  let query = supabase
    .from('products')
    .select('id, name, sku, seo_title, seo_description, description, details, categories(name), product_images(url, is_primary, display_order)')
    .order('name', { ascending: true });

  if (!processAll) {
    query = query.or('seo_title.is.null,seo_description.is.null,seo_title.eq."",seo_description.eq.""');
  }

  const { data: products, error } = await query.limit(limit);

  if (error) {
    console.error('❌ Failed to query products:', error.message);
    process.exit(1);
  }

  console.log(`Found ${products.length} products to evaluate.\n`);

  let optimizedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    console.log(`[${i + 1}/${products.length}] Analyzing: "${prod.name}" (${prod.sku || prod.id.slice(0, 8)})`);

    const result = await analyzeProduct(prod);

    console.log(`  → SEO Title (${result.seoTitle.length} chars): ${result.seoTitle}`);
    console.log(`  → SEO Desc  (${result.seoDescription.length} chars): ${result.seoDescription}`);
    console.log(`  → Craft: ${result.imageAnalysis?.craftTechnique || 'Artisan'}`);
    console.log(`  → Colors: ${result.imageAnalysis?.colorPalette?.dominant || 'Heritage'}\n`);

    if (!isDryRun) {
      const updatedDetails = {
        ...(prod.details || {}),
        culturalContext: result.culturalContext,
        stylingAdvice: result.stylingAdvice,
        translations: result.translations,
        seo_keywords: result.seoKeywords,
        image_analysis: result.imageAnalysis
      };

      const { error: updateErr } = await supabase
        .from('products')
        .update({
          seo_title: result.seoTitle,
          seo_description: result.seoDescription,
          description: result.productDescription || prod.description,
          details: updatedDetails
        })
        .eq('id', prod.id);

      if (updateErr) {
        console.error(`  ❌ Failed to save ${prod.name}:`, updateErr.message);
      } else {
        optimizedCount++;
      }
    } else {
      optimizedCount++;
    }

    // Pacing delay
    if (i < products.length - 1) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  console.log('======================================================================');
  console.log(`  AUTOMATION COMPLETED SUCCESSFULLY!`);
  console.log(`  Total Processed: ${products.length}`);
  console.log(`  Optimized:       ${optimizedCount}`);
  console.log(`  Dry Run:         ${isDryRun ? 'YES (No database writes)' : 'NO (Database updated)'}`);
  console.log('======================================================================\n');
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
