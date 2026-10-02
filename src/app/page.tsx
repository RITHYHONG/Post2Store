"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import rawProducts from "@/data/products.json";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { BackToTop } from "@/components/BackToTop";
import { CategoryNav } from "@/components/CategoryNav";
import { CATEGORY_ORDER, getCategoryMeta } from "@/utils/categories";
import { Search, PackageSearch, X, RotateCcw } from "lucide-react";

export default function Home() {
  const products: Product[] = rawProducts;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute category statistics and order them logically by volume & priority
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const type = p.type || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });

    const orderedCategories = CATEGORY_ORDER.filter(
      (cat) => cat === "All" || counts[cat] !== undefined
    ).map((cat) => ({
      id: cat,
      count: cat === "All" ? products.length : counts[cat] || 0,
    }));

    // Append any extra category not in CATEGORY_ORDER
    Object.keys(counts).forEach((cat) => {
      if (!CATEGORY_ORDER.includes(cat)) {
        orderedCategories.push({ id: cat, count: counts[cat] });
      }
    });

    return orderedCategories;
  }, [products]);

  // Filter products by search term and category
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.full_caption && p.full_caption.toLowerCase().includes(q));
      const matchesType = selectedType === "All" || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, selectedType]);

  // Quick reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
  };

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasActiveFilter = selectedType !== "All" || searchQuery.trim().length > 0;
  const activeMeta = getCategoryMeta(selectedType);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-xs shadow-2xs">
              CH
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-base font-bold tracking-tight text-zinc-900 truncate">
                  Chhun Huong Store
                </h1>
                <span className="hidden md:inline-block rounded-md bg-zinc-100 px-1.5 py-0.2 text-[10px] font-medium text-zinc-600">
                  ទំនិញបោះដុំ
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                Wholesale Catalog
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-zinc-600 border border-zinc-200/70 whitespace-nowrap">
              {products.length} Items
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl px-2.5 py-2.5 sm:px-6 sm:py-5 flex-1">
        {/* Controls Section */}
        <div className="space-y-1.5 sm:space-y-3">
          {/* Row 1: Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products (Oreo, Soju, នំដំឡូង)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-200/90 bg-white pl-8 sm:pl-9 pr-8 sm:pr-16 h-8 sm:h-9 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 shadow-2xs"
            />
            <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
                  aria-label="Clear search query"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-block rounded border border-zinc-200 bg-zinc-50 px-1 py-0.2 text-[9px] font-medium text-zinc-400">
                /
              </kbd>
            </div>
          </div>

          {/* Row 2: Category Navigation */}
          <div>
            <CategoryNav
              categories={categoryStats}
              selectedCategory={selectedType}
              onSelectCategory={(id) => setSelectedType(id)}
            />
          </div>

          {/* Row 3: Active Filters & Results Summary */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs text-zinc-500 pt-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-medium text-zinc-700 whitespace-nowrap">
                {filteredProducts.length} items
              </span>

              {/* Active Category Tag */}
              {selectedType !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200/70 px-2 py-0.2 text-[10px] sm:text-[11px] font-medium text-zinc-800 truncate">
                  <span>{activeMeta.emoji}</span>
                  <span className="truncate max-w-[100px]">{activeMeta.label}</span>
                  <button
                    onClick={() => setSelectedType("All")}
                    className="hover:text-red-500 transition-colors ml-0.5"
                    title="Remove filter"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}

              {/* Active Search Tag */}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200/70 px-2 py-0.2 text-[10px] sm:text-[11px] font-medium text-zinc-800 truncate">
                  <span className="truncate max-w-[80px]">&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-red-500 transition-colors ml-0.5"
                    title="Clear search"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
            </div>

            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="mt-2.5 sm:mt-5 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id || idx}
                product={product}
                onSelect={(item) => setSelectedProduct(item)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-zinc-200 bg-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <PackageSearch className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-800">
              No products found
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm">
              We couldn&apos;t find any items matching your current search or category filter.
            </p>
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear all filters</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 bg-white/70 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-xs text-zinc-500">
            Powered by <span className="font-semibold text-zinc-800">Post2Store</span> — Turn Facebook Page catalogs into modern storefronts.
          </p>
          <p className="text-xs text-zinc-400">
            Wholesale distributor Toul Svay Prey, Phnom Penh
          </p>
        </div>
      </footer>

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
