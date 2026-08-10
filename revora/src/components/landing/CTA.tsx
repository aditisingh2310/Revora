"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { playHoverSound, playClickSound } from "../vfx/SoundEffects";

export function CTA() {
  return (
    <section className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#09090b] to-[#000000] px-8 py-16 text-center sm:px-16 shadow-[0_20px_60px_rgba(255,255,255,0.03)]">
          {/* Subtle glow orb */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[600px] rounded-full bg-white/[0.02] blur-[100px]" />

          <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#000000] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            Get Started Instantly
          </span>

          <h2 className="relative z-10 mx-auto mt-6 max-w-2xl font-[family-name:var(--font-sora)] text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            Bring every conversation <span className="text-monochrome-gradient">home.</span>
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-xl text-base text-[#a1a1aa] font-medium">
            Spin up your first sandbox inbox in minutes. Fully self-hostable, end-to-end encrypted, and private.
          </p>

          <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/connections"
              onMouseEnter={playHoverSound}
              onClick={playClickSound}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-black shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition hover:scale-[1.03] hover:shadow-[0_4px_25px_rgba(255,255,255,0.35)]"
            >
              Start For Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              onMouseEnter={playHoverSound}
              onClick={playClickSound}
              className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10 hover:border-white/40"
            >
              Explore Architecture
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
