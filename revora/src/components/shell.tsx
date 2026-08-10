"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, CircleHelp, Menu, Settings2, Upload, X, Zap, Link as LinkIcon,
} from "lucide-react";
import { playClickSound, playHoverSound } from "./vfx/SoundEffects";

function Logo() {
  return (
    <Link href="/" onMouseEnter={playHoverSound} onClick={playClickSound} className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-[1px]">
        <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000000]">
          <Zap className="h-4 w-4 text-white" />
        </div>
      </div>
      <span className="font-[family-name:var(--font-sora)] text-base font-bold tracking-tight text-white flex items-center gap-1.5">
        Revora
        <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.2 text-[9px] font-bold text-white/60">
          v2.4
        </span>
      </span>
    </Link>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nav = [
    { href: "/connections", label: "Connections", icon: LinkIcon },
    { href: "/import/csv", label: "Import Data", icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black antialiased">
      {/* Sleek Full-Width Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/90 px-4 py-3 backdrop-blur-2xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-2 md:flex">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={playHoverSound}
                    onClick={playClickSound}
                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Workspace Info & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-xs font-semibold text-white/80 sm:flex">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              Live Workspace
            </div>

            <div className="hidden h-4 w-px bg-white/10 sm:block" />

            <div className="hidden items-center gap-3 sm:flex">
              <button
                onMouseEnter={playHoverSound}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white transition"
                title="Activity Notifications"
              >
                <Activity className="h-4 w-4" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                AM
              </div>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white md:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mt-3 border-t border-white/10 pt-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                      isActive ? "bg-white text-black" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Full-Width Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
