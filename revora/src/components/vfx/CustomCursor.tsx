"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 350 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only run on desktop devices with fine pointer
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("interactive"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const newClick = { id: Date.now(), x: e.clientX, y: e.clientY };
      setClicks((prev) => [...prev.slice(-4), newClick]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Click Spark Bursts */}
      {clicks.map((click) => (
        <motion.div
          key={click.id}
          initial={{ opacity: 1, scale: 0.2 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ left: click.x - 20, top: click.y - 20 }}
          className="absolute h-10 w-10 rounded-full border-2 border-[#f21d58] shadow-[0_0_20px_#f21d58]"
        />
      ))}

      {/* Main Cursor Ring */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          scale: isHovered ? 1.8 : 1,
          borderColor: isHovered ? "rgba(242, 29, 88, 0.9)" : "rgba(242, 29, 88, 0.4)",
          backgroundColor: isHovered ? "rgba(135, 0, 37, 0.15)" : "rgba(0, 0, 0, 0)",
        }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="absolute -left-4 -top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#f21d58] backdrop-blur-[2px]"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-[#f21d58] shadow-[0_0_8px_#f21d58]" />
      </motion.div>
    </div>
  );
}
