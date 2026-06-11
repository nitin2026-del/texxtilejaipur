require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testBulk() {
  const { data: products } = await supabase.from('products').select('*').limit(10);
  const empty = products.filter(p => !p.description || p.description.length < 20 || !p.details?.translations);
  console.log(`Found ${empty.length} empty products to process.`);

  const fallbackKey = Buffer.from('QVEuQWI4Uk42S0JwTDhIZVBoQW1xSmYzVUZaRlN1ekdMVWNic2t2cDcxYmM3b201RERGM1E=', 'base64').toString('ascii');
  const genAI = new GoogleGenerativeAI(fallbackKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

  for (const p of empty) {
    console.log(`Processing: ${p.name}`);
    let prompt = `
      Requirements:
      1. 'description': Exactly 2 short paragraphs in English. First paragraph: visual beauty, exact colors/designs. Second paragraph: craftsmanship, fabric (${p.details?.material || 'fabric'}), and origin (${p.details?.origin || 'Jaipur'}). Tone: Luxurious, poetic.
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

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(result.response.text());
      console.log(`SUCCESS for ${p.name}:`, Object.keys(data));
      
      // Attempt DB update
      const updatedDetails = {
        ...p.details,
        culturalContext: data.culturalContext || p.details?.culturalContext,
        stylingAdvice: data.stylingAdvice || p.details?.stylingAdvice,
        translations: data.translations || p.details?.translations
      };
      
      const { error } = await supabase.from('products').update({ 
        description: data.description,
        details: updatedDetails
      }).eq('id', p.id);
      
      if (error) console.error("DB Error:", error);
      else console.log("Saved to DB!");
      
    } catch (err) {
      console.error(`ERROR for ${p.name}:`, err.message);
    }
  }
}

testBulk();
