"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

/**
 * A "Boop" component inspired by Josh Comeau's bouncy micro-animations.
 * It applies a spring-based scale and rotation effect on hover.
 */
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

    const timeoutId = window.setTimeout(() => {
      setIsBooped(false);
    }, timing);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isBooped, timing]);

  const trigger = () => {
    setIsBooped(true);
  };

  return (
    <motion.span
      onMouseEnter={trigger}
      style={{ display: "inline-block" }}
      animate={
        isBooped
          ? {
              x,
              y,
              rotate: rotation,
              scale,
            }
          : {
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
            }
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 10,
        mass: 0.5,
      }}
    >
      {children}
    </motion.span>
  );
}

/**
 * A simpler version that uses whileHover/whileTap for purely CSS-like interactions
 * but with Framer Motion's spring physics.
 */
export function Interactive({ children, scale = 1.1, hoverRotate = 5 }: { children: React.ReactNode, scale?: number, hoverRotate?: number }) {
  return (
    <motion.div
      style={{ display: "inline-flex" }}
      whileHover={{ scale, rotate: hoverRotate }}
      whileTap={{ scale: 0.95, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      {children}
    </motion.div>
  );
}
