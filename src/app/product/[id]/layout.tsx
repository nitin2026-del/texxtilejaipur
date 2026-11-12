import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  params: { id: string }
}

async function _unusedGenerateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;

  try {
    const { data: product } = await supabase
      .from('products')
      .select('name, description, seo_title, seo_description, product_images(url)')
      .eq('id', id)
      .single();

    if (!product) return {};

    const images = product.product_images && product.product_images.length > 0
      ? [product.product_images[0].url]
      : [];

    const metaTitle = product.seo_title || `${product.name} | Textile Jaipur`;
    const metaDesc = product.seo_description || product.description?.substring(0, 160) || 'Premium handcrafted ethnic wear from Textile Jaipur.';

    return {
      title: metaTitle,
      description: metaDesc,
      openGraph: {
        title: metaTitle,
        description: metaDesc,
        images: images,
      },
      twitter: {
        title: metaTitle,
        description: metaDesc,
        images: images,
      }
    };
  } catch (err) {
    return {};
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
