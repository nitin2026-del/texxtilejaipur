import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, material, origin } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Product name is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, message: 'Gemini API Key is missing' }, { status: 500 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert copywriter for a luxury ethnic clothing brand called 'Textile Jaipur'.
      Write a beautiful, highly-converting, and SEO-optimized e-commerce product description for the following item:
      
      Product Name: ${name}
      Category: ${category || 'Ethnic Wear'}
      Material: ${material || 'Premium Fabric'}
      Origin: ${origin || 'Jaipur, Rajasthan'}
      
      Requirements:
      - Exactly 2 short paragraphs.
      - First paragraph: Focus on the visual beauty, elegance, and how it makes the wearer feel.
      - Second paragraph: Focus on the craftsmanship, the fabric (${material || 'fabric'}), and the authentic origin (${origin || 'Jaipur'}).
      - Tone: Luxurious, authentic, poetic, and compelling.
      - Do NOT include any intro/outro text like "Here is the description", just return the pure description text.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ success: true, description: responseText.trim() }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to generate description:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
