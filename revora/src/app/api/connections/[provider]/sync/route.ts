import { NextResponse } from "next/server";
import { sqlite } from "@workspace/db";
import { resolveOrganizationId } from "@/lib/tenant";
import { PROVIDERS } from "../../types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  const { provider: raw } = await params;
  if (!PROVIDERS.includes(raw as any)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  const organizationId = await resolveOrganizationId(_request);

  const existingResult = await sqlite.execute({
    sql: "SELECT id FROM connections WHERE organization_id = ? AND provider = ? LIMIT 1",
    args: [organizationId, raw],
  });
  const existing = existingResult.rows[0] as unknown as { id: string } | undefined;

  let connectionId: string;
  if (existing) {
    connectionId = String(existing.id);
  } else {
    const result = await sqlite.execute({
      sql: "INSERT INTO connections (organization_id, provider, status, last_error) VALUES (?, ?, ?, ?)",
      args: [organizationId, raw, "NOT_CONNECTED", "Connect this provider before requesting synchronization."],
    });
    connectionId = String(result.lastInsertRowid);
  }

  const result = await sqlite.execute({
    sql: "INSERT INTO sync_jobs (organization_id, connection_id, status, completed_at, error) VALUES (?, ?, ?, ?, ?)",
    args: [organizationId, connectionId, "FAILED", new Date().toISOString(), "Synchronization is unavailable until official provider credentials are configured."],
  });

  return NextResponse.json({
    id: String(result.lastInsertRowid),
    provider: raw,
    status: "FAILED",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    error: "Synchronization is unavailable until official provider credentials are configured.",
  }, { status: 202 });
}
