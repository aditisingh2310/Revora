import { sqlite, ensureSchema } from "@workspace/db";

const DEVELOPMENT_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000001";

let initialized = false;

export async function resolveOrganizationId(_request: Request): Promise<string> {
  const organizationId =
    process.env.REVORA_DEMO_ORGANIZATION_ID ?? DEVELOPMENT_ORGANIZATION_ID;

  if (!initialized) {
    ensureSchema();
    initialized = true;
  }

  await sqlite.execute({
    sql: "INSERT OR IGNORE INTO organizations (id, name) VALUES (?, ?)",
    args: [organizationId, "Revora workspace"],
  });

  return organizationId;
}
