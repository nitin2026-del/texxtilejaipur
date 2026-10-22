import { NextRequest, NextResponse } from 'next/server';
import { analyzeProductWithVisionAndSeo, ProductInput } from '@/lib/seoImageAnalysis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, material, origin, imageUrl, imageUrls } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Product name is required' }, { status: 400 });
    }

    const allImages: string[] = [];
    if (imageUrl) allImages.push(imageUrl);
    if (Array.isArray(imageUrls)) {
      allImages.push(...imageUrls.filter(Boolean));
    }

    const input: ProductInput = {
      name,
      category,
      material,
      origin,
      imageUrls: allImages
    };

    const seoResult = await analyzeProductWithVisionAndSeo(input);

    return NextResponse.json({
      success: true,
      description: seoResult.productDescription,
      culturalContext: seoResult.culturalContext,
      stylingAdvice: seoResult.stylingAdvice,
      translations: seoResult.translations,
      seoTitle: seoResult.seoTitle,
      seoDescription: seoResult.seoDescription,
      seoKeywords: seoResult.seoKeywords,
      imageAnalysis: seoResult.imageAnalysis,
      imageAltTexts: seoResult.imageAnalysis.imageAltTexts
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to generate description & SEO:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error generating content' }, { status: 500 });
  }
}
