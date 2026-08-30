import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { Product } from '@ai-commerce/shared';
import { Search, ShoppingCart, Star, Filter, CheckCircle } from 'lucide-react';

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const { addToCart } = useCart();

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

  const fetchProducts = async () => {
    try {
      const categoryParam = selectedCategory && selectedCategory !== 'All Categories' ? selectedCategory : undefined;
      const res = await api.get('/products', {
        params: { query: searchQuery || undefined, category: categoryParam }
      });
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
    setAddedProductId(productId);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-2xl glass-panel p-8 overflow-hidden border border-blue-500/20 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900">
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
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search laptops, USB-C hubs, keyboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                (selectedCategory === cat || (!selectedCategory && cat === 'All Categories'))
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.productId} className="glass-card rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="h-40 w-full rounded-lg bg-slate-800/80 overflow-hidden relative">
                <img
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                  In Stock ({p.inventory})
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
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  addedProductId === p.productId
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                }`}
              >
                {addedProductId === p.productId ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Added</span>
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

    </div>
  );
};
