/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProductCategory } from "@/constants/ProductCategory";
import { Product } from "@/app/register/useRegister";
import { CheckIcon } from "lucide-react";

interface FoodCarouselProps {
  items: Product[];
  category?: ProductCategory.FOOD | ProductCategory.DRINK;
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelections: number;
}

const CARD_W = 148;
const IMAGE_H = 140;
const INFO_H = 70;
const CARD_H = IMAGE_H + INFO_H;
const CARD_GAP = 168;
const TRACK_H = CARD_H + 28;

export default function FoodCarousel({
  items,
  category,
  selectedIds,
  onToggle,
  maxSelections,
}: FoodCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const label = category === ProductCategory.FOOD ? "Food" : "Drink";
  const available = items.filter((i) => i.available);

  // Clamp activeIndex if available list shrinks
  useEffect(() => {
    if (activeIndex >= available.length) {
      setActiveIndex(Math.max(0, available.length - 1));
    }
  }, [available.length, activeIndex]);

  const goTo = (index: number) =>
    setActiveIndex(Math.max(0, Math.min(index, available.length - 1)));

  const canSelect = selectedIds.length < maxSelections;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <span className="text-amber-400/80 text-[13px] font-semibold uppercase tracking-[0.25em]">
            Choose {label}
          </span>
          <div className="h-px bg-white/10 w-10" />
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            selectedIds.length >= maxSelections
              ? "text-amber-400 bg-amber-400/10 border border-amber-400/20"
              : "text-white/40 bg-white/5 border border-white/10"
          }`}
        >
          {selectedIds.length}/{maxSelections}
          {selectedIds.length >= maxSelections && " · Max"}
        </span>
      </div>

      {/* Carousel track */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: TRACK_H }}
      >
        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-10 z-20 pointer-events-none bg-linear-to-r from-neutral-950 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-10 z-20 pointer-events-none bg-linear-to-l from-neutral-950 to-transparent" />

        {available.map((item, index) => {
          const offset = index - activeIndex;
          const isCenter = offset === 0;
          const isSelected = selectedIds.includes(item._id.toString());
          const isVisible = Math.abs(offset) <= 2;

          const handleClick = () => {
            if (isCenter) {
              if (isSelected || canSelect) onToggle(item._id.toString());
            } else {
              goTo(index);
            }
          };

          return (
            <motion.div
              key={item._id.toString()}
              animate={{
                x: `calc(50% - ${CARD_W / 2}px + ${offset * CARD_GAP}px)`,
                y: 0,
                scale: isCenter ? 1 : 0.78,
                opacity: isVisible ? (isCenter ? 1 : 0.45) : 0,
                zIndex: isCenter ? 10 : 10 - Math.abs(offset),
              }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute top-0 cursor-pointer"
              style={{ width: CARD_W }}
              onClick={handleClick}
            >
              <div
                className={`w-full rounded-2xl overflow-hidden border-2 transition-colors duration-200 bg-white/5
                ${
                  isSelected && isCenter
                    ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                    : isCenter
                      ? "border-white/20"
                      : "border-white/10"
                }`}
              >
                {/* Image */}
                <div className="relative w-full" style={{ height: IMAGE_H }}>
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes={`${CARD_W}px`}
                  />
                  {/* Only show selection overlay on the center card */}
                  {isSelected && isCenter && (
                    <div className="absolute inset-0 bg-amber-400/15 flex items-center justify-center">
                      <span className="bg-amber-400 text-black rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg">
                        <CheckIcon />
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div
                  className="px-3 py-2.5 text-center"
                  style={{ height: INFO_H }}
                >
                  <p
                    className={`text-sm font-semibold truncate ${isCenter ? "text-white" : "text-white/60"}`}
                  >
                    {item.name}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${isCenter ? "text-amber-400" : "text-amber-400/40"}`}
                  >
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Tap hint */}
              {isCenter && (
                <p
                  className={`text-center text-[10px] mt-1.5 transition-colors ${
                    isSelected ? "text-amber-400/60" : "text-white/30"
                  }`}
                >
                  {isSelected
                    ? "Tap to remove"
                    : canSelect
                      ? "Tap to select"
                      : "Max reached"}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Prev / Next + dots */}
      <div className="flex items-center gap-4 -mt-1">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          ‹
        </button>

        <div className="flex gap-1.5">
          {available.map((item, i) => (
            <button
              title={item.name}
              type="button"
              key={item._id.toString()}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-200
                ${i === activeIndex ? "bg-amber-400 w-4" : "bg-white/25 w-1.5"}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === available.length - 1}
          className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
}
