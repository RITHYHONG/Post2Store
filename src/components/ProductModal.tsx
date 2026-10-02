/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Product } from "@/types/product";
import { X, ExternalLink, Tag } from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col md:flex-row overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-zinc-600 backdrop-blur hover:bg-white hover:text-zinc-900"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image Preview */}
        <div className="relative aspect-square md:w-1/2 bg-zinc-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details Pane */}
        <div className="flex flex-1 flex-col p-6 overflow-y-auto">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
              <Tag className="h-3 w-3" />
              {product.type}
            </span>
          </div>

          <h2 className="text-xl font-bold text-zinc-900">{product.name}</h2>

          <div className="mt-4 flex-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Full Post Description
            </h4>
            <div className="mt-2 whitespace-pre-wrap rounded-xl bg-zinc-50 p-3.5 text-sm text-zinc-600 border border-zinc-100">
              {product.full_caption || "No description provided."}
            </div>
          </div>

          {product.post_url && (
            <a
              href={product.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              <span>View on Facebook</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
