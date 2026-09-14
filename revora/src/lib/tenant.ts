import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSessionOrganizationId } from "@/lib/auth/actions";

const DEVELOPMENT_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000001";

export async function resolveOrganizationId(_request: Request): Promise<string> {
  // Logged-in users work inside their own organization. Webhooks/agent calls
  // carry no session, so they keep using the demo workspace.
  try {
    const sessionOrg = await getSessionOrganizationId();
    if (sessionOrg) return sessionOrg;
  } catch {
    // No session (webhook, agent loop, misconfigured env) — fall through.
  }

  const organizationId =
    process.env.REVORA_DEMO_ORGANIZATION_ID ?? DEVELOPMENT_ORGANIZATION_ID;

  const supabase = getSupabaseAdmin();
  // Idempotent: insert the dev org on first use, no-op afterwards.
  const { error } = await supabase
    .from("organizations")
    .upsert({ id: organizationId, name: "Revora workspace" }, { onConflict: "id" });

  if (error) {
    console.warn("[tenant] Failed to upsert organization, continuing with resolved id.", error);
  }

  return organizationId;
}
