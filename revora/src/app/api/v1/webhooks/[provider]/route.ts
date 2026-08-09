import { NextResponse } from "next/server";
import { PROVIDERS } from "../../../connections/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  const provider = Array.isArray(raw) ? raw[0] : raw;
  if (!PROVIDERS.includes(provider as any)) {
    return NextResponse.json({ error: "Unknown webhook provider." }, { status: 404 });
  }
  return NextResponse.json({ error: "Webhook verification is not configured for this provider." }, { status: 501 });
}
