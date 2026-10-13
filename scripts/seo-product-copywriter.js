/**
 * AI Product Vision & SEO Copywriter Agent
 * Analyzes product photos with Gemini Multimodal Vision and crafts Google-optimized,
 * high-converting luxury descriptions and metadata for Textile Jaipur.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Error] Missing Supabase credentials in .env.local');
  process.exit(1);
}
if (!geminiApiKey) {
  console.error('[Error] Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const visionModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.4,
    responseMimeType: 'application/json'
  }
});

const SYSTEM_PROMPT = `You are a world-class luxury fashion copywriter and Google E-commerce SEO expert for "Textile Jaipur" (textilejaipur.com), an authentic artisan brand in Jaipur, Rajasthan, India specializing in handmade Suzani jackets, velvet and cotton kimonos, embroidered gilets, and traditional handloom outerwear shipped worldwide.

Your task:
Analyze the provided product photograph carefully. Pay strict attention to:
1. Garment silhouette and cut (Suzani jacket, kimono, vest/gilet, corduroy coat, tote bag).
2. Base fabric (quilted velvet, organic cotton, corduroy, handloom).
3. Primary and accent colors (terracotta rust, mustard ochre, peach, emerald, royal navy, blush pink, ivory).
4. Hand-embroidery motifs (Suzani pomegranates, solar medallions, botanical vines, floral blooms, geometric border trims).
5. Craftsmanship details (quilting stitches, contrast piping, buttons/ties, lining).

Generate high-converting, search-engine-optimized copy in JSON format with these exact keys:
{
  "seo_title": "Primary Keyword | Secondary Keyword | Textile Jaipur (STRICTLY under 60 characters, no quotes)",
  "seo_description": "Compelling meta description with keywords, artisan craft, and free worldwide shipping. (STRICTLY between 130 and 155 characters)",
  "description": "2 to 3 rich, sensory, story-driven paragraphs. Highlight Jaipur's royal artisan heritage, the intricacy of the Suzani needlework, premium fabric drape, and versatile day-to-night styling. Do not use generic filler words.",
  "styling_advice": "1 to 2 sentences of sophisticated styling ideas (e.g. layering over crisp white linen, denim, slip dresses, or boots).",
  "cultural_context": "1 to 2 sentences explaining the historical significance of Suzani embroidery or Jaipur artisanal handloom textile tradition.",
  "material_detected": "e.g. Quilted Velvet, 100% Cotton, Handloom Corduroy"
}`;

async function fetchImageBase64(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = imageUrl.endsWith('.png') ? 'image/png' : imageUrl.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType
    }
  };
}

async function analyzeProduct(product, isDryRun = false) {
  console.log(`\n============================================================`);
  console.log(`[Processing] Product: "${product.name}" (ID: ${product.id})`);
  
  // Find primary or first image
  const primaryImg = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  if (!primaryImg || !primaryImg.url) {
    console.warn(`[Skip] No images found for product: ${product.name}`);
    return null;
  }

  console.log(`[Vision] Analyzing image: ${primaryImg.url}`);
  const imagePart = await fetchImageBase64(primaryImg.url);

  const promptText = `Product Name: "${product.name}"\nCategory: "${product.categories?.name || 'Ethnic Wear'}"\nExisting Description: "${product.description || 'None'}"\n\nAnalyze the image and generate the complete SEO copy JSON.`;

  const result = await visionModel.generateContent([
    SYSTEM_PROMPT,
    imagePart,
    promptText
  ]);

  const rawJson = result.response.text();
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('[Error] Failed to parse JSON from Gemini:', rawJson);
    return null;
  }

  if (parsed.seo_description && parsed.seo_description.length > 155) {
    parsed.seo_description = parsed.seo_description.substring(0, 152).trim() + '...';
  }
  if (parsed.seo_title && parsed.seo_title.length > 60) {
    parsed.seo_title = parsed.seo_title.substring(0, 60).trim();
  }

  console.log(`\n[Generated SEO Title]: ${parsed.seo_title} (${parsed.seo_title?.length || 0} chars)`);
  console.log(`[Generated SEO Meta]:  ${parsed.seo_description} (${parsed.seo_description?.length || 0} chars)`);
  console.log(`[Detected Fabric]:    ${parsed.material_detected}`);
  console.log(`[Description Preview]:\n${parsed.description?.substring(0, 180)}...\n`);

  if (!isDryRun) {
    const existingDetails = product.details || {};
    const updatedDetails = {
      ...existingDetails,
      material: parsed.material_detected || existingDetails.material || 'Handloom Fabric',
      stylingAdvice: parsed.styling_advice || existingDetails.stylingAdvice || '',
      culturalContext: parsed.cultural_context || existingDetails.culturalContext || ''
    };

    const { error: updateError } = await supabase
      .from('products')
      .update({
        description: parsed.description,
        seo_title: parsed.seo_title,
        seo_description: parsed.seo_description,
        details: updatedDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.id);

    if (updateError) {
      console.error('[DB Error] Failed to update product:', updateError);
      return null;
    }

    console.log(`[Success] Saved to Supabase database!`);
  } else {
    console.log(`[Preview Only] Dry-run mode active. No changes written to database.`);
  }

  return parsed;
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'help';

  if (mode === 'help') {
    console.log(`
Textile Jaipur — AI Product Vision SEO Copywriter

Usage:
  node scripts/seo-product-copywriter.js single <product_id> [--dry-run]
    Inspects image and generates copy for a specific product.

  node scripts/seo-product-copywriter.js preview <product_id>
    Inspects image and prints copy without updating the database.

  node scripts/seo-product-copywriter.js missing [limit] [--dry-run]
    Scans products missing seo_title or seo_description and optimizes them.

Examples:
  node scripts/seo-product-copywriter.js preview 59314513-c143-49f5-81f6-e721235b8c61
  node scripts/seo-product-copywriter.js missing 5
    `);
    process.exit(0);
  }

  if (mode === 'single' || mode === 'preview') {
    const productId = args[1];
    const isDryRun = mode === 'preview' || args.includes('--dry-run');

    if (!productId) {
      console.error('[Error] Please provide a product ID.');
      process.exit(1);
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, description, details, categories(name), product_images(url, is_primary)')
      .eq('id', productId)
      .single();

    if (error || !product) {
      console.error('[Error] Product not found:', error);
      process.exit(1);
    }

    await analyzeProduct(product, isDryRun);
  } else if (mode === 'missing') {
    const limitArg = parseInt(args[1], 10) || 5;
    const isDryRun = args.includes('--dry-run');

    console.log(`[Scanning] Finding up to ${limitArg} active products missing SEO metadata...`);

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, details, categories(name), product_images(url, is_primary)')
      .eq('status', 'active')
      .is('seo_title', null)
      .limit(limitArg);

    if (error) {
      console.error('[Error] Failed to fetch products:', error);
      process.exit(1);
    }

    console.log(`[Found] ${products.length} products to optimize.`);

    for (let i = 0; i < products.length; i++) {
      console.log(`\n--- Item ${i + 1} of ${products.length} ---`);
      await analyzeProduct(products[i], isDryRun);
      // Wait 1.5 seconds between items to stay well within Gemini RPM limits
      if (i < products.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    console.log(`\n[Complete] Batch optimization finished.`);
  } else {
    console.error(`Unknown command: ${mode}. Use 'node scripts/seo-product-copywriter.js help' for usage.`);
  }
}

main().catch(err => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});
