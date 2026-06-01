import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;

  try {
    const { data: product } = await supabase
      .from('products')
      .select('name, description, product_images(url)')
      .eq('id', id)
      .single();

    if (!product) return {};

    const images = product.product_images && product.product_images.length > 0
      ? [product.product_images[0].url]
      : [];

    return {
      title: `${product.name} | Textile Jaipur`,
      description: product.description?.substring(0, 160) || 'Premium handcrafted ethnic wear.',
      openGraph: {
        title: product.name,
        description: product.description?.substring(0, 160),
        images: images,
      },
      twitter: {
        title: product.name,
        description: product.description?.substring(0, 160),
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
