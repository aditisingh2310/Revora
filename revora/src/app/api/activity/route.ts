import { NextResponse } from "next/server";
import { sqlite } from "@workspace/db";
import { resolveOrganizationId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const organizationId = await resolveOrganizationId(request);
  const result = await sqlite.execute({
    sql: `SELECT s.id, c.provider, s.status, s.error, s.created_at, s.completed_at
          FROM sync_jobs s
          INNER JOIN connections c ON s.connection_id = c.id
          WHERE s.organization_id = ?
          ORDER BY s.created_at DESC
          LIMIT 12`,
    args: [organizationId],
  });

  const activity = result.rows.map(job => ({
    id: String(job.id),
    provider: String(job.provider),
    title: job.status === "FAILED" ? "Synchronization needs attention" : job.status === "SUCCEEDED" ? "Synchronization completed" : "Synchronization requested",
    detail: job.error ? String(job.error) : `Sync job is ${String(job.status).toLowerCase()}.`,
    status: job.status === "FAILED" ? "error" : "info",
    createdAt: new Date(String(job.created_at)).toISOString(),
  }));

  return NextResponse.json(activity);
}
