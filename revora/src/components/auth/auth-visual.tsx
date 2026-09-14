"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, Send } from "lucide-react";

// IMAGE SLOT: drop the artwork at revora/public/auth-side.jpg and flip this
// to true — the image renders beneath the glow/grid/glass overlays, zero other
// changes needed. Until then the pure-vfx panel below carries the visual.
const SHOW_IMAGE = false;

const messages = [
  { from: "Telegram", text: "Where's my order #4821?", time: "now", me: false },
  { from: "Revora AI", text: "On the van — arriving today by 6pm.", time: "now", me: true },
  { from: "WhatsApp", text: "Do you offer refunds?", time: "2m", me: false },
];

export function AuthVisual() {
  return (
    <div className="noise relative h-full w-full overflow-hidden bg-black">
      {SHOW_IMAGE && (
        <Image
          src="/auth-side.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-70"
        />
      )}
      {/* Backdrop layers */}
      <div className="absolute inset-0 grid-pattern opacity-70" />
      <div className="absolute left-1/2 top-[-20%] h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-white/[0.08] blur-[130px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[320px] w-[320px] rounded-full bg-white/[0.05] blur-[110px]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Floating inbox mock */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <div className="h-2 w-2 animate-pulse rounded-full bg-black" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Unified inbox</p>
                <p className="flex items-center gap-1 text-[10px] font-semibold text-white/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live pipeline
                </p>
              </div>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/70">
              3 channels
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.me ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.22, duration: 0.45 }}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  m.me
                    ? "ml-auto rounded-br-md bg-white text-black"
                    : "rounded-bl-md border border-white/10 bg-white/5 text-white"
                }`}
              >
                <p className={`text-[10px] font-bold ${m.me ? "text-black/50" : "text-white/50"}`}>
                  {m.from} • {m.time}
                </p>
                <p className="mt-0.5 text-xs font-medium leading-relaxed">{m.text}</p>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-2 rounded-2xl border border-dashed border-white/15 px-3.5 py-2.5 text-[11px] font-semibold text-white/50"
            >
              <Send className="h-3 w-3" />
              Agent drafting reply…
            </motion.div>
          </div>
        </motion.div>

        {/* Stat chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-[10px] font-bold text-white/80"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-md">
            <Zap className="h-3 w-3 text-white" /> &lt;3.4ms routing
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 text-white" /> HMAC-signed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-md">
            <Activity className="h-3 w-3 text-white" /> Per-user isolation
          </span>
        </motion.div>
      </div>

      {/* Bottom headline */}
      <div className="absolute inset-x-0 bottom-0 p-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="font-[family-name:var(--font-sora)] text-2xl font-extrabold leading-tight tracking-tight text-white"
        >
          Every customer conversation,
          <br />
          <span className="text-monochrome-gradient">unified in real-time.</span>
        </motion.p>
      </div>
    </div>
  );
}
