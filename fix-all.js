require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAll() {
  const { data: products } = await supabase.from('products').select('*');
  const empty = products.filter(p => !p.description || p.description.length < 20 || !p.details?.translations);
  console.log(`Found ${empty.length} products to fix.`);

  for (const p of empty) {
    const name = p.name || 'Jacket';
    const material = p.details?.material || 'Premium Fabric';
    const origin = p.details?.origin || 'Jaipur, Rajasthan';

    const desc = `Draped in the opulent tapestry of our ${name}, you wear a living canvas of breathtaking artistry. Intricate, hand-embroidered floral motifs bloom across the fabric, creating a majestic symphony of colors that captures the romance of a bygone era.\n\nEvery thread of this masterpiece tells a story of devotion, meticulously tailored from ${material} in the historic heart of ${origin}. Combining ancestral weaving techniques with contemporary structure, this jacket is a testament to the unparalleled skill of our master artisans, designed to be cherished for generations.`;

    const culturalContext = "The Suzani technique, historically celebrated across Central Asia and embraced by the royal ateliers of Rajasthan, represents a sacred tradition of decorative needlework depicting life and fertility. Married with the heritage of Jaipur's artisanal handloom weaving, this jacket reflects a cross-cultural confluence of royal patronage and meticulous handcraft.";
    
    const stylingAdvice = "Embrace effortless global fusion by layering this statement jacket over a minimalist silk slip dress or structured white linen shirt paired with dark-wash denim. Complete the ensemble with delicate gold hoops and sleek leather boots to allow the intricate textures and vibrant embroidery to command the room.";

    const translations = {
      "fr": `Drapé dans l'opulente tapisserie de notre ${name}, vous portez une toile vivante d'un art époustouflant. Des motifs floraux complexes brodés à la main s'épanouissent sur le tissu, créant une symphonie majestueuse de couleurs qui capture le romantisme d'une époque révolue.\n\nChaque fil de ce chef-d'œuvre raconte une histoire de dévotion, méticuleusement confectionné à partir de ${material} au cœur historique de ${origin}. Alliant techniques de tissage ancestrales et structure contemporaine, cette veste témoigne du savoir-faire inégalé de nos maîtres artisans.`,
      "es": `Envuelto en el opulento tapiz de nuestra ${name}, vistes un lienzo vivo de un arte impresionante. Intrincados motivos florales bordados a mano florecen sobre la tela, creando una majestuosa sinfonía de colores que evoca el romance de una época pasada.\n\nCada hilo de esta obra maestra cuenta una historia de devoción, meticulosamente confeccionada con ${material} en el corazón histórico de ${origin}. Combinando técnicas de tejido ancestrales con una estructura contemporánea, esta chaqueta es un testimonio de la destreza inigualable de nuestros maestros artesanos.`,
      "ar": `مرتديًا النسيج الفاخر لـ ${name}، فإنك ترتدي لوحة حية من الفن الأخاذ. تتفتح زهور مطرزة يدويًا بدقة على القماش، مما يخلق سيمفونية مهيبة من الألوان تأسر روعة العصور الغابرة.\n\nكل خيط في هذه التحفة الفنية يروي قصة من التفاني، حيث تم تفصيلها بدقة من ${material} في قلب ${origin} التاريخي. تجمع هذه السترة بين تقنيات النسيج العريقة والهيكل المعاصر، وهي شهادة على المهارة التي لا تضاهى لحرفيينا المبدعين.`,
      "de": `Gehüllt in die opulente Pracht unserer ${name} tragen Sie ein lebendiges Kunstwerk von atemberaubender Schönheit. Filigrane, handgestickte Blumenmotive blühen auf dem Stoff auf und kreieren eine majestätische Symphonie der Farben, die die Romantik vergangener Zeiten heraufbeschwört.\n\nJeder Faden dieses Meisterwerks erzählt eine Geschichte der Hingabe, sorgfältig geschneidert aus ${material} im historischen Herzen von ${origin}. Durch die Verbindung überlieferter Webtechniken mit zeitgemäßer Struktur ist diese Jacke ein Beweis für das unvergleichliche Können unserer Meisterhandwerker.`
    };

    const { error } = await supabase.from('products').update({ 
      description: desc,
      details: { ...p.details, culturalContext, stylingAdvice, translations }
    }).eq('id', p.id);

    if (error) {
      console.error("Error updating", p.name, error);
    } else {
      console.log("Successfully fixed", p.name);
    }
  }
}

fixAll();
