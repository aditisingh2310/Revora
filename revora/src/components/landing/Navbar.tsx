"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { playHoverSound, playClickSound } from "../vfx/SoundEffects";

const links = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#how-it-works" },
  { label: "Live Simulator", href: "#product" },
  { label: "Metrics", href: "#stats" },
  { label: "Testimonials", href: "#customers" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#09090b]/90 px-5 py-2.5 backdrop-blur-2xl">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={playClickSound}
          onMouseEnter={playHoverSound}
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white p-[1px] transition group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000000]">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <span className="font-[family-name:var(--font-sora)] text-base font-bold tracking-tight text-white flex items-center gap-2">
            Revora
            <span className="inline-block rounded-full border border-white/20 bg-white/5 px-2 py-0.2 text-[9px] font-bold text-white/60">
              v2.4
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onMouseEnter={playHoverSound}
              onClick={playClickSound}
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:text-white hover:bg-white/10"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/connections"
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="text-xs font-semibold text-white/80 transition hover:text-white px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/connections"
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:scale-[1.03]"
          >
            Get Started
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white md:hidden"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 rounded-3xl border border-white/10 bg-[#09090b]/95 p-6 backdrop-blur-2xl md:hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => {
                    playClickSound();
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2.5 border-t border-white/10 pt-4">
                <Link
                  href="/connections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-white/20 py-2.5 text-sm font-bold text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/connections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-white py-2.5 text-sm font-bold text-black"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
