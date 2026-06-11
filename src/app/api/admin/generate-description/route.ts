import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, material, origin, imageUrl } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Product name is required' }, { status: 400 });
    }

    // Fallback securely encoded to bypass GitHub Secret Scanning & Vercel Dashboard issues
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'Your personal GEMINI_API_KEY is missing in Vercel Environment Variables. Please add it to Vercel and Redeploy.' }, { status: 400 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let prompt = `
      You are an expert copywriter and cultural fashion advisor for a luxury ethnic clothing brand called 'Textile Jaipur'.
      Your task is to generate a beautiful product description, cultural context, styling advice for international buyers, and translations.
      
      Product Name: ${name}
      Category: ${category || 'Ethnic Wear'}
      Material: ${material || 'Premium Fabric'}
      Origin: ${origin || 'Jaipur, Rajasthan'}
    `;

    const promptParts: any[] = [];

    if (imageUrl) {
      prompt += `\n\nI have provided an image of the product. Please closely examine the image and extract the exact colors, the embroidery, and the design patterns. Weave these visual details seamlessly into the description.`;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const imageResp = await fetch(imageUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (imageResp.ok) {
          const mimeType = imageResp.headers.get('content-type') || '';
          
          if (mimeType.startsWith('image/')) {
            const arrayBuffer = await imageResp.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Data = buffer.toString('base64');
            
            promptParts.push({
              inlineData: {
                data: base64Data,
                mimeType
              }
            });
          } else {
            console.warn(`Skipping image due to unsupported MIME type: ${mimeType}`);
          }
        }
      } catch (err) {
        console.error("Failed to fetch image for AI:", err);
      }
    }

    prompt += `
      
      Requirements:
      1. 'description': Exactly 2 short paragraphs in English. First paragraph: visual beauty, exact colors/designs. Second paragraph: craftsmanship, fabric (${material || 'fabric'}), and origin (${origin || 'Jaipur'}). Tone: Luxurious, poetic.
      2. 'culturalContext': 2-3 sentences explaining the Indian heritage, craft, or terminology associated with this product (e.g. what is block print, slub, zari) to educate international buyers.
      3. 'stylingAdvice': 2-3 sentences advising a Western/International buyer on how to style this piece (e.g. fusion wear, pairing with denim or minimalist jewelry).
      4. 'translations': An object containing the EXACT 'description' translated into French, Spanish, Arabic, and German. The translations MUST capture the luxurious, poetic nuance.
      
      Output ONLY valid JSON matching this schema:
      {
        "description": "string",
        "culturalContext": "string",
        "stylingAdvice": "string",
        "translations": {
          "fr": "string",
          "es": "string",
          "ar": "string",
          "de": "string"
        }
      }
    `;
    
    promptParts.push({ text: prompt });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: promptParts }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to generate description:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
