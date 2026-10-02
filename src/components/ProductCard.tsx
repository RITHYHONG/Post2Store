/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { ExternalLink, Tag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [imgError, setImgError] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "beverage":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "snack / biscuit":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "candy / confectionery":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <span>No Image Available</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${getTypeColor(
              product.type
            )}`}
          >
            <Tag className="h-3 w-3" />
            {product.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs text-zinc-500 leading-relaxed">
          {product.full_caption || "No description available."}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 text-xs font-medium text-zinc-600">
          <span>Click for details</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
