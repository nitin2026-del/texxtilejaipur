import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY;
  const keyLength = process.env.GEMINI_API_KEY?.length || 0;
  const firstFew = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 4) : 'none';

  return NextResponse.json({
    success: true,
    hasKey,
    keyLength,
    firstFew,
    message: hasKey 
      ? `Key is successfully loaded in Vercel! Length: ${keyLength}` 
      : 'Key is STILL MISSING from Vercel.'
  });
}
