"use client";

import { useState } from "react";
import { Check, MessageCircle, Globe2, ShoppingBag, Store, Upload, type LucideIcon } from "lucide-react";
import type { Provider } from "@workspace/api-client-react";

export function Onboarding() {
  const [selected, setSelected] = useState<Provider[]>([]);
  const options: Provider[] = ["instagram", "whatsapp", "website", "shopify", "woocommerce"];
  const meta: Record<Provider, { label: string; description: string; icon: LucideIcon }> = {
    instagram: { label: "Instagram", description: "Conversations, leads, and commerce signals from your Instagram presence.", icon: MessageCircle },
    whatsapp: { label: "WhatsApp", description: "Keep customer conversations and order intent in one connected stream.", icon: MessageCircle },
    website: { label: "Website", description: "Turn site events into a clear picture of the buyer journey.", icon: Globe2 },
    shopify: { label: "Shopify", description: "Orders, customers, and products from your storefront.", icon: ShoppingBag },
    woocommerce: { label: "WooCommerce", description: "Bring your store revenue into the same operating view.", icon: Store },
    csv: { label: "CSV / XLSX", description: "Import historical revenue data with guided column mapping.", icon: Upload },
    manual: { label: "Manual entry", description: "Add a revenue record when it happened outside your connected tools.", icon: Check },
  };

  return (
    <div className="mx-auto max-w-5xl py-6 md:py-12">
      <a href="/connections" data-testid="link-onboarding-logo" className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Check className="h-4 w-4" /></span>
        <span className="font-semibold tracking-[-.04em] text-lg">revora<span className="text-primary">.</span></span>
      </a>
      <div className="mt-14 max-w-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Start with your channels</p>
        <h1 className="mt-3 font-serif text-5xl tracking-[-.05em] md:text-6xl">Where does your<br /><span className="text-muted-foreground/65">business happen?</span></h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">Pick the channels you sell through. You can add more later, and nothing is connected until you approve the provider flow.</p>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map(provider => {
          const item = meta[provider];
          const Icon = item.icon;
          const active = selected.includes(provider);
          return (
            <button key={provider} onClick={() => setSelected(s => active ? s.filter(p => p !== provider) : [...s, provider])} className={`group relative rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 ${active ? "border-primary bg-primary/[.06] shadow-[0_8px_25px_hsl(164_55%_35%/.11)]" : "border-border bg-card hover:border-primary/35"}`} data-testid={`button-channel-${provider}`}>
              <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border border-border">{active && <Check className="h-3.5 w-3.5 text-primary" />}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-5 text-sm font-semibold">{item.label}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </button>
          );
        })}
        <a href="/import/csv" data-testid="link-onboarding-import" className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-left transition-colors hover:border-primary/40">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground"><Upload className="h-5 w-5" /></span>
          <h2 className="mt-5 text-sm font-semibold">I have a data file</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Import customers and orders from a CSV or XLSX file.</p>
        </a>
      </div>
      <div className="mt-8 flex gap-3">
        <a href="/connections" className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:border-primary/40">Skip for now</a>
        <a href="/connections" className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-primary-foreground ${selected.length > 0 ? "bg-primary" : "bg-primary/50 pointer-events-none"}`}>
          Continue{selected.length > 0 ? ` (${selected.length})` : ""}
        </a>
      </div>
    </div>
  );
}
