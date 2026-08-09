"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useGetConnection, useStartConnection, useDisconnectConnection, useSyncConnection, useConfigureWebsiteConnection } from "@workspace/api-client-react";
import type { Provider } from "@workspace/api-client-react";

const providerMeta: Record<string, { label: string; description: string }> = {
  instagram: { label: "Instagram", description: "Conversations, leads, and commerce signals from your Instagram presence." },
  whatsapp: { label: "WhatsApp", description: "Keep customer conversations and order intent in one connected stream." },
  website: { label: "Website", description: "Turn site events into a clear picture of the buyer journey." },
  shopify: { label: "Shopify", description: "Orders, customers, and products from your storefront." },
  woocommerce: { label: "WooCommerce", description: "Bring your store revenue into the same operating view." },
  csv: { label: "CSV / XLSX", description: "Import historical revenue data with guided column mapping." },
  manual: { label: "Manual entry", description: "Add a revenue record when it happened outside your connected tools." },
};

const statusMeta: Record<string, { label: string; tone: string; dot: string }> = {
  NOT_CONNECTED: { label: "Not configured", tone: "bg-secondary text-secondary-foreground", dot: "bg-muted-foreground" },
  CONNECTING: { label: "Connecting", tone: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  CONNECTED: { label: "Connected", tone: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  SYNCING: { label: "Syncing now", tone: "bg-sky-100 text-sky-800", dot: "bg-sky-500" },
  SYNCED: { label: "Synced", tone: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  ERROR: { label: "Needs attention", tone: "bg-red-100 text-red-800", dot: "bg-red-500" },
  DISCONNECTED: { label: "Disconnected", tone: "bg-secondary text-secondary-foreground", dot: "bg-muted-foreground" },
};

function StatusBadge({ status }: { status?: string }) {
  const meta = statusMeta[status ?? "NOT_CONNECTED"] ?? statusMeta.NOT_CONNECTED;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`} data-testid={`status-${status ?? "not-connected"}`}><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>;
}

export function ProviderDetail({ provider: providerKey }: { provider: string }) {
  const provider = providerKey as Provider;
  const meta = providerMeta[provider] ?? providerMeta.website;
  const query = useGetConnection(provider);
  const start = useStartConnection();
  const disconnect = useDisconnectConnection();
  const sync = useSyncConnection();
  const configure = useConfigureWebsiteConnection();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const detail = query.data;
  const connection = detail?.connection;

  if (query.isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 w-96 animate-pulse rounded-lg bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (query.isError || !detail) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 px-6 py-9 text-center">
        <p className="text-sm font-semibold text-red-900">We couldn't load this provider</p>
        <button onClick={() => query.refetch()} className="mt-4 rounded-lg bg-red-900 px-3 py-2 text-xs font-semibold text-white">Retry</button>
      </div>
    );
  }

  const requiresSetup = !connection || ["NOT_CONNECTED", "DISCONNECTED"].includes(connection.status);

  return (
    <div className="space-y-8">
      <a href="/connections" data-testid="link-back-connections" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />All connections</a>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Provider detail</p>
          <h1 className="mt-1 font-serif text-4xl tracking-[-.045em]">{meta.label}</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{connection?.description || meta.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {connection && !requiresSetup && (
            <button onClick={() => sync.mutate({ provider })} disabled={sync.isPending} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:border-primary/40 disabled:opacity-50" data-testid="button-sync-provider">
              {sync.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Sync now
            </button>
          )}
          {connection && !requiresSetup && (
            <button onClick={() => disconnect.mutate({ provider })} disabled={disconnect.isPending} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50" data-testid="button-disconnect-provider">Disconnect</button>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-border/80 bg-card p-5 md:p-6">
        <StatusBadge status={connection?.status} />
        <h2 className="mt-3 text-lg font-semibold">{requiresSetup ? "Connection required" : connection?.externalAccountName || "Account configured"}</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
          {requiresSetup ? `Connect ${meta.label} to start capturing revenue signals from this channel.` : `This channel is part of your revenue network.`}
        </p>
        {requiresSetup && (
          <button onClick={() => start.mutate({ provider })} disabled={start.isPending} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50">
            {start.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Configure connection
          </button>
        )}
      </div>
      {provider === "website" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 md:p-6">
          <h3 className="text-sm font-semibold">Website configuration</h3>
          <p className="mt-1 text-xs text-muted-foreground">Enter your website URL to prepare the Revora tracking widget.</p>
          <div className="mt-4 flex gap-2">
            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://your-website.com" className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={() => configure.mutate({ provider: "website", websiteUrl })} disabled={configure.isPending || !websiteUrl} className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
