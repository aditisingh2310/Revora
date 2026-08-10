"use client";

export function MonochromeGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Top Center Hero Radial White Beam */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-radial from-white/[0.07] via-white/[0.02] to-transparent blur-[120px] animate-pulse-glow" />

      {/* Right Soft Glow */}
      <div className="absolute top-[20%] right-[-5%] h-[350px] w-[350px] rounded-full bg-white/[0.03] blur-[110px] animate-float" />

      {/* Middle Left Glow */}
      <div
        className="absolute top-[50%] left-[-8%] h-[400px] w-[400px] rounded-full bg-white/[0.04] blur-[120px] animate-float"
        style={{ animationDelay: "-3s" }}
      />
    </div>
  );
}
