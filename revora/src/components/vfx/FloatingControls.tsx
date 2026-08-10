"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { setSoundEnabled, playClickSound } from "./SoundEffects";

export function FloatingControls() {
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={toggleSound}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md transition ${
          soundOn
            ? "border-white/20 bg-[#09090b]/90 text-white hover:bg-white hover:text-black"
            : "border-white/10 bg-[#09090b]/70 text-white/50 hover:text-white"
        }`}
        title="Toggle Micro-Audio Haptics"
      >
        {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        <span>{soundOn ? "Audio On" : "Muted"}</span>
      </button>
    </div>
  );
}
