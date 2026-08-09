"use client";

import { useState } from "react";
import { Check, Plus, Users, WalletCards, Package } from "lucide-react";
import { Shell } from "./shell";
import { useCreateManualImport } from "@workspace/api-client-react";

export function ManualImport() {
  const create = useCreateManualImport();
  const [form, setForm] = useState({ customer: "", product: "", orderValue: "", channel: "", orderDate: new Date().toISOString().slice(0, 10), status: "paid" });
  const [result, setResult] = useState<ReturnType<typeof useCreateManualImport>["data"]>();
  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); create.mutate({ ...form, orderValue: Number(form.orderValue), status: form.status as "paid" | "pending" | "cancelled" }, { onSuccess: setResult }); };

  if (result) {
    return (
      <Shell>
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Check className="h-6 w-6" /></div>
            <h2 className="mt-5 font-serif text-3xl tracking-[-.04em]">Record added.</h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-card p-4"><Users className="h-4 w-4 text-primary" /><p className="mt-4 font-mono text-xl font-bold tracking-[-.05em]">{result.importedCustomers}</p><p className="mt-1 text-[10px] text-muted-foreground">Customers</p></div>
              <div className="rounded-xl border border-border/70 bg-card p-4"><Package className="h-4 w-4 text-primary" /><p className="mt-4 font-mono text-xl font-bold tracking-[-.05em]">{result.importedOrders}</p><p className="mt-1 text-[10px] text-muted-foreground">Orders</p></div>
              <div className="rounded-xl border border-border/70 bg-card p-4"><WalletCards className="h-4 w-4 text-primary" /><p className="mt-4 font-mono text-xl font-bold tracking-[-.05em]">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.revenue)}</p><p className="mt-1 text-[10px] text-muted-foreground">Revenue</p></div>
            </div>
            <button onClick={() => setResult(undefined)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"><Plus className="h-3.5 w-3.5" />Add another record</button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Data intake / Manual</p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-.045em]">Add one revenue record.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">For the deals that happened in the real world, outside a connected channel.</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-border/80 bg-card p-5 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            {[["customer", "Customer name", "e.g. Taylor Reed"], ["product", "Product or service", "e.g. Brand strategy sprint"], ["orderValue", "Order value", "0.00"], ["channel", "Channel", "e.g. Referral or in-person"]].map(([key, label, placeholder]) => (
              <label key={key} className="text-xs font-semibold">
                {label}
                <input required value={form[key as keyof typeof form]} onChange={e => update(key, e.target.value)} type={key === "orderValue" ? "number" : "text"} min={key === "orderValue" ? "0" : undefined} step={key === "orderValue" ? "0.01" : undefined} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring" data-testid={`input-manual-${key}`} />
              </label>
            ))}
            <label className="text-xs font-semibold">Order date
              <input required value={form.orderDate} onChange={e => update("orderDate", e.target.value)} type="date" className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring" data-testid="input-manual-order-date" />
            </label>
            <label className="text-xs font-semibold">Status
              <select value={form.status} onChange={e => update("status", e.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring" data-testid="input-manual-status">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={create.isPending} className="mt-6 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50" data-testid="button-submit-manual">
            {create.isPending ? "Adding..." : "Add record"}
          </button>
        </form>
      </div>
    </Shell>
  );
}
