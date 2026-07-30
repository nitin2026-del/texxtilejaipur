const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const newReviewsData = {
  "Vintage Suzani Jacket | Long Bohemian Embroidered Kimono": [
    { name: 'Anna M.', loc: '📍 Rome, Italy', date: '2026-03-15T10:00:00Z', stars: 5, title: 'Stunning deep red velvet', body: 'I was worried the velvet would be too heavy for spring, but the striped cotton lining makes it very breathable. The white and blue embroidery stands out beautifully against the burgundy. I wear it over a black jumpsuit and it looks incredibly high-end.', reply: 'Thank you Anna! The cotton lining is specifically designed for breathability.' },
    { name: 'Leticia V.', loc: '📍 Bogota, Colombia', date: '2026-02-10T10:00:00Z', stars: 5, title: 'Heirloom quality craftsmanship', body: 'The striped lining is such a beautiful surprise detail. The hand-embroidery shows true artisan craftsmanship—you can feel the texture of the threads. It is a masterpiece.' },
    { name: 'Claire H.', loc: '📍 Dublin, Ireland', date: '2026-05-22T10:00:00Z', stars: 4, title: 'Beautiful but quite long', body: 'I am 5\'2" so it hits right at my ankles, but I actually love the dramatic, sweeping look. The velvet material feels very plush and luxurious. Perfect for chilly evenings.', verified: true },
    { name: 'Nia O.', loc: '📍 Nairobi, Kenya', date: '2026-06-11T10:00:00Z', stars: 5, title: 'Completely transforms my wardrobe', body: 'I pair this deep red kimono with simple jeans and a white tee. It turns a completely basic outfit into high fashion instantly. The floral patterns are perfectly symmetrical and striking.' }
  ],
  "Women's Long Suzani Coat | Artisan Embroidered Kimono Jacket": [
    { name: 'Sofia R.', loc: '📍 Madrid, Spain', date: '2026-01-28T10:00:00Z', stars: 5, title: 'Sunshine in a coat!', body: 'I wasn\'t sure if a yellow velvet coat would be too flashy, but it is a rich, warm mustard tone that is actually very flattering. The dark green heart and oversized floral motifs are so unique. It brings joy to my wardrobe.' },
    { name: 'Chloe D.', loc: '📍 Paris, France', date: '2026-04-05T10:00:00Z', stars: 5, title: 'Incredible statement piece', body: 'I get stopped on the street constantly when I wear this. The blue piping along the edges gives it a very tailored, finished look despite the relaxed oversized fit. The yellow-striped lining is a lovely touch.', reply: 'We love that you noticed the contrast piping, Chloe! It adds that tailored structure.' },
    { name: 'Maya S.', loc: '📍 Cape Town, South Africa', date: '2026-05-18T10:00:00Z', stars: 4, title: 'Cozy and chic', body: 'The velvet is very soft and the embroidery is clearly done by hand—it has that authentic heavy feel. It is fully lined which makes it glide easily over sweaters without bunching up.', verified: true },
    { name: 'Harper L.', loc: '📍 Vancouver, Canada', date: '2026-02-14T10:00:00Z', stars: 5, title: 'Bold and beautiful', body: 'It is surprisingly versatile. The oversized green floral motifs give it a modern, playful edge while retaining that vintage bohemian soul. Definitely my favorite jacket for the season.' }
  ],
  "Luxury Long Suzani Kimono | Handcrafted Embroidered Jacket": [
    { name: 'Elena B.', loc: '📍 Buenos Aires, Argentina', date: '2026-03-30T10:00:00Z', stars: 5, title: 'Absolutely luxurious', body: 'The dark background makes the pink and light blue embroidery look like glowing stained glass. The craftsmanship is impeccable. I use this as an elegant duster over slip dresses for formal dinners.', reply: 'A perfect styling choice, Elena! The dark velvet really makes the pastels glow.' },
    { name: 'Grace K.', loc: '📍 Auckland, New Zealand', date: '2026-06-08T10:00:00Z', stars: 5, title: 'Perfect evening cover-up', body: 'I was looking for something elegant to wear over dresses for evening events instead of a boring blazer. This velvet kimono is warm enough for chilly nights and looks incredibly expensive. The pink trim on the cuffs is gorgeous.' },
    { name: 'Fatima Y.', loc: '📍 Casablanca, Morocco', date: '2026-01-12T10:00:00Z', stars: 5, title: 'Exquisite details and weight', body: 'The pink trim around the cuffs and hem is a gorgeous touch that ties the whole color palette together. The sheer weight of the embroidery makes the jacket drape beautifully on the body without looking bulky.', verified: true },
    { name: 'Olivia M.', loc: '📍 Chicago, IL, USA', date: '2026-04-20T10:00:00Z', stars: 4, title: 'Great quality, needs gentle care', body: 'You can immediately tell it is handmade by artisans. I make sure to dry clean it to protect the intricate threads. It elevates every single outfit I own and provides great warmth.' }
  ],
  "Artisan Hand-Embroidered Whimsical Velvet Statement Jacket": [
    { name: 'Zoe W.', loc: '📍 Berlin, Germany', date: '2026-02-05T10:00:00Z', stars: 5, title: 'A wearable piece of art!', body: 'I was hesitant about the whimsical motifs (the horse and dragonfly), but they are embroidered so beautifully in orange and purple tones on the rich blue velvet. It is my favorite conversational piece and brings a smile to everyone who sees it.', reply: 'We love the playful nature of this jacket, Zoe! The motifs are meant to be whimsical and fun.' },
    { name: 'Camila T.', loc: '📍 Santiago, Chile', date: '2026-05-02T10:00:00Z', stars: 5, title: 'Fun and flattering cut', body: 'Being a shorter jacket, it hits perfectly at the hips. The blue velvet is plush and the little hearts along the bottom hem are so sweet. I wear it unzipped with high-waisted jeans and it creates a great silhouette.' },
    { name: 'Aisha F.', loc: '📍 Cairo, Egypt', date: '2026-03-22T10:00:00Z', stars: 5, title: 'Unique bohemian charm', body: 'I have never seen anything like this. The sun and star motifs give it a magical, eclectic vibe. The material is very soft and the jacket isn\'t stiff at all, allowing for easy movement.', verified: true },
    { name: 'Lily S.', loc: '📍 Portland, OR, USA', date: '2026-06-25T10:00:00Z', stars: 4, title: 'Quirky and comfortable', body: 'The embroidery is thick and very well-done. It is a great lightweight jacket for transitional weather. I love the contrasting striped lining on the inside collar. It is purely joyful fashion.' }
  ]
};

async function insertNewReviews() {
  const allPayloads = [];

  for (const [productName, reviews] of Object.entries(newReviewsData)) {
    // Dynamically look up the product by name using ilike
    // We take a distinctive part of the name to ensure a match in case of minor variations
    const searchString = '%' + productName.split('|')[0].trim() + '%';
    
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', searchString)
      .limit(1);

    if (fetchError || !products || products.length === 0) {
      console.warn(`Could not find product matching: ${searchString}`);
      continue;
    }

    const productId = products[0].id;
    console.log(`Found product: ${products[0].name} (${productId})`);

    // Prepare review payloads for this product
    for (const r of reviews) {
      allPayloads.push({
        product_id: productId,
        reviewer_name: r.name,
        reviewer_location: r.loc,
        rating: r.stars,
        title: r.title,
        comment: r.body,
        reply: r.reply || null,
        status: 'approved',
        created_at: r.date
      });
    }
  }

  if (allPayloads.length === 0) {
    console.log('No payloads to insert. Please check if the products exist in the database.');
    return;
  }

  const { error: insertError } = await supabase.from('reviews').insert(allPayloads);
  
  if (insertError) {
    console.error('Error inserting reviews:', insertError);
  } else {
    console.log(`Successfully inserted ${allPayloads.length} new reviews into the live database!`);
  }
}

insertNewReviews();
