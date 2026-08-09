import { eq } from "drizzle-orm";
import { db, organizationsTable } from "@workspace/db";
import type { Request } from "express";

const DEVELOPMENT_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000001";

/**
 * Tenant resolution is deliberately server-owned. Until Clerk is configured,
 * local development uses one server-side organization and never accepts an
 * organization id from request params or the browser.
 */
export async function resolveOrganizationId(_req: Request): Promise<string> {
  const organizationId =
    process.env.REVORA_DEMO_ORGANIZATION_ID ?? DEVELOPMENT_ORGANIZATION_ID;

  await db
    .insert(organizationsTable)
    .values({ id: organizationId, name: "Revora workspace" })
    .onConflictDoNothing({ target: organizationsTable.id });

  return organizationId;
}