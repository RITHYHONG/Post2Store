"use client";

import React, { useState, useMemo } from "react";
import rawProducts from "@/data/products.json";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { BackToTop } from "@/components/BackToTop";
import { Search, PackageSearch } from "lucide-react";

export default function Home() {
  const products: Product[] = rawProducts;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const types = Array.from(new Set(products.map((p) => p.type || "Other")));
    return ["All", ...types];
  }, [products]);

  // Filter products by search term and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.full_caption && p.full_caption.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === "All" || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, selectedType]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">Chhun Huong Store</h1>
            <p className="text-xs text-zinc-500">Product Showcase & Inventory Feed</p>
          </div>
          <div className="text-xs text-zinc-500 bg-zinc-100 rounded-full px-3 py-1 font-medium">
            {products.length} Items Total
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Controls: Search & Category Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedType(category)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                  selectedType === category
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-6 flex items-center justify-between text-xs text-zinc-500">
          <span>Showing {filteredProducts.length} results</span>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id || idx}
                product={product}
                onSelect={(item) => setSelectedProduct(item)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <PackageSearch className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-sm font-semibold text-zinc-800">No products found</h3>
            <p className="mt-1 text-xs text-zinc-500">Try adjusting your search query or filter criteria.</p>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Back to Top Floating Button */}
      <BackToTop />
    </div>
  );
}
