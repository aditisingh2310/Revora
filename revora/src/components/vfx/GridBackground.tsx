"use client";

import { useEffect, useState } from "react";

export function GridBackground() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#000000]">
      {/* Dynamic Geometric Grid Lines */}
      <div className="absolute inset-0 grid-pattern opacity-60" />

      {/* Subtle Mouse Radial Spotlight (Clean, No Glow) */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.05), transparent 80%)`,
        }}
      />

      {/* Top Subtle Lighting Mask */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#000000] via-transparent to-transparent opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#000000] via-transparent to-transparent opacity-80" />
    </div>
  );
}
