import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export interface ImageAnalysisResult {
  colorPalette: {
    dominant: string;
    secondary: string;
    accents: string[];
  };
  craftTechnique: string;
  fabricTexture: string;
  garmentSilhouette: string;
  aestheticMood: string;
  artisanProvenance: string;
  imageAltTexts: string[];
}

export interface SeoCopywritingResult {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  productDescription: string;
  culturalContext: string;
  stylingAdvice: string;
  translations: {
    fr: string;
    es: string;
    de: string;
    ar: string;
  };
  imageAnalysis: ImageAnalysisResult;
}

export interface ProductInput {
  id?: string;
  name: string;
  category?: string;
  material?: string;
  origin?: string;
  currentDescription?: string;
  imageUrls?: string[];
}

/**
 * Downloads an image and converts it into a base64 inline data part for Gemini
 */
async function fetchImageInlineData(imageUrl: string): Promise<{ inlineData: { data: string; mimeType: string } } | null> {
  try {
    let resolvedUrl = (imageUrl || '').trim();
    if (!resolvedUrl) return null;

    if (resolvedUrl.startsWith('//')) {
      resolvedUrl = `https:${resolvedUrl}`;
    } else if (resolvedUrl.startsWith('/')) {
      resolvedUrl = `https://textilejaipur.com${resolvedUrl}`;
    } else if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
      resolvedUrl = `https://textilejaipur.com/${resolvedUrl}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(resolvedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TextileJaipur-SeoBot/1.0',
        Accept: 'image/webp,image/jpeg,image/png,image/*;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (!resp.ok) return null;

    let mimeType = resp.headers.get('content-type') || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      mimeType = 'image/jpeg';
    }

    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    return {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };
  } catch (err) {
    console.warn(`[ImageAnalysis] Could not fetch image for AI analysis: ${imageUrl}`, err);
    return null;
  }
}

/**
 * Rule-based fallback generator if Gemini API key is missing or quota exceeded
 */
export function generateFallbackSeo(input: ProductInput): SeoCopywritingResult {
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

  // SEO Title: 55-65 chars
  let seoTitle = `${cleanName} | Handmade Jaipur Ethnic Wear | Textile Jaipur`;
  if (seoTitle.length > 68) {
    seoTitle = `${cleanName} - Jaipur Boho Wear | Textile Jaipur`;
  }
  if (seoTitle.length > 68) {
    seoTitle = `${cleanName.substring(0, 48)}... | Textile Jaipur`;
  }

  // Meta Description: 150-160 chars
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

  const productDescription = 
    `Discover the extraordinary artistry of our ${cleanName}, an exquisite testament to Jaipur's centuries-old textile traditions. Handcrafted with meticulous precision, this piece showcases breathtaking artisanal details, organic textures, and a harmonious color palette that captures the romantic essence of Rajasthan.\n\nFashioned from high-grade ${material.toLowerCase()}, each garment is tailored for effortless comfort and a flattering silhouette. Whether layered over modern staples or worn as a statement piece, it reflects conscious sustainable craftsmanship born from the heritage ateliers of Jaipur.`;

  const culturalContext = 
    `Handcrafted in the legendary artisan quarters of Jaipur, Rajasthan, this piece honors generations of master dyers and needleworkers. Authentic Indian textiles celebrate heritage techniques like wooden hand-block printing and needlepoint embroidery, preserving slow-fashion craft culture.`;

  const stylingAdvice = 
    `Elevate this piece by pairing it with classic high-waisted denim and leather mules for an effortless bohemian fusion look, or drape it over a sleek slip dress with minimalist gold jewelry for evening elegance.`;

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
 * Automated Vision Analysis + SEO Copywriting Engine using Google Gemini Flash
 */
export async function analyzeProductWithVisionAndSeo(
  input: ProductInput,
  apiKeysList?: string[]
): Promise<SeoCopywritingResult> {
  const keys = (apiKeysList && apiKeysList.length > 0)
    ? apiKeysList
    : (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '')
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);

  if (keys.length === 0) {
    console.warn('[SeoEngine] No Gemini API keys found. Generating high-quality rule-based SEO metadata.');
    return generateFallbackSeo(input);
  }

  // Download product image(s) for Gemini multimodal analysis
  const promptParts: any[] = [];
  const primaryImage = input.imageUrls?.[0] || null;

  if (primaryImage) {
    const inlinePart = await fetchImageInlineData(primaryImage);
    if (inlinePart) {
      promptParts.push(inlinePart);
    }
  }

  // Construct rigorous prompt for Gemini
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

1. "seoTitle":
   - Exact length: 50 to 65 characters (ideal for Google Search SERP without truncation).
   - Format: [Visual Highlight or Craft] + [Garment Type] | [Textile Jaipur]
   - E.g.: "Handmade Velvet Suzani Jacket - Boho Floral Coat | Textile Jaipur"
   - High-search-intent keyword placement targeting international buyers.

2. "seoDescription":
   - Exact length: 145 to 160 characters (vital for Google meta description tag).
   - Must include: Primary garment type, visible colors/fabrics, mention of Jaipur artisanal origin, free worldwide shipping hook, and a compelling CTA.

3. "seoKeywords":
   - Array of 10-14 high-volume, long-tail search terms (e.g. "handmade suzani jacket", "embroidered boho coat", "jaipur artisan clothing", "vintage indian velvet jacket", "buy suzani coat usa").

4. "productDescription":
   - Exactly 2 rich, evocative, narrative paragraphs in English.
   - Paragraph 1: Visual and sensory aesthetics—exact color palette, embroidery textures, motif design, and silhouette drape observed in the product.
   - Paragraph 2: Craftsmanship provenance—master artisans of Jaipur, slow-fashion values, breathability and touch of the fabric (${input.material || 'pure cotton'}), styling versatility.

5. "culturalContext":
   - 2-3 sentences explaining the historical Indian craft tradition behind this piece (e.g., Suzani embroidery history, Sanganeri teak block printing, natural botanical dyes) to educate and enchant global customers.

6. "stylingAdvice":
   - 2-3 sentences advising a Western or international customer how to style this garment (e.g., pairing with denim, ankle boots, slip dresses, layered boho fusion).

7. "imageAltTexts":
   - Array of descriptive, accessible image alt strings (at least 2-3 strings for various image angles: Front View, Detail Embroidery, Back/Drape View) incorporating primary SEO keywords naturally.

8. "translations":
   - High-end, poetic, localized product descriptions in French (fr), Spanish (es), German (de), and Arabic (ar).

Return ONLY valid JSON matching this schema:
{
  "seoTitle": "string",
  "seoDescription": "string",
  "seoKeywords": ["string"],
  "productDescription": "string",
  "culturalContext": "string",
  "stylingAdvice": "string",
  "imageAltTexts": ["string"],
  "translations": {
    "fr": "string",
    "es": "string",
    "de": "string",
    "ar": "string"
  },
  "imageAnalysis": {
    "colorPalette": {
      "dominant": "string",
      "secondary": "string",
      "accents": ["string"]
    },
    "craftTechnique": "string",
    "fabricTexture": "string",
    "garmentSilhouette": "string",
    "aestheticMood": "string",
    "artisanProvenance": "string"
  }
}
`;

  promptParts.push({ text: promptText });

  let lastError: any = null;

  for (const apiKey of keys) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const candidateModels = [
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-flash-latest'
      ];
      let result: any = null;
      let lastModelError: any = null;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          result = await model.generateContent({
            contents: [{ role: 'user', parts: promptParts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.4
            }
          });
          if (result?.response) break;
        } catch (modelErr: any) {
          lastModelError = modelErr;
          // continue to next candidate model
        }
      }

      if (!result?.response) {
        throw lastModelError || new Error('Failed to generate content with available Gemini models');
      }

      const responseText = result.response.text();
      const cleanJson = responseText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleanJson);

      // Validate and sanitize the output
      const cleanSeoTitle = (parsed.seoTitle || input.name).trim();
      const cleanSeoDesc = (parsed.seoDescription || '').trim();

      const imageAnalysis: ImageAnalysisResult = {
        colorPalette: {
          dominant: parsed.imageAnalysis?.colorPalette?.dominant || 'Artisan Palette',
          secondary: parsed.imageAnalysis?.colorPalette?.secondary || 'Heritage Tone',
          accents: Array.isArray(parsed.imageAnalysis?.colorPalette?.accents) ? parsed.imageAnalysis.colorPalette.accents : []
        },
        craftTechnique: parsed.imageAnalysis?.craftTechnique || 'Handmade Jaipur Embroidery',
        fabricTexture: parsed.imageAnalysis?.fabricTexture || (input.material || 'Handloom Cotton'),
        garmentSilhouette: parsed.imageAnalysis?.garmentSilhouette || 'Bohemian Silhouette',
        aestheticMood: parsed.imageAnalysis?.aestheticMood || 'Artisanal Luxury',
        artisanProvenance: parsed.imageAnalysis?.artisanProvenance || 'Jaipur, Rajasthan',
        imageAltTexts: Array.isArray(parsed.imageAltTexts) && parsed.imageAltTexts.length > 0 
          ? parsed.imageAltTexts 
          : [`${cleanSeoTitle} - Textile Jaipur`]
      };

      return {
        seoTitle: cleanSeoTitle,
        seoDescription: cleanSeoDesc,
        seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [],
        productDescription: parsed.productDescription || parsed.description || input.currentDescription || '',
        culturalContext: parsed.culturalContext || '',
        stylingAdvice: parsed.stylingAdvice || '',
        translations: parsed.translations || { fr: '', es: '', de: '', ar: '' },
        imageAnalysis
      };
    } catch (err: any) {
      console.warn(`[SeoEngine] Key failed: ${err.message}`);
      lastError = err;
    }
  }

  console.warn('[SeoEngine] All Gemini keys failed or rate-limited. Falling back to rule-based generator.', lastError);
  return generateFallbackSeo(input);
}

/**
 * Persists SEO copywriting and image analysis to the Supabase database
 */
export async function persistSeoToSupabase(
  productId: string,
  seoResult: SeoCopywritingResult
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: 'Missing Supabase credentials' };
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing product details
    const { data: existingProd, error: fetchErr } = await supabaseClient
      .from('products')
      .select('id, details')
      .eq('id', productId)
      .single();

    if (fetchErr) {
      console.error('[PersistSeo] Failed to fetch existing product', fetchErr);
      return { success: false, error: fetchErr.message };
    }

    const updatedDetails = {
      ...(existingProd?.details || {}),
      culturalContext: seoResult.culturalContext || existingProd?.details?.culturalContext,
      stylingAdvice: seoResult.stylingAdvice || existingProd?.details?.stylingAdvice,
      translations: seoResult.translations || existingProd?.details?.translations,
      seo_keywords: seoResult.seoKeywords,
      image_analysis: seoResult.imageAnalysis
    };

    // Update product table with seo_title, seo_description, description, details
    const { error: updateErr } = await supabaseClient
      .from('products')
      .update({
        seo_title: seoResult.seoTitle,
        seo_description: seoResult.seoDescription,
        description: seoResult.productDescription,
        details: updatedDetails
      })
      .eq('id', productId);

    if (updateErr) {
      console.error('[PersistSeo] Failed to update product', updateErr);
      return { success: false, error: updateErr.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[PersistSeo] Exception updating product:', err);
    return { success: false, error: err.message || 'Unknown database error' };
  }
}
