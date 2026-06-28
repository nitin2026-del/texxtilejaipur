import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userSize, brand, productName, material, category } = body;

    if (!userSize || !productName) {
      return NextResponse.json({ success: false, message: 'User size and product name are required' }, { status: 400 });
    }

    // Fallback securely encoded to bypass GitHub Secret Scanning & Vercel Dashboard issues
    const apiKeys = process.env.GEMINI_API_KEY?.split(',').map(k => k.trim()).filter(k => k) || [];

    if (apiKeys.length === 0) {
      return NextResponse.json({ success: false, message: 'Your personal GEMINI_API_KEY is missing in Vercel Environment Variables.' }, { status: 400 });
    }

    const prompt = `
      You are an expert luxury fashion tailor and sizing consultant for an Indian ethnic wear brand called 'Textile Jaipur'.
      A customer wants to buy the "${productName}" (${category || 'Ethnic Wear'}).
      The fabric is ${material || 'Premium Fabric'}.
      
      The customer states: "I usually wear size ${userSize} in ${brand || 'standard US/UK brands'}."
      
      Your task:
      1. Analyze the typical stretch and fit of the stated fabric (${material || 'fabric'}).
      2. Convert their Western size to the standard Indian ethnic wear sizing (e.g. 36, 38, 40, 42, 44).
      3. Provide a warm, confident recommendation for which Indian size they should order, and briefly explain why based on the fabric fit.

      Keep the response concise, professional, and directly address the customer (e.g., "Based on your size..."). Do not use markdown headers, just plain text or simple bullet points.
    `;

    let lastError = null;

    for (const apiKey of apiKeys) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return NextResponse.json({ success: true, recommendation: responseText.trim() }, { status: 200 });
      } catch (error: any) {
        console.error(`Size API Key ${apiKey.substring(0, 5)}... failed:`, error.message);
        lastError = error;
      }
    }

    // Fallback logic if AI fails (e.g. invalid API key)
    const sizeMap: Record<string, string> = {
      's': '36', 'm': '38', 'l': '40', 'xl': '42', 'xxl': '44',
      '2': '34', '4': '36', '6': '38', '8': '40', '10': '42', '12': '44', '14': '46',
      'small': '36', 'medium': '38', 'large': '40',
    };
    
    const lowerInput = userSize.toLowerCase();
    let estimatedSize = '38 (Medium)';
    
    for (const [key, val] of Object.entries(sizeMap)) {
      if (lowerInput.includes(key)) {
        estimatedSize = val;
      }
    }

    const fallbackRecommendation = `Based on your stated size of "${userSize}", we recommend trying an Indian Size ${estimatedSize}. Since ${material || 'this fabric'} typically offers a comfortable fit, this should provide the right balance of drape and ease. If you prefer a looser fit, consider sizing up.`;

    return NextResponse.json({ success: true, recommendation: fallbackRecommendation, isFallback: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
