"use client";

import { useMemo } from "react";
import {
  ArrowRight, ChevronRight, Cloud, Database, Link2, Users,
} from "lucide-react";
import { useListConnections, useListSyncActivity } from "@workspace/api-client-react";
import type { Connection, Provider } from "@workspace/api-client-react";

const providerMeta: Record<Provider, { label: string; description: string }> = {
  instagram: { label: "Instagram", description: "Conversations, leads, and commerce signals from your Instagram presence." },
  whatsapp: { label: "WhatsApp", description: "Keep customer conversations and order intent in one connected stream." },
  website: { label: "Website", description: "Turn site events into a clear picture of the buyer journey." },
  shopify: { label: "Shopify", description: "Orders, customers, and products from your storefront." },
  woocommerce: { label: "WooCommerce", description: "Bring your store revenue into the same operating view." },
  csv: { label: "CSV / XLSX", description: "Import historical revenue data with guided column mapping." },
  manual: { label: "Manual entry", description: "Add a revenue record when it happened outside your connected tools." },
};

function fmtDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function fmtNumber(value?: number) { return new Intl.NumberFormat("en-US").format(value ?? 0); }

function StatusBadge({ status }: { status?: string }) {
  const meta = statusMeta[status ?? "NOT_CONNECTED"] ?? statusMeta.NOT_CONNECTED;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`} data-testid={`status-${status ?? "not-connected"}`}><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>;
}

const statusMeta: Record<string, { label: string; tone: string; dot: string }> = {
  NOT_CONNECTED: { label: "Not configured", tone: "bg-secondary text-secondary-foreground", dot: "bg-muted-foreground" },
  CONNECTING: { label: "Connecting", tone: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  CONNECTED: { label: "Connected", tone: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  SYNCING: { label: "Syncing now", tone: "bg-sky-100 text-sky-800", dot: "bg-sky-500" },
  SYNCED: { label: "Synced", tone: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  ERROR: { label: "Needs attention", tone: "bg-red-100 text-red-800", dot: "bg-red-500" },
  DISCONNECTED: { label: "Disconnected", tone: "bg-secondary text-secondary-foreground", dot: "bg-muted-foreground" },
};

function ConnectionCard({ connection }: { connection: Connection }) {
  const meta = providerMeta[connection.provider];
  return (
    <a href={`/connections/${connection.provider}`} data-testid={`link-provider-${connection.provider}`} className="group block rounded-2xl border border-border/80 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_hsl(164_55%_35%/.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Link2 className="h-5 w-5" />
        </div>
        <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{meta.label}</h3>
          <StatusBadge status={connection.status} />
        </div>
        <p className="mt-1 min-h-8 text-xs leading-relaxed text-muted-foreground">{connection.externalAccountName || connection.description || meta.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-[10px] text-muted-foreground">
        <span>{connection.lastSyncAt ? `Synced ${fmtDate(connection.lastSyncAt)}` : "No sync recorded"}</span>
        <span className="font-medium text-primary">Manage</span>
      </div>
    </a>
  );
}

function SummaryCards({ summary }: { summary: { connected: number; needsAttention: number; lastSynchronization: string | null; customers: number; orders: number } }) {
  const cards = [
    { label: "Channels connected", value: fmtNumber(summary.connected), detail: summary.connected ? "Across your revenue stack" : "Start your network", icon: Link2, color: "text-primary" },
    { label: "Needs attention", value: fmtNumber(summary.needsAttention), detail: summary.needsAttention ? "Review before the next sync" : "Everything looks steady", icon: Users, color: summary.needsAttention ? "text-amber-700" : "text-primary" },
    { label: "Customers in network", value: fmtNumber(summary.customers), detail: "Known customer records", icon: Users, color: "text-sky-700" },
    { label: "Orders captured", value: fmtNumber(summary.orders), detail: summary.lastSynchronization ? `Last sync ${fmtDate(summary.lastSynchronization)}` : "Waiting for first sync", icon: Database, color: "text-violet-700" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <div key={card.label} className={`revora-rise revora-delay-${i + 1} rounded-2xl border border-border/80 bg-card p-4 shadow-[0_8px_30px_hsl(210_25%_25%/.04)]`} data-testid={`card-summary-${i}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="font-mono text-2xl font-bold tracking-[-.06em]">{card.value}</span>
            <span className="text-right text-[10px] leading-tight text-muted-foreground">{card.detail}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConnectionsOverview() {
  const query = useListConnections();
  const activity = useListSyncActivity();
  const overview = query.data;

  if (query.isLoading) {
    return (
      <div className="space-y-9">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-96 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (query.isError || !overview) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 px-6 py-9 text-center">
        <p className="text-sm font-semibold text-red-900">We couldn't load your connections</p>
        <p className="mt-1 text-xs text-red-800/70">The network may be momentarily unavailable. Try again in a moment.</p>
        <button onClick={() => query.refetch()} className="mt-4 rounded-lg bg-red-900 px-3 py-2 text-xs font-semibold text-white" data-testid="button-retry-connections">Retry</button>
      </div>
    );
  }

  const connections = overview.connections ?? [];

  return (
    <div className="space-y-9">
      <div className="revora-rise flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Control room / Connections</p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-.045em] md:text-5xl">Your revenue network<br /><span className="text-muted-foreground/65">starts here.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Connect the places your customers find you. Revora quietly brings the signals together so your next decision has more context.</p>
        </div>
        <a href="/onboarding" data-testid="link-add-channel" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">+ Add a channel</a>
      </div>
      <SummaryCards summary={overview.summary} />
      <div className="grid gap-8 xl:grid-cols-[1.35fr_.65fr]">
        <section>
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Connected channels</p>
            <h2 className="mt-1 font-serif text-2xl tracking-[-.03em] text-foreground md:text-[28px]">The stack, at a glance</h2>
          </div>
          {connections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground"><Cloud className="h-5 w-5" /></div>
              <h3 className="mt-3 text-sm font-semibold">Your network is waiting for its first signal</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">Choose a channel to start building a connected view of your business.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {connections.map(c => <ConnectionCard key={c.id} connection={c} />)}
            </div>
          )}
        </section>
        <section>
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Live trail</p>
            <h2 className="mt-1 font-serif text-2xl tracking-[-.03em] text-foreground md:text-[28px]">Recent activity</h2>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-2">
            {(activity.data ?? overview.activity ?? []).length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground"><Cloud className="h-5 w-5" /></div>
                <h3 className="mt-3 text-sm font-semibold">No sync activity yet</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">Once a channel sends its first signal, the activity trail will appear here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {(activity.data ?? overview.activity ?? []).slice(0, 10).map((item) => (
                  <div key={item.id} className="group flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60" data-testid={`activity-item-${item.id}`}>
                    <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.status === "error" ? "bg-red-100 text-red-700" : item.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold">{item.title}</p>
                        <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{fmtDate(item.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
