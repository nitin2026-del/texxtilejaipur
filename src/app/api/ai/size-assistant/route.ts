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
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return NextResponse.json({ success: true, recommendation: responseText.trim() }, { status: 200 });
      } catch (error: any) {
        console.error(`Size API Key ${apiKey.substring(0, 5)}... failed:`, error.message);
        lastError = error;
      }
    }

    return NextResponse.json({ success: false, error: lastError?.message || 'All API keys failed.' }, { status: 500 });
  } catch (error: any) {
    console.error('Failed to generate size recommendation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
