"use client";

import { motion } from "framer-motion";
import { Inbox, Layers, Zap, Workflow, Shield, Bot, Sparkles, Activity, Lock, ArrowRight } from "lucide-react";
import { playHoverSound } from "../vfx/SoundEffects";

export function Features() {
  return (
    <section id="features" className="relative px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section Title Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#09090b] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Engine Architecture
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-sora)] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Architected for high-velocity <br />
              <span className="text-monochrome-gradient">customer communications.</span>
            </h2>
            <p className="mt-4 text-base text-[#a1a1aa] font-medium">
              Zero latency routing, strict sandbox isolation, and universal adapter normalization out of the box.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* Card 1: Unified Adapter Matrix (2 columns wide) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onMouseEnter={playHoverSound}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#09090b] to-[#000000] p-8 shadow-2xl transition hover:border-white/30 md:col-span-2"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.02] blur-3xl transition duration-500 group-hover:scale-125" />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-[#121215] text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]">
              <Inbox className="h-5 w-5" />
            </div>

            <h3 className="mt-6 font-[family-name:var(--font-sora)] text-2xl font-bold text-white">
              Universal Channel Normalizer
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#a1a1aa]">
              Telegram, WhatsApp, Instagram, and Webhooks are instantly normalized into one standardized JSON envelope. Your database never needs separate channel logic.
            </p>

            {/* Visual Animated Pipeline Graphic */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#000000]/90 p-4 font-mono text-xs text-[#a1a1aa]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[#71717a] flex items-center gap-2 font-semibold">
                  <Workflow className="h-4 w-4 text-white" /> Inbound Pipeline Router
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] text-white font-bold border border-white/20">
                  ⚡ 2.1ms Normalized
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                <div className="rounded-lg bg-[#121215] p-2 border border-white/5 text-white/70">Telegram</div>
                <div className="rounded-lg bg-[#121215] p-2 border border-white/5 text-white/70">WhatsApp</div>
                <div className="rounded-lg bg-[#121215] p-2 border border-white/5 text-white/70">Instagram</div>
                <div className="rounded-lg bg-white/10 border border-white/30 p-2 text-white animate-pulse">
                  REVORA CORE
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Sub-second Signed Webhooks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onMouseEnter={playHoverSound}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#09090b] to-[#000000] p-8 shadow-2xl transition hover:border-white/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-[#121215] text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]">
              <Zap className="h-5 w-5" />
            </div>

            <h3 className="mt-6 font-[family-name:var(--font-sora)] text-lg font-bold text-white">
              Signed Webhook Engine
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
              Sub-second message dispatch with cryptographic HMAC signature verification and automatic exponential backoff retry logic.
            </p>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/20 bg-white/5 p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-white" />
                <span className="text-[10px] font-mono text-white/80 font-bold uppercase">Average Latency</span>
              </div>
              <span className="font-mono text-xs font-bold text-white">3.4 ms</span>
            </div>
          </motion.div>

          {/* Card 3: Multi-tenant Data Isolation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            onMouseEnter={playHoverSound}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#09090b] to-[#000000] p-8 shadow-2xl transition hover:border-white/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-[#121215] text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]">
              <Layers className="h-5 w-5" />
            </div>

            <h3 className="mt-6 font-[family-name:var(--font-sora)] text-lg font-bold text-white">
              Multi-Tenant Isolation
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
              Strict tenant boundary enforcement at the database schema level. Customer data for Org A is physically impossible to leak into Org B.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-[#000000] p-3 text-[10px] font-mono text-[#71717a] font-semibold">
              <span className="text-white">tenant_id</span>: &quot;tnt_89a4ff...&quot;
              <br />
              <span className="text-white/60">rls_policy</span>: &quot;STRICT_ISOLATED&quot;
            </div>
          </motion.div>

          {/* Card 4: AI Automation & Bots (2 columns wide) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onMouseEnter={playHoverSound}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#09090b] to-[#000000] p-8 shadow-2xl transition hover:border-white/30 md:col-span-2"
          >
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/[0.02] blur-3xl transition duration-500 group-hover:scale-125" />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-[#121215] text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]">
              <Bot className="h-5 w-5" />
            </div>

            <h3 className="mt-6 font-[family-name:var(--font-sora)] text-2xl font-bold text-white">
              Autonomous AI Copilot Engine
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#a1a1aa]">
              Plug custom LLM agents or rule engines directly into inbound messages. Automatically suggest intelligent replies, extract lead details, and execute workflow triggers.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white">
                <Lock className="h-3.5 w-3.5 text-white" /> Zero Data Retention
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white">
                <Shield className="h-3.5 w-3.5 text-white" /> Custom Prompts
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold text-white">
                Auto-Draft Ready <ArrowRight className="h-3.5 w-3.5 text-white" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
