const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

const targetStr = '{/* You May Also Like Section */}';
const targetIdx = content.indexOf(targetStr);

if (targetIdx !== -1) {
  const newSections = `        {/* Customer Reviews Detailed Section */}
        {dynamicReviews.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto px-4">
            <h3 className="text-2xl font-serif text-zinc-900 font-bold mb-8 flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              Real Reviews from Global Customers
            </h3>
            <div className="space-y-6">
              {dynamicReviews.slice(0, 10).map((r, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={\`h-4 w-4 \${idx < r.stars ? 'fill-amber-400 text-amber-400' : 'fill-zinc-100 text-zinc-200'}\`} />
                        ))}
                      </div>
                      <h4 className="font-bold text-zinc-900">{r.title || "Beautiful craftsmanship"}</h4>
                    </div>
                    <span className="text-xs text-zinc-400">{r.date}</span>
                  </div>
                  <p className="text-sm text-zinc-600 mb-4">{r.body}</p>
                  
                  {/* Reviewer Photos */}
                  {r.imageUrls && r.imageUrls.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 snap-x">
                      {r.imageUrls.map((img, idx) => (
                        <div key={idx} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-zinc-100 snap-center">
                          <img src={getOptimizedUrl(img, 150)} alt="Customer photo" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                      {r.initial}
                    </span>
                    <span className="text-zinc-900">{r.name}</span>
                    {r.location && (
                      <>
                        <span className="text-zinc-300">&bull;</span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {r.location}
                        </span>
                      </>
                    )}
                    {r.isVerified && (
                      <>
                        <span className="text-zinc-300">&bull;</span>
                        <span className="flex items-center gap-1 text-green-600">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified Buyer
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section with Schema */}
        <div className="mt-20 max-w-4xl mx-auto px-4 mb-16">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How long will delivery take?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "We offer free worldwide shipping. Delivery typically takes 5-9 business days depending on your country."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do I have to pay customs and duties?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No. We prepay all customs and import duties. You will not face any hidden charges upon delivery."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What is your return policy?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "We accept returns within 7 days for damaged or incorrect items and provide a full refund. We also cover return shipping on defects."
                    }
                  }
                ]
              })
            }}
          />
          <h3 className="text-2xl font-serif text-zinc-900 font-bold mb-6 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <details className="group bg-white p-5 border border-zinc-200 rounded-xl">
              <summary className="font-bold text-zinc-900 cursor-pointer flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                How long will delivery take?
                <Plus className="h-5 w-5 text-zinc-400 group-open:hidden" />
                <Minus className="h-5 w-5 text-zinc-400 hidden group-open:block" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600">We offer free worldwide shipping. Delivery typically takes 5-9 business days depending on your country via premium couriers like DHL/FedEx.</p>
            </details>
            <details className="group bg-white p-5 border border-zinc-200 rounded-xl">
              <summary className="font-bold text-zinc-900 cursor-pointer flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                Do I have to pay customs and duties?
                <Plus className="h-5 w-5 text-zinc-400 group-open:hidden" />
                <Minus className="h-5 w-5 text-zinc-400 hidden group-open:block" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600">No. We prepay all customs and import duties on your behalf. You will not face any hidden charges upon delivery—what you pay at checkout is final.</p>
            </details>
            <details className="group bg-white p-5 border border-zinc-200 rounded-xl">
              <summary className="font-bold text-zinc-900 cursor-pointer flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                What is your return policy?
                <Plus className="h-5 w-5 text-zinc-400 group-open:hidden" />
                <Minus className="h-5 w-5 text-zinc-400 hidden group-open:block" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600">We accept returns within 7 days for damaged or incorrect items and provide a full refund. We also cover return shipping on defects. Because our items are unique handcrafted artisan pieces, we generally do not accept returns for a simple change of mind.</p>
            </details>
            <details className="group bg-white p-5 border border-zinc-200 rounded-xl">
              <summary className="font-bold text-zinc-900 cursor-pointer flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                How should I care for my Suzani piece?
                <Plus className="h-5 w-5 text-zinc-400 group-open:hidden" />
                <Minus className="h-5 w-5 text-zinc-400 hidden group-open:block" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600">We recommend dry cleaning only to preserve the vibrant natural dyes and delicate hand embroidery. Keep the piece out of prolonged direct sunlight to prevent fading.</p>
            </details>
          </div>
        </div>

`;
  
  content = content.substring(0, targetIdx) + newSections + content.substring(targetIdx);
  fs.writeFileSync('src/components/ProductPageClient.tsx', content);
  console.log('Successfully injected reviews and FAQ');
} else {
  console.log('Failed to find You May Also Like Section');
}
