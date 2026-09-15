import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthVisual } from "@/components/auth/auth-visual";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in — Revora",
  description: "Sign in or create your Revora workspace.",
};

export default async function AuthPage() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/connections");
  } catch {
    // Env not configured — render the form anyway (it will surface the error).
  }

  return (
    <main className="grid min-h-screen bg-black lg:grid-cols-2">
      {/* Form half */}
      <section className="noise relative flex items-center justify-center overflow-hidden px-6 py-14 sm:px-12">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute left-1/2 top-[-25%] h-[380px] w-[560px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[130px]" />
        <div className="relative z-10 flex w-full justify-center">
          <Suspense>
            <AuthForm />
          </Suspense>
        </div>
      </section>

      {/* Visual half */}
      <section className="relative hidden min-h-screen border-l border-white/10 lg:block">
        <AuthVisual />
      </section>
    </main>
  );
}
