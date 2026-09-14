import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureProfileForCurrentUser } from "@/lib/auth/actions";

// Handles email-verification / magic links: exchanges the code for a session,
// ensures the workspace exists, then lands in the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const response = NextResponse.redirect(`${origin}/connections`);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll: () =>
            request.headers
              .get("cookie")
              ?.split(";")
              .map((c) => {
                const [name, ...rest] = c.trim().split("=");
                return { name, value: decodeURIComponent(rest.join("=")) };
              }) ?? [],
          setAll: (cookiesToSet) => {
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      },
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        await ensureProfileForCurrentUser();
      } catch (err) {
        console.error("[auth] callback profile setup failed", err);
      }
      return response;
    }
    console.error("[auth] code exchange failed", error);
  }
  return NextResponse.redirect(`${origin}/auth?error=link-expired`);
}
