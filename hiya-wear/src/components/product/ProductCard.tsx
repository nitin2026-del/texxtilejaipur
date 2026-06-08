import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { Badge } from '../ui';

interface ProductCardProps {
  product: Product;
  onAuthRequired?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAuthRequired }) => {
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const { formatProductPrice } = useCurrencyStore();
  const [wishlisted, setWishlisted] = React.useState(false);
  const [imageIdx, setImageIdx] = React.useState(0);

  const images = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { onAuthRequired?.(); return; }
    setWishlisted(!wishlisted);
    if (!wishlisted) {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
    } else {
      await supabase.from('wishlists').delete().match({ user_id: user.id, product_id: product.id });
    }
  };

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="product-card group relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-zinc-700 luxury-border">
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-[3/4] bg-zinc-900">
          <img
            src={images[imageIdx]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';
            }}
          />

          {/* Hover second image */}
          {images.length > 1 && (
            <img
              src={images[1]}
              alt={`${product.name} alternate`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_featured && <Badge variant="gold">Featured</Badge>}
            {isLowStock && <Badge variant="warning">Only {product.stock_quantity} left</Badge>}
            {isOutOfStock && <Badge variant="danger">Sold Out</Badge>}
          </div>

          {/* Quick Actions - appear on hover */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-lg backdrop-blur-sm border transition-all ${wishlisted ? 'bg-red-950/80 border-red-800/60 text-red-400' : 'bg-zinc-950/80 border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-800/40'}`}
              title="Add to Wishlist"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-400' : ''}`} />
            </button>
            <Link
              to={`/product/${product.id}`}
              className="p-2 rounded-lg bg-zinc-950/80 backdrop-blur-sm border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
              title="Quick View"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>

          {/* Thumbnail dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {images.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setImageIdx(i)}
                  onMouseLeave={() => setImageIdx(0)}
                  className={`h-1.5 rounded-full transition-all ${i === imageIdx ? 'w-4 bg-gold' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          )}

          {/* Add to Cart overlay */}
          {!isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="w-full btn-premium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {product.category && (
              <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">
                {product.category.name || 'Collection'}
              </p>
            )}
            <Link to={`/product/${product.id}`}>
              <h3 className="text-sm font-semibold text-white leading-snug hover:text-gold transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mt-1.5">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'fill-gold text-gold' : 'text-zinc-700'}`} />
          ))}
          <span className="text-[10px] text-zinc-500 ml-1">(28)</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-base font-bold text-white font-serif">
              {formatProductPrice(product)}
            </p>
            <p className="text-[10px] text-zinc-600">Incl. DDP shipping</p>
          </div>
          {isOutOfStock && (
            <span className="text-xs text-zinc-600 italic">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};
