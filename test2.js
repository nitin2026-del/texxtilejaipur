const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const fallbackKey = Buffer.from('QVEuQWI4Uk42S0JwTDhIZVBoQW1xSmYzVUZaRlN1ekdMVWNic2t2cDcxYmM3b201RERGM1E=', 'base64').toString('ascii');
  const genAI = new GoogleGenerativeAI(fallbackKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `
    Requirements:
    1. 'description': Exactly 2 short paragraphs in English.
    2. 'culturalContext': 2-3 sentences explaining heritage.
    3. 'stylingAdvice': 2-3 sentences advising styling.
    4. 'translations': An object with fr, es, ar, de translations.
    
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
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    console.log("SUCCESS:", result.response.text());
  } catch (err) {
    console.error("ERROR:", err.message || err);
  }
}

test();
