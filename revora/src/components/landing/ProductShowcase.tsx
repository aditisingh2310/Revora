"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot, CheckCheck, Filter, Sparkles, ShieldCheck } from "lucide-react";
import { playHoverSound, playClickSound, playSwitchSound } from "../vfx/SoundEffects";

interface Message {
  id: string;
  sender: "customer" | "team" | "bot";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  channel: "Telegram" | "WhatsApp" | "Instagram" | "Webhook";
  unread: boolean;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: "1",
    name: "Priya Nair",
    avatar: "PN",
    channel: "Telegram",
    unread: true,
    messages: [
      { id: "m1", sender: "customer", text: "Hey! Is the summer collection still available? 🌿", time: "10:42 AM" },
      { id: "m2", sender: "bot", text: "⚡ AI Router: Resolving tenant stock... [14 Units Available]", time: "10:42 AM" },
      { id: "m3", sender: "team", text: "Hi Priya! Yes, 14 items left. I can hold one for you right now.", time: "10:43 AM" },
    ],
  },
  {
    id: "2",
    name: "Marco Rossi",
    avatar: "MR",
    channel: "Instagram",
    unread: false,
    messages: [
      { id: "m1", sender: "customer", text: "Loved the last order 🙌 Can I upgrade my API access?", time: "09:15 AM" },
      { id: "m2", sender: "team", text: "Hey Marco! Upgraded your tenant key to Enterprise tier.", time: "09:20 AM" },
    ],
  },
  {
    id: "3",
    name: "Aisha Khan",
    avatar: "AK",
    channel: "WhatsApp",
    unread: true,
    messages: [
      { id: "m1", sender: "customer", text: "When does order #REV-8924 ship out?", time: "08:30 AM" },
      { id: "m2", sender: "bot", text: "⚡ AI Router: Order dispatched via FedEx Express · ID: #8924-FX", time: "08:31 AM" },
    ],
  },
  {
    id: "4",
    name: "Stripe Webhook Node",
    avatar: "SW",
    channel: "Webhook",
    unread: false,
    messages: [
      { id: "m1", sender: "customer", text: "evt_payment_intent_succeeded: $1,450.00 ARR Subscribed", time: "08:00 AM" },
      { id: "m2", sender: "bot", text: "⚡ System Trigger: Tenant Provisioning Completed in 14ms", time: "08:00 AM" },
    ],
  },
];

export function ProductShowcase() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string>("1");
  const [inputText, setInputText] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");

  const activeConv = conversations.find((c) => c.id === activeId) || conversations[0];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    playClickSound();

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "team",
      text: inputText,
      time: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], unread: false }
          : c
      )
    );
    setInputText("");
  };

  const handleQuickReply = (text: string) => {
    playClickSound();
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "team",
      text: text,
      time: "Just now",
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], unread: false }
          : c
      )
    );
  };

  const filteredConversations = selectedChannel === "All"
    ? conversations
    : conversations.filter((c) => c.channel === selectedChannel);

  return (
    <section id="product" className="relative noise px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#09090b] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            Interactive Workspace Simulator
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            One unified inbox. <br />
            <span className="text-monochrome-gradient">Absolute context simplicity.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#a1a1aa] font-medium sm:text-base">
            Review the real-time normalized message flow. Test replies, toggle tenant channels, and inspect bot triggers on the interactive console.
          </p>
        </motion.div>
      </div>

      {/* Full-Width Simulator Interface Container */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-[#09090b] backdrop-blur-xl overflow-hidden shadow-2xl"
      >
        {/* Top Header Window Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#121215]/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-white/20" />
            <div className="h-3 w-3 rounded-full bg-white/40" />
            <div className="h-3 w-3 rounded-full bg-white" />
            <span className="ml-2 text-[10px] font-mono text-[#a1a1aa] flex items-center gap-1.5 font-semibold sm:text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
              console://live-inbox-router.revora
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              Socket Active
            </span>
          </div>
        </div>

        {/* Top Channel Filter Bar & Conversation Selectors */}
        <div className="border-b border-white/10 bg-[#000000] p-3">
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 sm:pb-0">
            {/* Channel Filters */}
            <div className="flex items-center gap-1 shrink-0">
              <Filter className="h-3.5 w-3.5 text-[#71717a] mr-1" />
              {["All", "Telegram", "WhatsApp", "Instagram"].map((ch) => (
                <button
                  key={ch}
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playSwitchSound();
                    setSelectedChannel(ch);
                  }}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold transition shrink-0 ${
                    selectedChannel === ch
                      ? "bg-white text-black font-extrabold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Conversation Selector Pills */}
            <div className="flex items-center gap-2 shrink-0">
              {filteredConversations.map((c) => (
                <button
                  key={c.id}
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playSwitchSound();
                    setActiveId(c.id);
                    setConversations((prev) =>
                      prev.map((item) => (item.id === c.id ? { ...item, unread: false } : item))
                    );
                  }}
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold transition border ${
                    activeId === c.id
                      ? "border-white bg-white/10 text-white"
                      : "border-white/10 bg-[#121215] text-white/60 hover:text-white"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a1f] text-[9px] font-bold border border-white/10">
                    {c.avatar}
                  </span>
                  <span>{c.name.split(" ")[0]}</span>
                  {c.unread && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full-Width Conversation Console */}
        <div className="flex flex-col bg-[#09090b] min-h-[380px]">
          {/* Active Conversation Sub-header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 bg-[#121215]/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white border border-white/10">
                {activeConv.avatar}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{activeConv.name}</h3>
                <p className="text-[10px] text-white/60 flex items-center gap-1 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Channel: {activeConv.channel}
                </p>
              </div>
            </div>

            {/* Quick AI Response Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] text-[#71717a] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Bot className="h-3.5 w-3.5 text-white" /> AI Pilot:
              </span>
              <button
                onClick={() => handleQuickReply("Your order #REV-8924 has been verified.")}
                onMouseEnter={playHoverSound}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-bold text-white hover:bg-white hover:text-black transition"
              >
                Verify Order
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {activeConv.messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "team" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.sender === "team"
                      ? "bg-white text-black font-semibold rounded-br-none"
                      : m.sender === "bot"
                      ? "bg-[#121215] border border-white/25 text-white font-mono rounded-tl-none"
                      : "bg-[#121215] border border-white/10 text-white rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-1 text-[9px] text-[#71717a] flex items-center gap-1 px-1 font-semibold">
                  {m.time}
                  {m.sender === "team" && <CheckCheck className="h-3 w-3 text-white" />}
                </span>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="border-t border-white/10 p-4 bg-[#121215]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Send direct reply to ${activeConv.name}...`}
                className="flex-1 rounded-full border border-white/10 bg-[#000000] px-4 py-2.5 text-xs text-white placeholder-[#71717a] focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              />
              <button
                type="submit"
                onMouseEnter={playHoverSound}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
