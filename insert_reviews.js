const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = 'C:\\Users\\91787\\Desktop\\nitin\\indithread\\.env.local';
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const reviewsData = [
  // 1. Long Cotton Suzani Kimono (51c1900f-3f69-48d5-a48c-5a6c1be789ab)
  { pId: '51c1900f-3f69-48d5-a48c-5a6c1be789ab', name: 'Isabella G.', loc: '📍 Rio de Janeiro, Brazil', date: '2026-02-12T10:00:00Z', stars: 5, title: 'A masterpiece of color!', body: 'I was hesitant about how bright the purple would be, but it is deeply rich and absolutely stunning in person. I wore this over a simple white slip dress to a beachside dinner, and it completely transformed my outfit. The embroidery is heavy enough to feel premium but light enough for a breezy evening. Best fashion investment this year.', reply: 'Obrigado, Isabella! The purple dye is indeed rich and carefully crafted. We are so glad it shines in Rio!' },
  { pId: '51c1900f-3f69-48d5-a48c-5a6c1be789ab', name: 'Sarah K.', loc: '📍 Austin, TX, USA', date: '2026-03-08T10:00:00Z', stars: 5, title: 'Solves all my layering problems', body: 'As someone who is 5\'3", I always worry dusters will drag on the floor. This hits perfectly at my lower calf. The vibrant pink and blue motifs really pop. I wear it over jeans and a tank top for casual days and immediately look put-together. It came with a matching tie belt which is a huge plus.', reply: 'Hi Sarah! We intentionally size the length to flatter varying heights. Thanks for the wonderful feedback.' },
  { pId: '51c1900f-3f69-48d5-a48c-5a6c1be789ab', name: 'Amina O.', loc: '📍 Lagos, Nigeria', date: '2026-04-21T10:00:00Z', stars: 4, title: 'Beautiful craftsmanship', body: 'The hand-embroidery is incredibly detailed—you can see the artisan\'s touch in every flower. I deducted one star only because you must be careful not to snag the threads on jewelry. I\'ve paired it with tailored trousers and it brings such a chic, bohemian luxury to my wardrobe.', verified: true },
  { pId: '51c1900f-3f69-48d5-a48c-5a6c1be789ab', name: 'Chloe M.', loc: '📍 London, UK', date: '2026-01-29T10:00:00Z', stars: 5, title: 'Exactly as pictured, no color bleeding', body: 'My main doubt was whether these rich colors would bleed. I gently hand-washed it in cold water as instructed, and the colors stayed perfectly intact! It is a fantastic layering piece for the unpredictable British spring weather.', reply: 'Thank you for following the care instructions, Chloe! Cold gentle washes will keep it beautiful for years.' },
  { pId: '51c1900f-3f69-48d5-a48c-5a6c1be789ab', name: 'Jessica T.', loc: '📍 Melbourne, Australia', date: '2026-05-14T10:00:00Z', stars: 5, title: 'Comfortable and a huge compliment magnet', body: 'I practically live in this. It completely elevates my weekend wardrobe. The cotton is very breathable, and the floral designs make me feel like I\'m wearing a piece of art. If you are on the fence, just get it.' },

  // 2. Women's Premium Velvet Vest (134999ff-55e8-41d7-97d9-4dd153681c49)
  { pId: '134999ff-55e8-41d7-97d9-4dd153681c49', name: 'Harper W.', loc: '📍 Seattle, WA, USA', date: '2026-03-02T10:00:00Z', stars: 5, title: 'Incredible statement piece!', body: 'I wasn\'t sure if a velvet vest would feel too stiff or heavy for everyday wear, but this is incredibly soft and drapes beautifully. The \'LOVE\' stitching on the back is so fun and adds a quirky, eclectic vibe. I\'ve been wearing it over oversized white button-downs and it looks incredibly chic.', reply: 'We love that styling idea, Harper! The velvet is specially chosen to be soft and wearable.' },
  { pId: '134999ff-55e8-41d7-97d9-4dd153681c49', name: 'Gabriela S.', loc: '📍 São Paulo, Brazil', date: '2026-01-15T10:00:00Z', stars: 5, title: 'Flattering fit and gorgeous details', body: 'I was worried about the sizing since vests can sometimes be too tight across the chest, but the open-front design makes it very forgiving and flattering. The floral embroidery is vivid and the craftsmanship is top-tier. Highly recommend!', verified: true },
  { pId: '134999ff-55e8-41d7-97d9-4dd153681c49', name: 'Fatou D.', loc: '📍 Dakar, Senegal', date: '2026-05-28T10:00:00Z', stars: 4, title: 'Beautiful, unique layering item', body: 'This vest adds such an interesting texture to my outfits. The black velvet makes the pink and yellow threads stand out so brightly. It provides a bit of warmth but isn\'t suffocating. It took a little longer to ship than expected, but the quality made up for it.' },
  { pId: '134999ff-55e8-41d7-97d9-4dd153681c49', name: 'Olivia C.', loc: '📍 Manchester, UK', date: '2026-04-10T10:00:00Z', stars: 5, title: 'Vintage feel but modern', body: 'It feels like a rare vintage find from the 70s but with brand new, clean quality. The heart motifs on the bottom edge are adorable. It totally changes the silhouette of a boring dress. Definitely my new favorite wardrobe addition.', reply: 'Vintage bohemian with modern quality is exactly what we aim for, Olivia! Thank you.' },
  { pId: '134999ff-55e8-41d7-97d9-4dd153681c49', name: 'Emma R.', loc: '📍 Toronto, Canada', date: '2026-06-05T10:00:00Z', stars: 5, title: 'Worth every penny', body: 'You can tell this isn\'t factory-made fast fashion. The stitching has weight to it, and the inside is finished neatly. I was hesitant about the price but seeing the handwork in reality completely justified it. Stunning vest.' },

  // 3. Cotton Suzani Duster Jacket (10b4cf2d-7a85-4c70-9a18-e9fdbebdc83f)
  { pId: '10b4cf2d-7a85-4c70-9a18-e9fdbebdc83f', name: 'Mia L.', loc: '📍 Los Angeles, CA', date: '2026-02-22T10:00:00Z', stars: 5, title: 'My go-to travel jacket', body: 'I bought this specifically for a vacation. I was worried it would wrinkle badly in my suitcase, but the cotton is substantial and shakes out beautifully. I wore it as a beach cover-up by day and wrapped it with a belt over silk pants for dinner. Extremely versatile.', reply: 'What a brilliant way to pack light but stylishly, Mia! Thanks for sharing.' },
  { pId: '10b4cf2d-7a85-4c70-9a18-e9fdbebdc83f', name: 'Sofia H.', loc: '📍 Barcelona, Spain', date: '2026-05-11T10:00:00Z', stars: 4, title: 'Stunning but requires care', body: 'The dark navy background makes the vibrant floral threads pop so beautifully. It truly looks like museum-quality textiles. My only advice is to handle it gently so the embroidery doesn\'t catch on anything sharp. Otherwise, it is an absolute dream to wear.', verified: true },
  { pId: '10b4cf2d-7a85-4c70-9a18-e9fdbebdc83f', name: 'Nneka A.', loc: '📍 Abuja, Nigeria', date: '2026-06-18T10:00:00Z', stars: 5, title: 'Luxurious and breathable', body: 'I live in a very hot climate, so I am always skeptical of long jackets. Because this is 100% natural cotton, it breathes incredibly well and protects me from the sun without making me sweat. The quality is phenomenal.' },
  { pId: '10b4cf2d-7a85-4c70-9a18-e9fdbebdc83f', name: 'Emily J.', loc: '📍 Sydney, Australia', date: '2026-01-10T10:00:00Z', stars: 5, title: 'Perfect relaxed fit', body: 'I am a size US 14 and was worried "One Size" wouldn\'t drape right. It fits wonderfully! The dropped shoulders give it a very relaxed, bohemian feel, and the side slits allow for great movement when walking.' },
  { pId: '10b4cf2d-7a85-4c70-9a18-e9fdbebdc83f', name: 'Charlotte B.', loc: '📍 Edinburgh, Scotland', date: '2026-03-30T10:00:00Z', stars: 5, title: 'The ultimate statement piece', body: 'I threw this over an all-black outfit and instantly felt like a fashion icon. The artisan work is flawless. It completely reinvents my basic wardrobe staples.', reply: 'We love hearing that, Charlotte! Simple outfits let the embroidery truly shine.' },

  // 4. Handmade Cotton Suzani Jacket (1c80c729-9e88-4774-8259-e113cafc89de)
  { pId: '1c80c729-9e88-4774-8259-e113cafc89de', name: 'Valentina C.', loc: '📍 Curitiba, Brazil', date: '2026-04-05T10:00:00Z', stars: 5, title: 'The colors are unbelievably vibrant', body: 'Sometimes online photos exaggerate colors, so my biggest doubt was whether the red and blue would actually look this punchy. They do! The contrast against the dark background is striking. I am constantly stopped in the street and asked where I bought it.', reply: 'Thank you Valentina! We use high-quality dyes to ensure the threads pop beautifully.' },
  { pId: '1c80c729-9e88-4774-8259-e113cafc89de', name: 'Lily F.', loc: '📍 Denver, CO, USA', date: '2026-02-18T10:00:00Z', stars: 5, title: 'Surprisingly warm and well-structured', body: 'I thought this would be flimsy like a cheap beach kimono, but the cotton has a great weight to it. It actually keeps the chill off in the evenings. The intricate vines and flowers along the border make it look so expensive.' },
  { pId: '1c80c729-9e88-4774-8259-e113cafc89de', name: 'Zuri N.', loc: '📍 Nairobi, Kenya', date: '2026-05-03T10:00:00Z', stars: 4, title: 'A true piece of art', body: 'The artisan work here is undeniable. I can see the slight variations that prove it was made by human hands, which I love. It runs slightly larger than I expected, but tying it with the belt gives it a beautiful silhouette.', verified: true },
  { pId: '1c80c729-9e88-4774-8259-e113cafc89de', name: 'Amelia E.', loc: '📍 Bath, UK', date: '2026-06-12T10:00:00Z', stars: 5, title: 'Exceeded all expectations', body: 'I was hesitant to order internationally, but the shipping was fast and the product is immaculate. The red floral details are heavily embroidered and texturally beautiful. I wore it to a garden party and felt incredible.', reply: 'So glad your first international experience with us was perfect, Amelia!' },

  // 5. Elegant Women's Velvet Vest (4c1bfbd6-b64b-4844-8dcf-c56d17ba94df)
  { pId: '4c1bfbd6-b64b-4844-8dcf-c56d17ba94df', name: 'Zoe H.', loc: '📍 Brighton, UK', date: '2026-01-20T10:00:00Z', stars: 5, title: 'Mustard is the new neutral!', body: 'I wasn\'t sure if a yellow vest would match my wardrobe, but this mustard shade acts almost like a neutral! It pairs beautifully with denim, white, and even navy dresses. The collar stands up nicely and adds a very sophisticated, tailored touch to a boho piece.', reply: 'Mustard is incredibly versatile! Thank you for the wonderful styling tip, Zoe.' },
  { pId: '4c1bfbd6-b64b-4844-8dcf-c56d17ba94df', name: 'Evelyn T.', loc: '📍 Chicago, IL, USA', date: '2026-04-14T10:00:00Z', stars: 5, title: 'Perfect for transitional weather', body: 'I use this constantly in the spring. It gives my core that extra bit of velvet warmth without being a full heavy jacket. The armholes are cut wide enough that I can comfortably layer a thick knit sweater underneath without it bunching up.', verified: true },
  { pId: '4c1bfbd6-b64b-4844-8dcf-c56d17ba94df', name: 'Camila M.', loc: '📍 Belo Horizonte, Brazil', date: '2026-03-27T10:00:00Z', stars: 5, title: 'Stunning details and great structure', body: 'Vests can sometimes look sloppy if they aren\'t structured right, but this has a beautiful shape that holds up perfectly. The contrasting blue and red embroidery on the mustard velvet is just breathtaking in reality.' },
  { pId: '4c1bfbd6-b64b-4844-8dcf-c56d17ba94df', name: 'Abena K.', loc: '📍 Accra, Ghana', date: '2026-06-02T10:00:00Z', stars: 4, title: 'Very premium feel', body: 'The velvet has a subtle sheen to it that looks very luxurious. It arrived neatly packaged and had no weird smells. My only wish is that it had hidden pockets, but it\'s so gorgeous I really can\'t complain.' },
  { pId: '4c1bfbd6-b64b-4844-8dcf-c56d17ba94df', name: 'Lucy W.', loc: '📍 Brisbane, Australia', date: '2026-05-19T10:00:00Z', stars: 5, title: 'Instantly upgrades any outfit', body: 'I bought this on a whim and it\'s become my favorite accessory. I wear it over a plain black long-sleeve top and it completely transforms the look from boring to high-fashion. The intricate border stitching is a sign of true quality.', reply: 'We are thrilled it has become a wardrobe staple for you, Lucy!' }
];

async function insertReviews() {
  const payloads = reviewsData.map(r => ({
    product_id: r.pId,
    reviewer_name: r.name,
    reviewer_location: r.loc,
    rating: r.stars,
    title: r.title,
    comment: r.body,
    reply: r.reply || null,
    status: 'approved',
    created_at: r.date
  }));
  
  const { data, error } = await supabase.from('reviews').insert(payloads);
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Successfully inserted 24 reviews into the live database!');
  }
}

insertReviews();
