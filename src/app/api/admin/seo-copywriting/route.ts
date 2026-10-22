import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  analyzeProductWithVisionAndSeo, 
  persistSeoToSupabase, 
  ProductInput 
} from '@/lib/seoImageAnalysis';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are missing');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function handleSeoAction(body: any) {
  try {
    const { action = 'single' } = body;

    // ─────────────────────────────────────────────────────────────
    // ACTION 1: SCAN CATALOG SEO HEALTH
    // ─────────────────────────────────────────────────────────────
    if (action === 'scan') {
      const supabase = getSupabaseAdmin();
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, sku, seo_title, seo_description, description, details, product_images(url, is_primary)')
        .order('name', { ascending: true });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      const total = products?.length || 0;
      let missingSeoTitleCount = 0;
      let missingSeoDescCount = 0;
      let missingVisionAnalysisCount = 0;
      let missingTranslationsCount = 0;

      const audited = (products || []).map((p: any) => {
        const hasTitle = Boolean(p.seo_title && p.seo_title.trim().length > 15);
        const hasDesc = Boolean(p.seo_description && p.seo_description.trim().length > 50);
        const hasVision = Boolean(p.details?.image_analysis);
        const hasTranslations = Boolean(p.details?.translations && Object.keys(p.details.translations).length > 0);

        if (!hasTitle) missingSeoTitleCount++;
        if (!hasDesc) missingSeoDescCount++;
        if (!hasVision) missingVisionAnalysisCount++;
        if (!hasTranslations) missingTranslationsCount++;

        const isFullyOptimized = hasTitle && hasDesc && hasVision && hasTranslations;

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          hasSeoTitle: hasTitle,
          hasSeoDescription: hasDesc,
          hasVisionAnalysis: hasVision,
          hasTranslations: hasTranslations,
          isFullyOptimized,
          primaryImage: p.product_images?.find((img: any) => img.is_primary)?.url || p.product_images?.[0]?.url || null,
          seoTitle: p.seo_title || null,
          seoDescription: p.seo_description || null
        };
      });

      const optimizedCount = total - Math.max(missingSeoTitleCount, missingSeoDescCount);
      const healthScore = total > 0 ? Math.round((optimizedCount / total) * 100) : 100;

      return NextResponse.json({
        success: true,
        stats: {
          totalProducts: total,
          healthScore,
          missingSeoTitle: missingSeoTitleCount,
          missingSeoDescription: missingSeoDescCount,
          missingVisionAnalysis: missingVisionAnalysisCount,
          missingTranslations: missingTranslationsCount,
          fullyOptimized: total - missingSeoTitleCount
        },
        products: audited
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 2: SINGLE PRODUCT OPTIMIZATION
    // ─────────────────────────────────────────────────────────────
    if (action === 'single') {
      const { 
        productId, 
        name, 
        category, 
        material, 
        origin, 
        imageUrls, 
        currentDescription,
        autoSave = true 
      } = body;

      let productInput: ProductInput;

      if (productId) {
        // Fetch product from Supabase to ensure fresh details and images
        const supabase = getSupabaseAdmin();
        const { data: prod, error } = await supabase
          .from('products')
          .select('*, categories(name), product_images(url, is_primary, display_order)')
          .eq('id', productId)
          .single();

        if (error || !prod) {
          return NextResponse.json({ 
            success: false, 
            error: error?.message || `Product not found with ID ${productId}` 
          }, { status: 404 });
        }

        const sortedImages = prod.product_images
          ? [...prod.product_images]
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((img) => img.url)
          : [];

        productInput = {
          id: prod.id,
          name: name || prod.name,
          category: category || prod.categories?.name || 'Ethnic Wear',
          material: material || prod.details?.material,
          origin: origin || prod.details?.origin,
          currentDescription: currentDescription || prod.description,
          imageUrls: (imageUrls && imageUrls.length > 0) ? imageUrls : sortedImages
        };
      } else {
        if (!name) {
          return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
        }
        productInput = {
          name,
          category,
          material,
          origin,
          currentDescription,
          imageUrls: imageUrls || []
        };
      }

      // Execute AI Vision Analysis & SEO Copywriting
      const seoResult = await analyzeProductWithVisionAndSeo(productInput);

      let saveResult = null;
      if (autoSave && (productId || productInput.id)) {
        const idToSave = productId || productInput.id!;
        saveResult = await persistSeoToSupabase(idToSave, seoResult);
      }

      return NextResponse.json({
        success: true,
        data: seoResult,
        saved: saveResult ? saveResult.success : false,
        saveError: saveResult?.error
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 3: BATCH AUTOMATION RUNNER
    // ─────────────────────────────────────────────────────────────
    if (action === 'batch') {
      const { productIds, onlyMissingSeo = false, limit = 50, delayMs = 1500 } = body;
      const supabase = getSupabaseAdmin();

      let query = supabase
        .from('products')
        .select('*, categories(name), product_images(url, is_primary, display_order)');

      if (Array.isArray(productIds) && productIds.length > 0) {
        query = query.in('id', productIds);
      } else if (onlyMissingSeo) {
        query = query.or('seo_title.is.null,seo_description.is.null,seo_title.eq."",seo_description.eq.""');
      }

      const { data: productsToProcess, error } = await query.limit(limit);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      if (!productsToProcess || productsToProcess.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No products require optimization.',
          totalProcessed: 0,
          successCount: 0
        });
      }

      const results: any[] = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < productsToProcess.length; i++) {
        const prod = productsToProcess[i];
        const sortedImages = prod.product_images
          ? [...prod.product_images]
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((img) => img.url)
          : [];

        const input: ProductInput = {
          id: prod.id,
          name: prod.name,
          category: prod.categories?.name || 'Ethnic Wear',
          material: prod.details?.material,
          origin: prod.details?.origin,
          currentDescription: prod.description,
          imageUrls: sortedImages
        };

        try {
          const seoResult = await analyzeProductWithVisionAndSeo(input);
          const saveRes = await persistSeoToSupabase(prod.id, seoResult);

          if (saveRes.success) {
            successCount++;
            results.push({
              id: prod.id,
              name: prod.name,
              sku: prod.sku,
              success: true,
              seoTitle: seoResult.seoTitle,
              seoDescription: seoResult.seoDescription,
              dominantColor: seoResult.imageAnalysis.colorPalette.dominant,
              craftTechnique: seoResult.imageAnalysis.craftTechnique
            });
          } else {
            failCount++;
            results.push({
              id: prod.id,
              name: prod.name,
              success: false,
              error: saveRes.error
            });
          }
        } catch (itemErr: any) {
          console.error(`[BatchSeo] Failed for product ${prod.name}:`, itemErr);
          failCount++;
          results.push({
            id: prod.id,
            name: prod.name,
            success: false,
            error: itemErr.message || 'Unknown processing error'
          });
        }

        // Delay between products to prevent rate limits
        if (i < productsToProcess.length - 1 && delayMs > 0) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }

      return NextResponse.json({
        success: true,
        totalProcessed: productsToProcess.length,
        successCount,
        failCount,
        results
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error('[SeoCopywritingAPI] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return await handleSeoAction(body);
  } catch (err: any) {
    console.error('[SeoCopywritingAPI] POST Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'scan';
    const productId = searchParams.get('productId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const delayMs = parseInt(searchParams.get('delayMs') || '1500', 10);
    const onlyMissingSeo = searchParams.get('onlyMissingSeo') !== 'false';
    const autoSave = searchParams.get('autoSave') !== 'false';

    return await handleSeoAction({
      action,
      productId,
      limit,
      delayMs,
      onlyMissingSeo,
      autoSave
    });
  } catch (err: any) {
    console.error('[SeoCopywritingAPI] GET Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
