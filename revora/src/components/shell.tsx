"use client";

import { useState } from "react";
import { Link } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Activity, CircleHelp, Menu, Settings2, Upload, X, Zap,
} from "lucide-react";

function Logo() {
  return (
    <a href="/connections" data-testid="link-logo" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Zap className="h-4 w-4" /></span>
      <span className="font-semibold tracking-[-.04em] text-lg">revora<span className="text-primary">.</span></span>
    </a>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { href: "/connections", label: "Connections", icon: Link },
    { href: "/import/csv", label: "Import data", icon: Upload },
  ];
  return (
    <div className="revora-noise min-h-[100dvh] bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2"><Logo /><button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-sidebar-foreground/60 lg:hidden" data-testid="button-close-menu"><X className="h-4 w-4" /></button></div>
        <div className="mt-10 px-2 text-[10px] font-semibold uppercase tracking-[.2em] text-sidebar-foreground/45">Revenue OS</div>
        <nav className="mt-3 space-y-1">
          {nav.map(item => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${pathname?.startsWith(item.href) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"}`}><item.icon className="h-[17px] w-[17px]" /><span>{item.label}</span>{item.href === "/connections" && <span className="ml-auto rounded-md bg-sidebar-primary/15 px-1.5 py-0.5 text-[10px] text-sidebar-primary">Live</span>}</a>
          ))}
        </nav>
        <div className="mt-8 px-2 text-[10px] font-semibold uppercase tracking-[.2em] text-sidebar-foreground/45">Workspace</div>
        <div className="mt-3 space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground" data-testid="button-settings"><Settings2 className="h-[17px] w-[17px]" />Settings</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground" data-testid="button-help"><CircleHelp className="h-[17px] w-[17px]" />Help center</button>
        </div>
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-3">
          <div className="flex items-center gap-2 text-xs font-medium"><span className="h-2 w-2 rounded-full bg-sidebar-primary revora-pulse" />Network status</div>
          <p className="mt-2 text-[11px] leading-relaxed text-sidebar-foreground/55">Your workspace is ready to collect revenue signals.</p>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-sidebar-border px-2 pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary">AM</div><div className="min-w-0"><p className="truncate text-xs font-medium">Avery Morgan</p><p className="truncate text-[11px] text-sidebar-foreground/45">Merchant workspace</p></div></div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-overlay" />}
      <main className="min-h-[100dvh] lg:pl-[248px]">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-md md:px-8">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-muted lg:hidden" data-testid="button-open-menu"><Menu className="h-5 w-5" /></button>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Live workspace</div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden text-xs text-muted-foreground md:inline">Tuesday, October 22</span><button className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground" data-testid="button-notifications"><Activity className="h-4 w-4" /></button><div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/35 text-xs font-bold text-accent-foreground">AM</div></div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
