import { getSupabaseAdmin } from "@/lib/supabase/server";

const DEVELOPMENT_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000001";

export async function resolveOrganizationId(_request: Request): Promise<string> {
  const organizationId =
    process.env.REVORA_DEMO_ORGANIZATION_ID ?? DEVELOPMENT_ORGANIZATION_ID;

  const supabase = getSupabaseAdmin();
  // Idempotent: insert the dev org on first use, no-op afterwards.
  const { error } = await supabase
    .from("organizations")
    .upsert({ id: organizationId, name: "Revora workspace" }, { onConflict: "id" });
  if (error) throw new Error(`Failed to resolve organization: ${error.message}`);

  return organizationId;
}
