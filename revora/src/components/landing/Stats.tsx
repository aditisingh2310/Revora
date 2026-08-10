"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const stats = [
  { value: 3.4, decimals: 1, suffix: "ms", label: "Average pipeline latency" },
  { value: 8, suffix: "+", label: "Messaging adapter nodes" },
  { value: 100, suffix: "%", label: "Tenant data sandboxing" },
  { value: 99.99, decimals: 2, suffix: "%", label: "Production router uptime" },
];

export function Stats() {
  return (
    <section id="stats" className="border-y border-white/10 bg-[#000000] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4 shadow-2xl">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#09090b] px-6 py-12 text-center transition hover:bg-[#121215]">
              <div className="font-[family-name:var(--font-sora)] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <p className="mt-3 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
