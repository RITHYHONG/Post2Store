"use client";

import React, { useRef, useState, useEffect } from "react";
import { getCategoryMeta } from "@/utils/categories";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryNavProps {
  categories: { id: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll bounds to show/hide navigation arrows and gradient fades
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = direction === "left" ? -280 : 280;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleSelect = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(id);
    // Smoothly scroll selected pill into view
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <div className="relative w-full group">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll("left")}
          aria-label="Scroll left"
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm border border-zinc-200 transition-all hover:bg-zinc-50 hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Left Gradient Mask */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-4 sm:w-8 bg-gradient-to-r from-[#fafafa] to-transparent" />
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const meta = getCategoryMeta(cat.id);

          return (
            <button
              key={cat.id}
              onClick={(e) => handleSelect(cat.id, e)}
              className={`group flex items-center gap-1 sm:gap-1.5 shrink-0 rounded-full h-7 sm:h-8 px-2.5 sm:px-3 text-[11px] sm:text-xs font-medium tracking-tight transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-white text-zinc-600 border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <span className="text-[11px] sm:text-xs leading-none">{meta.emoji}</span>
              <span className="whitespace-nowrap">{meta.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] font-semibold tabular-nums ${
                  isSelected
                    ? "bg-zinc-800 text-zinc-300"
                    : "bg-zinc-100 text-zinc-400 group-hover:text-zinc-600"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Gradient Mask */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-4 sm:w-8 bg-gradient-to-l from-[#fafafa] to-transparent" />
      )}

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll("right")}
          aria-label="Scroll right"
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm border border-zinc-200 transition-all hover:bg-zinc-50 hover:scale-105 active:scale-95"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
