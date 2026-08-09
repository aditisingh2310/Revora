import { NextResponse } from "next/server";
import { resolveOrganizationId } from "@/lib/tenant";
import { importNormalizedRows, normalizeRevenueRow } from "@/lib/revenue-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.rows || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: "rows array is required" }, { status: 400 });
  }
  const organizationId = await resolveOrganizationId(request);
  const rows = body.rows.map((row: Record<string, unknown>) => normalizeRevenueRow(row, body.mappings ?? {}));
  const summary = await importNormalizedRows(organizationId, rows, "csv");
  return NextResponse.json(summary, { status: 201 });
}
