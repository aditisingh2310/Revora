"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, Activity, ShieldCheck, Zap } from "lucide-react";
import { playHoverSound, playClickSound } from "../vfx/SoundEffects";

export function Hero() {
  return (
    <section className="relative noise overflow-hidden px-4 pb-20 pt-36 sm:px-6 lg:pt-44">
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        {/* Kernal-style Status Pill Badge (No Neon Glow) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#09090b]/90 px-4 py-1.5 text-[10px] font-bold tracking-wider text-white/90 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="uppercase tracking-[0.15em] text-white">
            REVORA COGNITIVE ROUTER
          </span>
          <span className="text-white/30">•</span>
          <span className="text-white/60">LIVE PIPELINE ACTIVATED</span>
        </motion.div>

        {/* Large Bold Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-8 font-[family-name:var(--font-sora)] text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Every customer conversation, <br />
          <span className="text-monochrome-gradient">unified in real-time.</span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.14, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#a1a1aa] font-medium sm:text-lg"
        >
          A self-hostable multi-tenant message routing infrastructure that connects, normalizes,
          and processes Telegram, WhatsApp, and custom webhook channels with sub-second execution.
        </motion.p>

        {/* Action Buttons (Clean, Flat, Solid White, No Neon Glow) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            href="/connections"
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:scale-[1.03]"
          >
            Launch Instance
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#product"
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40"
          >
            Explore Live Simulator
            <ChevronRight className="h-4 w-4 text-white/60 transition group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.28 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[#71717a] font-semibold"
        >
          <span className="inline-flex items-center gap-2 text-white/90">
            <ShieldCheck className="h-4 w-4 text-white" />
            Tenant Sandbox Isolation
          </span>
          <span className="inline-flex items-center gap-2 text-white/90">
            <Zap className="h-4 w-4 text-white" />
            &lt; 3.4ms Pipeline Latency
          </span>
          <span className="inline-flex items-center gap-2 text-white/90">
            <Activity className="h-4 w-4 text-white" />
            Signed Webhooks (HMAC-SHA256)
          </span>
        </motion.div>
      </div>
    </section>
  );
}
