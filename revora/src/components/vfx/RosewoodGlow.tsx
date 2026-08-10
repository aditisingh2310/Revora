"use client";

export function RosewoodGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Top Center Hero Radial Beam */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-radial from-[#870025]/30 via-[#3b0010]/15 to-transparent blur-[120px] animate-pulse-glow" />

      {/* Top Right Neon Accent Orb */}
      <div className="absolute top-[15%] right-[-5%] h-[400px] w-[400px] rounded-full bg-[#f21d58]/10 blur-[130px] animate-float" />

      {/* Middle Left Soft Velvet Orb */}
      <div
        className="absolute top-[45%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#870025]/20 blur-[140px] animate-float"
        style={{ animationDelay: "-3s" }}
      />

      {/* Bottom Center Radial Highlight */}
      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 h-[450px] w-[750px] rounded-full bg-radial from-[#b80c38]/20 via-[#3b0010]/10 to-transparent blur-[120px]" />
    </div>
  );
}
