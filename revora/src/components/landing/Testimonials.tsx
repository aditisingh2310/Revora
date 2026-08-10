"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageSquare } from "lucide-react";
import { playHoverSound } from "../vfx/SoundEffects";

const quotes = [
  {
    text: "We replaced three separate inbox tabs with Revora in an afternoon. Our reply time dropped from hours to minutes.",
    name: "Sana Malik",
    role: "Head of Support, Bloom & Co.",
    initials: "SM",
  },
  {
    text: "Multi-tenancy was the dealbreaker. We run inboxes for 14 client brands on one backend and never worry about crossover.",
    name: "Diego Fernández",
    role: "CTO, Northwind Agency",
    initials: "DF",
  },
  {
    text: "Self-hosting mattered for compliance. Revora on our own Supabase just worked — no lock-in, no surprises.",
    name: "Hannah Wright",
    role: "Founder, Lumen Health",
    initials: "HW",
  },
];

export function Testimonials() {
  return (
    <section id="customers" className="relative noise px-4 py-28 sm:px-6">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#09090b] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Verified Feedback
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-sora)] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Teams that live in their inbox.
            </h2>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {quotes.map((q) => (
            <motion.blockquote
              key={q.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onMouseEnter={playHoverSound}
              className="rounded-3xl border border-white/10 bg-[#09090b]/80 p-8 backdrop-blur-xl transition hover:border-white/30 hover:shadow-[0_10px_30px_rgba(255,255,255,0.03)]"
            >
              <MessageSquare className="h-5 w-5 text-white/40 mb-4" />
              <p className="text-sm leading-relaxed text-[#a1a1aa] font-medium">“{q.text}”</p>
              <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#121215] text-[10px] font-bold text-white border border-white/15">
                  {q.initials}
                </span>
                <div>
                  <p className="text-xs font-bold text-white">{q.name}</p>
                  <p className="text-[10px] text-[#71717a] font-semibold">{q.role}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
