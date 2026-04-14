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
  springConfig = { stiffness: 400, damping: 17 },
  variants,
}: {
  children: React.ReactNode;
  scale?: number;
  hoverRotate?: number;
  springConfig?: { stiffness: number; damping: number };
  variants?: {
    hover?: any;
    tap?: any;
  };
}) {
  return (
    <motion.div
      style={{ display: "inline-flex" }}
      whileHover={variants?.hover ?? { scale, rotate: hoverRotate }}
      whileTap={variants?.tap ?? { scale: 0.95, rotate: 0 }}
      transition={{ type: "spring", ...springConfig }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckIcon — draws a checkmark path on hover with a satisfying green pulse.
// Context: approving a registration. The check "completes" itself.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedCheck({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={hovered ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      {/* Green pulse ring — "approval confirmed" feeling */}
      <motion.span
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          border: "2px solid #10b981",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          hovered
            ? { opacity: [0, 0.7, 0], scale: [0.6, 1.5, 1.8] }
            : { opacity: 0, scale: 0.6 }
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      {/* Second ring for a double-pulse effect */}
      <motion.span
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: "50%",
          background: "rgba(16, 185, 129, 0.15)",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          hovered
            ? { opacity: [0, 0.5, 0], scale: [0.8, 1.3, 1.5] }
            : { opacity: 0, scale: 0.8 }
        }
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      />
      <motion.span
        style={{ position: "relative" }}
        animate={hovered ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DeclineX — shakes + pulses red on hover, like a "NO" gesture.
// Context: rejecting/declining a receipt.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedDecline({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();
  const [hovered, setHovered] = useState(false);

  const shake = async () => {
    setHovered(true);
    await controls.start({
      x: [0, -6, 6, -5, 5, -3, 3, 0],
      rotate: [0, -3, 3, -2, 2, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    });
  };

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      animate={controls}
      onMouseEnter={shake}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.85, rotate: -10 }}
    >
      {/* Red flash on hover */}
      <motion.span
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.15)",
          pointerEvents: "none",
        }}
        animate={hovered ? { opacity: [0, 0.6, 0], scale: [0.8, 1.4, 1.4] } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExternalLink — nudges up-right with a trailing ghost, like opening a window.
// Context: opening a receipt in a new tab.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedExternalLink({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={hovered ? { x: 3, y: -3, scale: 1.15 } : { x: 0, y: 0, scale: 1 }}
      whileTap={{ x: 5, y: -5, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {/* Trailing ghost — visual hint that something is "leaving" */}
      <motion.span
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
        animate={
          hovered
            ? { x: -3, y: 3, opacity: [0, 0.3, 0], scale: 0.9 }
            : { opacity: 0 }
        }
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.span>
      <span style={{ position: "relative" }}>{children}</span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chevron — slides in its direction with a double-bump nudge.
// Context: pagination and toggles. Supports all 4 directions.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedChevron({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: "left" | "right" | "down" | "up";
}) {
  const offsets = {
    left: { x: -4, y: 0 },
    right: { x: 4, y: 0 },
    up: { x: 0, y: -4 },
    down: { x: 0, y: 4 },
  };

  const { x, y } = offsets[direction];

  return (
    <motion.span
      style={{ display: "inline-flex" }}
      whileHover={{ x: x, y: y, scale: 1.1 }}
      whileTap={{ x: x * 1.5, y: y * 1.5, scale: 0.95 }}
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
      {/* Ambient amber pulse — runs continuously to catch the eye */}
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
// Download — arrow drops into a tray on hover.
// Context: exporting/downloading PDFs and csv files.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedDownload({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();

  const drop = async () => {
    await controls.start({
      y: [0, 6, -3, 2, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    });
  };

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      animate={controls}
      onMouseEnter={drop}
      whileTap={{ scale: 0.9, y: 4 }}
    >
      {children}
      {/* Tray line that appears momentarily on drop */}
      <motion.span
        style={{
          position: "absolute",
          bottom: -2,
          left: "10%",
          right: "10%",
          height: 2,
          borderRadius: 1,
          background: "currentColor",
          opacity: 0,
          pointerEvents: "none",
        }}
        animate={controls}
      />
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload — arrow floats upward like a file ascending to the cloud.
// Context: uploading images and files.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedUpload({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();

  const rise = async () => {
    await controls.start({
      y: [0, -5, -2, -6, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    });
  };

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      animate={controls}
      onMouseEnter={rise}
      whileTap={{ scale: 0.9, y: -3 }}
    >
      {/* Fading trail below — "ascending" effect */}
      <motion.span
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
        animate={controls}
      />
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit (Pencil) — pencil wiggles like it's writing.
// Context: editing a product or registration.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedEdit({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();

  const wiggle = async () => {
    await controls.start({
      rotate: [0, -12, 12, -8, 8, -4, 0],
      x: [0, -1, 1, -1, 1, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    });
  };

  return (
    <motion.span
      style={{ display: "inline-flex" }}
      animate={controls}
      onMouseEnter={wiggle}
      whileTap={{ scale: 0.9, rotate: -15 }}
    >
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trash — lid opens on hover, shakes on tap. Demonstrates "discarding".
// Context: deleting a product.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedTrash({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={hovered ? { y: -1 } : { y: 0 }}
      whileTap={{
        x: [0, -3, 3, -2, 2, 0],
        transition: { duration: 0.3 },
      }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {/* Red glow on hover */}
      <motion.span
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: "8px",
          background: "rgba(239, 68, 68, 0.1)",
          pointerEvents: "none",
        }}
        animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        style={{ position: "relative", display: "inline-flex" }}
        animate={hovered ? { rotate: -5, y: -2 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bell — swings side to side like ringing. Demonstrates "notification".
// Context: push notification buttons.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedBell({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();

  const ring = async () => {
    await controls.start({
      rotate: [0, 15, -15, 12, -12, 8, -8, 4, -4, 0],
      transition: { duration: 0.7, ease: "easeInOut" },
    });
  };

  return (
    <motion.span
      style={{ display: "inline-flex", transformOrigin: "top center" }}
      animate={controls}
      onMouseEnter={ring}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plus — rotates 90° on hover (becomes an 'x' shape), pops with scale.
// Context: adding new items.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedPlus({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      style={{ display: "inline-flex" }}
      whileHover={{ rotate: 90, scale: 1.2 }}
      whileTap={{ scale: 0.85, rotate: 180 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {children}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy — second sheet slides out from behind, like duplicating a document.
// Context: copy to clipboard buttons.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedCopy({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.9 }}
    >
      {/* Ghost duplicate that slides out */}
      <motion.span
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
        animate={
          hovered
            ? { x: 3, y: -3, opacity: 0.3, scale: 0.95 }
            : { x: 0, y: 0, opacity: 0, scale: 1 }
        }
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {children}
      </motion.span>
      <motion.span
        style={{ position: "relative" }}
        animate={hovered ? { x: -1, y: 1 } : { x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spinner — Framer-controlled rotation so it eases smoothly.
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

// ───────────────────────────────────────────────────────────────────
// 🎯 SPECIALIZED: FILE TEXT / DOWNLOAD
// ───────────────────────────────────────────────────────────────────
export function AnimatedFileText({ children }: { children: React.ReactNode }) {
  return (
    <Interactive
      springConfig={{ stiffness: 300, damping: 10 }}
      variants={{
        hover: { scale: 1.1, y: -2, rotate: -3 },
        tap: { scale: 0.9, y: 0 },
      }}
    >
      {children}
    </Interactive>
  );
}

// ───────────────────────────────────────────────────────────────────
// 🎯 SPECIALIZED: SMARTPHONE / PAYMENT
// ───────────────────────────────────────────────────────────────────
export function AnimatedSmartphone({ children }: { children: React.ReactNode }) {
  return (
    <Interactive
      springConfig={{ stiffness: 400, damping: 12 }}
      variants={{
        hover: { 
          scale: 1.15, 
          rotate: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.4 }
        },
        tap: { scale: 0.9 },
      }}
    >
      {children}
    </Interactive>
  );
}

// ───────────────────────────────────────────────────────────────────
// 🎯 SPECIALIZED: LANDMARK / BANK
// ───────────────────────────────────────────────────────────────────
export function AnimatedLandmark({ children }: { children: React.ReactNode }) {
  return (
    <Interactive
      springConfig={{ stiffness: 200, damping: 15 }}
      variants={{
        hover: { y: -4, scale: 1.05 },
        tap: { y: 0, scale: 0.95 },
      }}
    >
      {children}
    </Interactive>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sun — rays pulse and rotate slightly.
// Context: theme toggle (Light).
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedSun({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={hovered ? { scale: 1.15, rotate: 45 } : { scale: 1, rotate: 0 }}
      whileTap={{ scale: 0.9, rotate: 90 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {/* Golden halo pulse */}
      <motion.span
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: "50%",
          background: "rgba(245, 158, 11, 0.2)",
          pointerEvents: "none",
        }}
        animate={hovered ? { opacity: [0, 0.5, 0], scale: [0.8, 1.4, 1.6] } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Moon — rocks like a cradle, gentle blue glow.
// Context: theme toggle (Dark).
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedMoon({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={hovered ? { rotate: [-10, 10, -10], scale: 1.1 } : { rotate: 0, scale: 1 }}
      whileTap={{ scale: 0.9, rotate: -20 }}
      transition={{ 
        rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 300, damping: 15 }
      }}
    >
      {/* Indigo halo pulse */}
      <motion.span
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.2)",
          pointerEvents: "none",
        }}
        animate={hovered ? { opacity: [0, 0.4, 0], scale: [0.9, 1.3, 1.5] } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Monitor — screen "blinks" and unit tilts.
// Context: theme toggle (System).
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedMonitor({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      style={{ display: "inline-flex", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={hovered ? { y: -2, scale: 1.1, rotate: -3 } : { y: 0, scale: 1, rotate: 0 }}
      whileTap={{ scale: 0.95, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {/* Screen flash effect */}
      <motion.span
        style={{
          position: "absolute",
          inset: 4,
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "2px",
          pointerEvents: "none",
          zIndex: 10,
        }}
        initial={{ opacity: 0 }}
        animate={hovered ? { opacity: [0, 0.8, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3, repeat: 1, repeatDelay: 0.1 }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </motion.span>
  );
}