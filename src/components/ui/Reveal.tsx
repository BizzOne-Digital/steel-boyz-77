"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

type Direction = "up" | "left" | "right" | "none";

const offsets: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 32 },
  left: { x: -40 },
  right: { x: 40 },
  none: {},
};

/** Lightweight scroll reveal (transform + opacity only). Static when reduced motion is preferred. */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = m[as];
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <LazyMotion features={domAnimation} strict>
      <Comp
        className={className}
        initial={{ opacity: 0, ...offsets[direction] }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </Comp>
    </LazyMotion>
  );
}
