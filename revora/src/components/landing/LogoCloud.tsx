"use client";

import { Send, MessageCircle, Instagram, MessagesSquare, Mail, Globe, Smartphone, Bell } from "lucide-react";
import { Reveal } from "./anim";

const channels = [
  { name: "Telegram", icon: Send },
  { name: "WhatsApp", icon: MessageCircle },
  { name: "Instagram", icon: Instagram },
  { name: "Messenger", icon: MessagesSquare },
  { name: "Email", icon: Mail },
  { name: "Web Chat", icon: Globe },
  { name: "SMS", icon: Smartphone },
  { name: "Slack", icon: Bell },
];

export function LogoCloud() {
  return (
    <section className="border-y border-edge bg-surface-0 py-12">
      <Reveal className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm font-medium uppercase tracking-[0.18em] text-text-3">
          One inbox for every channel your customers use
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className="flex items-center gap-2 rounded-full border border-edge bg-surface-1 px-4 py-2 text-text-2 transition hover:border-edge-strong hover:text-text-1"
              >
                <Icon className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">{c.name}</span>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
