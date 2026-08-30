import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { Product } from '@ai-commerce/shared';
import { Search, ShoppingCart, Star, Filter, CheckCircle, PackageOpen } from 'lucide-react';

// Skeleton card component for loading state
const ProductSkeleton: React.FC = () => (
  <div className="glass-card rounded-xl p-5 flex flex-col space-y-4 animate-fade-in-up">
    <div className="h-40 w-full rounded-lg skeleton" />
    <div className="space-y-2">
      <div className="h-3 w-16 skeleton" />
      <div className="h-5 w-3/4 skeleton" />
      <div className="h-3 w-full skeleton" />
    </div>
    <div className="flex justify-between items-center">
      <div className="h-4 w-12 skeleton" />
      <div className="h-4 w-20 skeleton" />
    </div>
    <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
      <div className="h-6 w-20 skeleton" />
      <div className="h-9 w-28 skeleton" />
    </div>
  </div>
);

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = [
    'All Categories',
    'Laptops',
    'USB-C Hubs & Docks',
    'Laptop Bags',
    'Keyboards',
    'Mice & Trackpads',
    'Monitors',
    'Headphones',
    'Accessories'
  ];

  const fetchProducts = useCallback(async (query: string, category: string) => {
    setIsLoading(true);
    try {
      const categoryParam = category && category !== 'All Categories' ? category : undefined;
      const res = await api.get('/products', {
        params: { query: query || undefined, category: categoryParam }
      });
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    } catch (err) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchProducts(searchQuery, selectedCategory);
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, selectedCategory, fetchProducts]);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
    setAddedProductId(productId);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-2xl p-8 overflow-hidden border border-blue-500/20 animated-gradient-bg animate-fade-in-up">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Smart Commerce Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Discover High-Performance Tech & Accessories
          </h1>
          <p className="text-slate-400 text-sm">
            Grounded inventory powered by MongoDB and Neo4j Knowledge Graph. Ask our AI Assistant anytime for personalized recommendations.
          </p>
        </div>
        {/* Decorative blur shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search laptops, USB-C hubs, keyboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                (selectedCategory === cat || (!selectedCategory && cat === 'All Categories'))
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-16 text-center space-y-4 border border-slate-800 animate-fade-in-up">
          <PackageOpen className="h-16 w-16 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-300">No Products Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            We couldn't find any products matching your search. Try adjusting your filters or search keywords.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
          {products.map((p) => (
            <div key={p.productId} className="glass-card rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-40 w-full rounded-lg bg-slate-800/80 overflow-hidden relative group">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'}
                    alt={p.name}
                    className="w-full h-full object-cover product-image-zoom"
                    loading="lazy"
                  />
                  <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-blue-400 border border-slate-700">
                    {p.category}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-semibold">{p.brand}</span>
                  <h3 className="font-bold text-slate-100 text-base line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-400 text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span className="font-semibold">{p.rating}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    p.inventory > 5
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : p.inventory > 0
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                  }`}>
                    {p.inventory > 5 ? `In Stock (${p.inventory})` : p.inventory > 0 ? `Only ${p.inventory} left` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Price</span>
                  <span className="text-lg font-extrabold text-white">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(p.productId)}
                  disabled={p.inventory === 0}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    addedProductId === p.productId
                      ? 'bg-emerald-600 text-white scale-105'
                      : p.inventory === 0
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:scale-105'
                  }`}
                >
                  {addedProductId === p.productId ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
