"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// Base Boop — spring bounce on hover (your original, kept for flexibility)
// ─────────────────────────────────────────────────────────────────────────────
interface BoopProps {
  children: React.ReactElement;
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
  timing?: number;
}

export function Boop({
  children,
  x = 0,
  y = 0,
  rotation = 0,
  scale = 1.1,
  timing = 150,
}: BoopProps) {
  const [isBooped, setIsBooped] = useState(false);

  useEffect(() => {
    if (!isBooped) return;
    const id = window.setTimeout(() => setIsBooped(false), timing);
    return () => window.clearTimeout(id);
  }, [isBooped, timing]);

  return (
    <motion.span
      onMouseEnter={() => setIsBooped(true)}
      style={{ display: "inline-block" }}
      animate={
        isBooped
          ? { x, y, rotate: rotation, scale }
          : { x: 0, y: 0, rotate: 0, scale: 1 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 10, mass: 0.5 }}
    >
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Interactive — hover scale + slight rotate (your original)
// ─────────────────────────────────────────────────────────────────────────────
export function Interactive({
  children,
  scale = 1.1,
  hoverRotate = 5,
}: {
  children: React.ReactNode;
  scale?: number;
  hoverRotate?: number;
}) {
  return (
    <motion.div
      style={{ display: "inline-flex" }}
      whileHover={{ scale, rotate: hoverRotate }}
      whileTap={{ scale: 0.95, rotate: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckIcon — draws itself with a path animation on hover, then bounces in.
// Context: approving a registration. Feels satisfying and deliberate.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedCheck({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      style={{ display: "inline-flex" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={hovered ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      {/* Green pulse ring that expands outward on hover */}
      <motion.span
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          border: "1.5px solid #10b981",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          hovered
            ? { opacity: [0, 0.6, 0], scale: [0.6, 1.6, 1.6] }
            : { opacity: 0, scale: 0.6 }
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DeclineX — shakes side-to-side on hover, like a "no" head-shake.
// Context: rejecting/declining a receipt. The motion matches the meaning.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedDecline({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();

  const shake = async () => {
    await controls.start({
      x: [0, -5, 5, -4, 4, -2, 2, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
  };

  return (
    <motion.span
      style={{ display: "inline-flex" }}
      animate={controls}
      onMouseEnter={shake}
      whileTap={{ scale: 0.85 }}
    >
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExternalLink — nudges up-right on hover, like it's leaving the page.
// Context: opening a receipt in a new tab.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedExternalLink({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      style={{ display: "inline-flex" }}
      whileHover={{ x: 2, y: -2, scale: 1.15 }}
      whileTap={{ x: 0, y: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ChevronLeft / ChevronRight — slides in its own direction on hover.
// Context: pagination. The icon physically points toward where you're going.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedChevron({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: "left" | "right" | "down" | "up";
}) {
  const offset = direction === "left" ? -4 : 4;

  return (
    <motion.span
      style={{ display: "inline-flex" }}
      whileHover={{ x: offset, scale: 1.1 }}
      whileTap={{ x: offset * 1.5, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
    >
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AlertCircle — pulses with an amber glow on mount, then again on hover.
// Context: AI flagged something wrong. Draws the eye without being alarming.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedAlert({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      whileHover={{ scale: 1.25 }}
      transition={{ type: "spring", stiffness: 400, damping: 12 }}
    >
      {/* Ambient amber pulse — runs once on mount to catch the eye */}
      <motion.span
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: "50%",
          background: "rgba(245, 158, 11, 0.25)",
          pointerEvents: "none",
        }}
        animate={{
          scale: [1, 1.7, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Download — bounces downward on hover, like something dropping into a tray.
// Context: exporting the PDF list of registrations.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedDownload({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();

  const drop = async () => {
    await controls.start({
      y: [0, 4, -2, 1, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  };

  return (
    <motion.span
      style={{ display: "inline-flex" }}
      animate={controls}
      onMouseEnter={drop}
      whileTap={{ scale: 0.9, y: 3 }}
    >
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spinner — this replaces Loader2. Framer-controlled rotation so it
// eases in/out of spinning rather than the abrupt CSS animation cut.
// Context: any async operation in progress (approving, declining).
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedSpinner({
  className,
  size = 14,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <motion.span
      style={{ display: "inline-flex", width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      {/* A partial arc that looks like a spinner */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path d="M7 1.5A5.5 5.5 0 1 1 1.5 7" />
      </svg>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SuccessFlash — wraps any element and flashes a green halo when
// `triggered` goes true. Used after a successful approve action.
// Context: optimistic UI feedback before router.refresh() completes.
// ─────────────────────────────────────────────────────────────────────────────
export function SuccessFlash({
  children,
  triggered,
}: {
  children: React.ReactNode;
  triggered: boolean;
}) {
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <AnimatePresence>
        {triggered && (
          <motion.span
            key="flash"
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 8,
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </AnimatePresence>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageNumber — the active page dot scales up with a spring when selected.
// Context: pagination page buttons in RecentRegistrations.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedPageButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={isActive ? { scale: 1.15 } : { scale: 1 }}
      whileHover={isActive ? {} : { scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
        isActive
          ? "bg-amber-500 text-amber-950"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </motion.button>
  );
}