/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { ExternalLink } from "lucide-react";
import { getCategoryMeta } from "@/utils/categories";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [imgError, setImgError] = useState(false);
  const meta = getCategoryMeta(product.type);

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md cursor-pointer"
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

        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 max-w-[85%]">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-[11px] font-semibold backdrop-blur-md shadow-2xs truncate ${meta.bgLight}`}
          >
            <span className="shrink-0">{meta.emoji}</span>
            <span className="truncate">{meta.label}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h3 className="line-clamp-2 text-xs sm:text-sm md:text-base font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="mt-1 sm:mt-2 line-clamp-2 text-[11px] sm:text-xs text-zinc-500 leading-relaxed hidden xs:block">
          {product.full_caption || "No description available."}
        </p>

        <div className="mt-auto pt-2.5 sm:pt-3 flex items-center justify-between border-t border-zinc-100 text-[10px] sm:text-xs font-medium text-zinc-600">
          <span className="truncate">View details</span>
          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
        </div>
      </div>
    </div>
  );
};
