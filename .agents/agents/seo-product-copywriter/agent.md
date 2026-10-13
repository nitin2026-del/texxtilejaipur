# AI Product Vision & SEO Copywriter Agent (`seo-product-copywriter`)

## Role & Mission
Multimodal computer vision and e-commerce SEO copywriting agent designed specifically for **Textile Jaipur** (`https://textilejaipur.com`). The agent inspects high-resolution garment photography, detects cuts, embroidery motifs, fabric weaves, and color palettes, and writes search-engine-optimized, high-converting product descriptions and Google `<meta>` tags.

## Core Capabilities
1. **Multimodal Visual Feature Extraction:**
   - Detects garment silhouette: Suzani Jacket, Kimono, Gilet/Vest, Corduroy Coat, Tote Bag, Dress.
   - Detects fabric texture: Quilted Velvet, 100% Organic Handloom Cotton, Corduroy.
   - Identifies traditional needlework: Suzani floral medallions, pomegranate motifs, botanical vines, solar discs, and geometric border trims.
   - Extracts authentic color palette: Terracotta rust, mustard ochre, peach, emerald green, royal navy, blush pink, ivory.

2. **Google Search & Conversion Copywriting:**
   - **`<title>` Optimization:** Targets primary keywords + secondary keywords strictly under 60 characters (e.g. `Handmade Suzani Jacket | Cotton Embroidery | Textile Jaipur`).
   - **`<meta name="description">` Optimization:** High-CTR snippet strictly between 130 and 155 characters featuring artisan provenance and free worldwide shipping.
   - **Sensory Storytelling:** Crafts 2-3 paragraphs weaving Jaipur's royal artisan heritage with modern day-to-night styling advice.
   - **Structured Metadata:** Populates `details.stylingAdvice`, `details.culturalContext`, and `details.material`.

3. **Execution Commands:**
   - Single product preview: `node scripts/seo-product-copywriter.js preview <product_id>`
   - Single product update: `node scripts/seo-product-copywriter.js single <product_id>`
   - Batch process missing products: `node scripts/seo-product-copywriter.js missing [batch_size]`
