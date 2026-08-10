import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Customers", href: "#customers" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Open app", href: "/connections" },
      { label: "Webhooks", href: "#how-it-works" },
      { label: "Self-hosting", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Customers", href: "#customers" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#000000] px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000000]">
                <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
            </div>
            <span className="font-[family-name:var(--font-sora)] text-base font-bold tracking-tight text-white">
              Revora
            </span>
          </div>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-[#a1a1aa] font-semibold">
            One inbox for every customer conversation. Multi-tenant, real-time, and
            built to self-host with zero configuration leakage.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-xs font-semibold text-[#71717a] transition hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[11px] font-bold text-[#71717a] sm:flex-row">
        <p>© {new Date().getFullYear()} Revora. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="transition hover:text-white">Privacy Policy</a>
          <a href="#" className="transition hover:text-white">Terms of Service</a>
          <a href="#" className="transition hover:text-white">Security Matrix</a>
        </div>
      </div>
    </footer>
  );
}
