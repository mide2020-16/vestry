/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProductCategory } from "@/constants/ProductCategory";
import { Product } from "@/app/register/useRegister";
import { CheckIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedCheck, AnimatedChevron } from "@/components/ui/Boop";

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
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const label = category === ProductCategory.FOOD ? "Food" : "Drink";
  const available = items.filter((i) => i.available);

  // Measure track width and keep it updated on resize
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setTrackWidth(entry.contentRect.width);
    });
    ro.observe(el);
    setTrackWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (activeIndex >= available.length) {
      setActiveIndex(Math.max(0, available.length - 1));
    }
  }, [available.length, activeIndex]);

  const goTo = (index: number) =>
    setActiveIndex(Math.max(0, Math.min(index, available.length - 1)));

  const canSelect = selectedIds.length < maxSelections;

  // Center of track in px — the card's left edge to sit it perfectly centered
  const centerX = trackWidth / 2 - CARD_W / 2;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <span className="text-amber-600 dark:text-amber-400/80 text-[13px] font-semibold uppercase tracking-[0.25em]">
            Food & Drinks
          </span>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            selectedIds.length >= maxSelections
              ? "text-amber-600 dark:text-amber-400 bg-amber-400/10 border border-amber-500/20 shadow-sm"
              : "text-muted-foreground/60 bg-muted/50 border border-border"
          }`}
        >
          {selectedIds.length}/{maxSelections}
          {selectedIds.length >= maxSelections && " · Max"}
        </span>
      </div>

      {/* Carousel track */}
      <div
        ref={trackRef}
        className="relative w-full overflow-hidden"
        style={{ height: TRACK_H }}
      >
        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-16 z-20 pointer-events-none bg-linear-to-r from-background via-background/20 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-16 z-20 pointer-events-none bg-linear-to-l from-background via-background/20 to-transparent" />

        {trackWidth > 0 &&
          available.map((item, index) => {
            const offset = index - activeIndex;
            const isCenter = offset === 0;
            const isSelected = selectedIds.includes(item._id.toString());
            const isVisible = Math.abs(offset) <= 2;

            // Pure pixel position — no CSS calc, no ambiguity
            const xPx = centerX + offset * CARD_GAP;

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
                  x: xPx,
                  scale: isCenter ? 1 : 0.78,
                  opacity: isVisible ? (isCenter ? 1 : 0.5) : 0,
                  zIndex: isCenter ? 10 : 10 - Math.abs(offset),
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-0 left-0 cursor-pointer"
                style={{ width: CARD_W }}
                onClick={handleClick}
              >
                <div
                  className={`w-full rounded-2xl overflow-hidden border-2 transition-colors duration-200 bg-card
                  ${
                    isSelected && isCenter
                      ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                      : isCenter
                        ? "border-border shadow-lg"
                        : "border-border/40"
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
                    {isSelected && isCenter && (
                      <div className="absolute inset-0 bg-amber-400/15 flex items-center justify-center">
                        <span className="bg-amber-400 text-black rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg">
                          <AnimatedCheck>
                            <CheckIcon className="w-4 h-4" />
                          </AnimatedCheck>
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
                      className={`text-sm font-semibold truncate ${isCenter ? "text-foreground" : "text-muted-foreground/60"}`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${isCenter ? "text-amber-500" : "text-amber-500/40"}`}
                    >
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Tap hint — only on center */}
                {isCenter && (
                  <p
                    className={`text-center text-[10px] mt-1.5 transition-colors ${
                      isSelected ? "text-amber-500/60" : "text-muted-foreground/30"
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
          title='left'
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-sm"
        >
          <AnimatedChevron direction="left">
            <ChevronLeft size={16} />
          </AnimatedChevron>
        </button>

        <div className="flex gap-1.5">
          {available.map((item, i) => (
            <button
              title={item.name}
              type="button"
              key={item._id.toString()}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-200
                ${i === activeIndex ? "bg-amber-400 w-4 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-muted-foreground/25 w-1.5"}`}
            />
          ))}
        </div>

        <button
          title='right'
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === available.length - 1}
          className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-sm"
        >
          <AnimatedChevron direction="right">
            <ChevronRight size={16} />
          </AnimatedChevron>
        </button>
      </div>
    </div>
  );
}