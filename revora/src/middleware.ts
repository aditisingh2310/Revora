import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Refreshes the Supabase session cookie and gates app routes:
// logged-out visitors on app pages -> /auth, logged-in users on /auth -> /connections.
// Webhook/API routes are intentionally NOT matched (no session there).
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/auth" || pathname.startsWith("/auth/");
  const isCallback = pathname === "/auth/callback";

  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (user && isAuthPage && !isCallback) {
    return NextResponse.redirect(new URL("/connections", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/connections/:path*", "/import/:path*", "/onboarding/:path*", "/auth/:path*"],
};
