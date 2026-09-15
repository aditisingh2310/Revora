"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureProfileForCurrentUser } from "@/lib/auth/actions";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type Values = z.infer<typeof schema>;
type Mode = "login" | "signup";

function friendlyError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Wrong email or password. Try again.";
  if (/user already registered|already exists/i.test(message))
    return "That email already has an account — sign in instead.";
  if (/password.*weak|password should/i.test(message)) return "Pick a stronger password (8+ characters).";
  if (/rate limit|too many/i.test(message)) return "Too many attempts — wait a minute and retry.";
  return "Something went wrong. Please try again.";
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const linkExpired = searchParams.get("error") === "link-expired";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) throw error;
        await ensureProfileForCurrentUser();
        router.push("/connections");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          await ensureProfileForCurrentUser();
          router.push("/connections");
          router.refresh();
        } else {
          setCheckEmail(values.email);
        }
      }
    } catch (err) {
      toast.error(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setBusy(false);
    }
  }

  if (checkEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
          <MailCheck className="h-6 w-6 text-white" />
        </div>
        <h1 className="mt-6 font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-white">
          Check your inbox
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
          We sent a confirmation link to <span className="text-white">{checkEmail}</span>.
          Click it and you&apos;ll land straight in your workspace.
        </p>
        <button
          onClick={() => {
            setCheckEmail(null);
            setMode("login");
          }}
          className="mt-8 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          Back to sign in
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-xs font-semibold text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
        Back home
      </Link>

      <div className="mt-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-[1px]">
          <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-black">
            <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
          </div>
        </div>
        <span className="font-[family-name:var(--font-sora)] text-lg font-bold tracking-tight text-white">
          Revora
        </span>
      </div>

      <h1 className="mt-8 font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {mode === "login" ? (
          <>
            Welcome <span className="text-monochrome-gradient">back.</span>
          </>
        ) : (
          <>
            Claim your <span className="text-monochrome-gradient">workspace.</span>
          </>
        )}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
        {mode === "login"
          ? "Sign in to route every customer conversation from one inbox."
          : "One account, one workspace. Scales from side-project to millions of messages."}
      </p>

      {linkExpired && (
        <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/80">
          That confirmation link expired — sign in or request a new one below.
        </div>
      )}

      {/* Mode toggle */}
      <div className="mt-7 grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-bold">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`relative rounded-full py-2 transition ${
              mode === m ? "text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {mode === m && (
              <motion.span
                layoutId="auth-mode-pill"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{m === "login" ? "Sign in" : "Sign up"}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-white/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register("email")}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-white/10"
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-white/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              {...register("password")}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-white/10"
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </motion.form>
      </AnimatePresence>

      <p className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold text-white/40">
        <ShieldCheck className="h-3.5 w-3.5" />
        Sessions are per-user and isolated to your workspace.
      </p>
    </div>
  );
}
