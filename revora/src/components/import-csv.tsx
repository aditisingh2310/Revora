"use client";

import { useState } from "react";
import { Check, Download, FileSpreadsheet, Plus, Upload, Users, WalletCards, Package } from "lucide-react";
import { Shell } from "./shell";
import { useImportCsvRows } from "@workspace/api-client-react";

type ImportRow = Record<string, unknown>;

export function ImportCsv() {
  const importRows = useImportCsvRows();
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof useImportCsvRows>["data"]>();
  const fields = ["customer", "product", "orderValue", "channel", "orderDate", "status"];
  const columns = rows.length ? Object.keys(rows[0]) : ["Customer", "Product", "Order value", "Channel", "Order date", "Status"];

  const parseFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = String(event.target?.result ?? "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length) {
        const headers = lines[0].split(",").map(s => s.trim());
        const parsed = lines.slice(1, 7).map(line => {
          const values = line.split(",");
          return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? ""]));
        });
        setRows(parsed);
        setMapping(Object.fromEntries(fields.map(field => [field, headers.find(h => h.toLowerCase().replace(/[^a-z]/g, '').includes(field.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5))) ?? headers[0] ?? ""])));
      }
    };
    reader.readAsText(file);
    setStep(1);
  };

  const submit = () => importRows.mutate({ rows: rows, mappings: mapping }, { onSuccess: data => { setResult(data); setStep(3); } });

  if (result) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl">
          <ImportComplete result={result} onReset={() => { setResult(undefined); setStep(0); setFileName(""); setRows([]); }} />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Data intake / Import</p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-.045em]">Bring history into focus.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">A guided import for the revenue that lives outside your connected channels.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-muted/70 p-1 sm:max-w-2xl">
          {["Upload", "Map columns", "Review", "Complete"].map((label, i) => (
            <div key={label} className={`flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold sm:px-3 ${step === i ? "bg-card text-foreground shadow-sm" : step > i ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${step > i ? "bg-primary text-primary-foreground" : step === i ? "bg-primary/15 text-primary" : "bg-background text-muted-foreground"}`}>{step > i ? <Check className="h-3 w-3" /> : i + 1}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
        {step === 0 && (
          <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/[.035] p-8 text-center transition-colors hover:bg-primary/[.07]" data-testid="dropzone-csv">
            <input type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={e => e.target.files?.[0] && parseFile(e.target.files[0])} data-testid="input-csv-file" />
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileSpreadsheet className="h-7 w-7" /></span>
            <h2 className="mt-5 text-sm font-semibold">Drop a CSV or XLSX file here</h2>
            <p className="mt-1 text-xs text-muted-foreground">or click to browse from your computer</p>
            <span className="mt-5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Choose file</span>
          </label>
        )}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">{rows.length} preview rows</p>
              </div>
              <button onClick={() => setStep(2)} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Continue</button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>{columns.map(col => <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>)}</tr>
                </thead>
                <tbody>{rows.map((row, i) => <tr key={i} className="border-t border-border">{columns.map(col => <td key={col} className="px-3 py-2">{String(row[col] ?? "")}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold">Map your columns</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map(field => (
                <label key={field} className="text-xs font-semibold">
                  {field}
                  <select value={mapping[field] ?? ""} onChange={e => setMapping(m => ({ ...m, [field]: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Skip column</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <button onClick={submit} disabled={importRows.isPending} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">
              {importRows.isPending ? "Importing..." : "Import data"}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function ImportComplete({ result, onReset }: { result: NonNullable<ReturnType<typeof useImportCsvRows>["data"]>; onReset: () => void }) {
  const downloadErrors = () => {
    const content = ["Row,Message", ...(result.errors ?? []).map(error => `${error.row},"${error.message.replaceAll('"', '""')}"`)].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "revora-import-errors.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-9">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Check className="h-6 w-6" /></div>
      <h2 className="mt-5 font-serif text-3xl tracking-[-.04em]">Import reviewed.</h2>
      <p className="mt-2 text-sm text-muted-foreground">The API returned the result below. Your successful records are now part of the revenue network.</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card p-4"><Users className="h-4 w-4 text-primary" /><p className="mt-4 font-mono text-xl font-bold tracking-[-.05em]">{result.importedCustomers}</p><p className="mt-1 text-[10px] text-muted-foreground">Customers imported</p></div>
        <div className="rounded-xl border border-border/70 bg-card p-4"><Package className="h-4 w-4 text-primary" /><p className="mt-4 font-mono text-xl font-bold tracking-[-.05em]">{result.importedOrders}</p><p className="mt-1 text-[10px] text-muted-foreground">Orders imported</p></div>
        <div className="rounded-xl border border-border/70 bg-card p-4"><WalletCards className="h-4 w-4 text-primary" /><p className="mt-4 font-mono text-xl font-bold tracking-[-.05em]">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(result.revenue)}</p><p className="mt-1 text-[10px] text-muted-foreground">Revenue imported</p></div>
      </div>
      {result.failedRows > 0 && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div><p className="text-xs font-semibold text-amber-900">{result.failedRows} row{result.failedRows === 1 ? "" : "s"} need attention</p><p className="mt-1 text-[10px] text-amber-800/70">Download the report, fix the source file, and import again.</p></div>
          <button onClick={downloadErrors} className="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-[10px] font-semibold text-amber-900" data-testid="button-download-errors"><Download className="h-3.5 w-3.5" />Error report</button>
        </div>
      )}
      <button onClick={onReset} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground" data-testid="button-new-import"><Plus className="h-3.5 w-3.5" />Import another file</button>
    </div>
  );
}
