const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const updateBlogs = [
  { slug: "how-to-style-velvet-suzani-jacket", image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/b77dc696-fb3b-4daf-bb5b-13f2b84372d0.webp" },
  { slug: "guide-to-jaipur-block-printing-history", image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/d30a1916-0d47-416e-83f7-41da13880a74.webp" },
  { slug: "5-reasons-corduroy-jackets-must-have", image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/eb5f955b-7cfd-4c7c-883c-dde91e809787.webp" },
  { slug: "boho-chic-embroidered-accessories", image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/d30a1916-0d47-416e-83f7-41da13880a74.webp" },
  { slug: "how-to-care-for-suzani-embroidered-jackets", image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/87f1e43b-92bf-4e6c-a1bf-2e1a1d6e3b61.webp" }
];

const newBlogs = [
  {
    title: "Why Handmade Suzani Jackets Are the Perfect Investment Piece",
    slug: "handmade-suzani-jackets-investment-piece",
    excerpt: "Discover the timeless appeal and unmatched craftsmanship of authentic, handcrafted Suzani jackets.",
    content: `
# Why Handmade Suzani Jackets Are the Perfect Investment Piece

In a world overflowing with mass-produced clothing, true luxury lies in craftsmanship, authenticity, and individuality. A **handmade Suzani jacket** is more than just outerwear—it is a wearable masterpiece. 

### A Rich Cultural Heritage
The art of Suzani embroidery dates back centuries, originating in Central Asia. Historically, these vibrant textiles were made by brides as part of their dowry, symbolizing luck, health, and prosperity. Today, skilled artisans in Rajasthan, India, carry on this magnificent tradition, blending heritage motifs with modern silhouettes.

### Unmatched Artistry
When you wear our [Handmade Cotton TNT Suzani Embroidered Jacket](/product/59314513-c143-49f5-81f6-e721235b8c61), you are wearing a garment that took days, if not weeks, to create. Every floral pattern, sweeping vine, and intricate detail is stitched by hand. Because it is handmade, no two jackets are ever exactly alike, guaranteeing that your piece is 100% unique.

### The Ultimate Statement Piece
A Suzani jacket transforms the simplest outfit. You can throw it over a plain t-shirt and jeans and instantly look sophisticated and styled. Whether you're attending a casual brunch or a festival, the striking colors and luxurious texture make it a timeless addition to your wardrobe.

Invest in slow fashion, support generational artisans, and elevate your style with Textile Jaipur.
    `,
    image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/80679eb3-b994-46ee-8e5e-fa1ee4b6738a.webp",
    status: "published",
    read_time: 3
  },
  {
    title: "Elevate Your Outerwear: Styling White Floral Corduroy",
    slug: "styling-white-floral-corduroy-jackets",
    excerpt: "Learn how to effortlessly integrate light-colored corduroy into your autumn and winter wardrobe.",
    content: `
# Elevate Your Outerwear: Styling White Floral Corduroy

When the weather cools down, most people reach for dark, heavy coats—blacks, navies, and charcoals. While these are safe choices, they can quickly feel uninspired. 

If you want to stand out and bring a breath of fresh air into your autumn and winter wardrobe, it’s time to embrace light-colored, patterned outerwear. 

### The Magic of Light Outerwear
Our [White Floral Printed Cotton Corduroy Open-Front Jacket](/product/801fddf4-f108-4245-ae66-8a146fa8b69b) perfectly balances warmth with a delicate, feminine aesthetic. The crisp off-white background beautifully highlights the intricate teal and slate blue botanical prints.

### How to Style It
* **The Monochrome Base:** Wear it over an all-cream or all-white outfit (a cream turtleneck and ivory trousers). This creates a highly sophisticated, expensive-looking "winter white" aesthetic.
* **Denim Pairing:** For a casual weekend look, pair the jacket with classic blue mom-jeans and brown suede boots. The corduroy texture adds incredible depth to the denim.
* **The Boho Dress:** Transition your summer maxi dresses into fall by layering this boxy, relaxed jacket over them.

Made from premium ribbed cotton corduroy, this jacket proves that you don't have to sacrifice style for comfort. Upgrade your closet today at Textile Jaipur.
    `,
    image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/4f54dd3e-a7ce-40d7-ba5d-1e1d7282f914.webp",
    status: "published",
    read_time: 3
  },
  {
    title: "The Allure of Vintage-Inspired Embroidered Fashion",
    slug: "vintage-inspired-embroidered-fashion-guide",
    excerpt: "Vintage-inspired clothing offers timeless elegance. Explore how embroidered jackets capture the magic of the past.",
    content: `
# The Allure of Vintage-Inspired Embroidered Fashion

There is something undeniably magnetic about vintage clothing. It speaks of a different era—a time when garments were crafted with intention, patience, and incredible attention to detail. 

Unfortunately, authentic vintage pieces can be incredibly fragile and difficult to maintain. The solution? High-quality, vintage-inspired contemporary fashion.

### Bridging the Past and Present
At Textile Jaipur, our [Vintage-Inspired Suzani Embroidered Jacket](/product/ba835eb3-4c34-4138-bc10-cdfe389c640e) captures the essence of classic bohemian style while utilizing fresh, durable materials. 

The intricate traditional motifs echo the designs found in antique tapestries, while the tailored fit ensures it flatters the modern silhouette. 

### Why Choose Vintage-Inspired?
1. **Durability:** You get the antique aesthetic without worrying about the fabric tearing or deteriorating after one wear.
2. **Timelessness:** Embroidery never goes out of style. It exists completely outside the frantic cycle of fast-fashion micro-trends.
3. **Versatility:** A vintage-inspired jacket can be worn over modern staples—like leggings or sleek dresses—creating a perfect balance between old-world charm and contemporary chic.

Embrace the romance of the past. Explore our collection of embroidered outerwear today.
    `,
    image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/87f1e43b-92bf-4e6c-a1bf-2e1a1d6e3b61.webp",
    status: "published",
    read_time: 2
  },
  {
    title: "Mastering the Art of Mixing Patterns and Textures",
    slug: "mastering-art-of-mixing-patterns-textures",
    excerpt: "Don't be afraid of bold prints! Discover the stylist secrets to flawlessly mixing patterns and textures.",
    content: `
# Mastering the Art of Mixing Patterns and Textures

For a long time, fashion rules dictated that you could only wear one bold pattern at a time. Today, those rules have been thrown out the window. "Maximalism" and boho-chic aesthetics celebrate the daring combination of contrasting prints and lush textures.

If you are ready to step out of your comfort zone, here is how to mix patterns like a professional stylist.

### 1. Anchor with a Dominant Texture
When mixing prints, texture is your secret weapon. If you are wearing a heavily embroidered piece, like our stunning [Classic Velvet Suzani Jacket](/product/bb91e2c3-2a89-4b8c-a755-fe56644f750c), the rich velvet acts as a visual anchor. You can pair it with a subtle silk floral dress underneath; the contrast between the plush velvet and smooth silk prevents the outfit from looking flat.

### 2. The Rule of Scale
Never mix two patterns of the exact same size. If your jacket has large, sweeping floral motifs, pair it with a micro-print (like tiny polka dots or thin stripes) on your shirt or trousers. 

### 3. Keep One Color Consistent
The easiest way to unify mismatched prints is through color. If your [Mustard Yellow Corduroy Jacket](/product/2b2f66da-9197-4b10-9b39-f647220527de) features hints of teal, choose a handbag or scarf that highlights that exact same shade of teal.

Fashion is supposed to be fun! Be bold, experiment, and let your clothes reflect your vibrant personality. 
    `,
    image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/b77dc696-fb3b-4daf-bb5b-13f2b84372d0.webp",
    status: "published",
    read_time: 3
  },
  {
    title: "From Jaipur to the World: The Journey of Your Jacket",
    slug: "from-jaipur-to-world-jacket-journey",
    excerpt: "Take a behind-the-scenes look at the incredible journey your Textile Jaipur garment takes, from raw thread to your wardrobe.",
    content: `
# From Jaipur to the World: The Journey of Your Jacket

When you open a package from **Textile Jaipur**, you aren't just unboxing a piece of clothing—you are unwrapping weeks of dedication, heritage, and human artistry. Have you ever wondered how your jacket came to be?

### 1. The Design and Dyeing
The journey begins in the vibrant city of Jaipur, India. Our artisans select premium fabrics, such as pure cotton or rich velvet. Using techniques that have been refined over generations, the fabrics are prepared and often dyed using natural, eco-friendly pigments.

### 2. The Embroidery
This is where the magic happens. For pieces like our [Handmade Cotton TNT Suzani Embroidered Jacket](/product/59314513-c143-49f5-81f6-e721235b8c61), skilled embroiderers spend days meticulously hand-stitching the intricate motifs. There are no automated machines here—just a needle, vibrant thread, and unparalleled human skill.

### 3. Tailoring and Finishing
Once the fabric is completely embroidered or block-printed, master tailors cut and sew the garment into its final silhouette. It is carefully inspected to ensure every seam is perfect and every detail meets our high luxury standards.

### 4. Direct to You
Because we operate with a strict "Zero Middlemen" philosophy, your jacket is shipped directly from our workshop in Rajasthan straight to your doorstep—whether you live in New York, London, Sydney, or anywhere else in the world. 

When you wear Textile Jaipur, you wear a story. Thank you for being a part of it.
    `,
    image_url: "https://evtjgujsfllegfmtqspq.supabase.co/storage/v1/object/public/product-images/80679eb3-b994-46ee-8e5e-fa1ee4b6738a.webp",
    status: "published",
    read_time: 3
  }
];

async function run() {
  // 1. Update old blogs
  for (const b of updateBlogs) {
    const { error } = await supabase.from('blogs').update({ image_url: b.image_url }).eq('slug', b.slug);
    if (error) console.error('Error updating', b.slug, error);
    else console.log('Updated image for', b.slug);
  }

  // 2. Insert new blogs
  for (const b of newBlogs) {
    const { error } = await supabase.from('blogs').upsert([b], { onConflict: 'slug' });
    if (error) console.error('Error inserting', b.slug, error);
    else console.log('Inserted new blog:', b.slug);
  }
}

run();
