"use client";

import { motion } from "framer-motion";
import { Plug, GitBranch, Reply, Sparkles } from "lucide-react";
import { playHoverSound } from "../vfx/SoundEffects";

const steps = [
  {
    icon: Plug,
    step: "01",
    title: "Connect Channel Token",
    body: "Paste your Telegram bot token or WhatsApp webhook URL. Revora verifies connection signature instantly.",
    code: "REVORA_TELEGRAM_TOKEN=84920... [VERIFIED]",
  },
  {
    icon: GitBranch,
    step: "02",
    title: "Instant Normalization",
    body: "Inbound messages are securely isolated, stamped with tenant metadata, and converted to standardized JSON.",
    code: "REVORA_SCHEMA => { tenant: 'org_892', payload: '...' }",
  },
  {
    icon: Reply,
    step: "03",
    title: "Dispatch & Automate",
    body: "Respond from the unified dashboard or trigger automated AI copilot flows seamlessly with < 3.4ms latency.",
    code: "OUTBOUND_DISPATCH => OK 200 (Sent in 1.4ms)",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative noise border-y border-white/10 bg-[#000000] px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#09090b] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Deployment Pipeline
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-sora)] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              From webhook payload to response in <br />
              <span className="text-monochrome-gradient">three clean steps.</span>
            </h2>
          </motion.div>
        </div>

        {/* Step Cards with Monochrome Connecting Line */}
        <div className="relative mt-20">
          <div className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 lg:block bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60 shadow-[0_0_15px_rgba(255,255,255,0.2)]" />

          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  onMouseEnter={playHoverSound}
                  className="group relative rounded-3xl border border-white/10 bg-[#09090b]/90 p-8 backdrop-blur-xl transition duration-300 hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-[#121215] text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-white/30 group-hover:text-white transition">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="mt-6 font-[family-name:var(--font-sora)] text-lg font-bold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
                    {s.body}
                  </p>

                  <div className="mt-6 rounded-xl border border-white/10 bg-[#000000] p-3 font-mono text-[10px] text-white/80 font-semibold">
                    {s.code}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
