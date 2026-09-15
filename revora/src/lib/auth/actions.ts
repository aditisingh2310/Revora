"use server";

import { randomUUID } from "node:crypto";
import { getSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase/server";

// Idempotent: links the current session user to an organization, creating a
// personal org + profile row on first call (e.g. right after signup).
// Returns the organization id, or null when there is no session.
export async function ensureProfileForCurrentUser(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing?.organization_id) return existing.organization_id as string;

  const admin = getSupabaseAdmin();
  const workspaceName = `${user.email?.split("@")[0] ?? "My"}'s workspace`;
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ id: randomUUID(), name: workspaceName })
    .select("id")
    .single();
  if (orgError || !org) {
    console.error("[auth] Failed to create organization for new user", orgError);
    throw new Error("Could not set up your workspace. Please try again.");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    { id: user.id, organization_id: org.id },
    { onConflict: "id" },
  );
  if (profileError) {
    console.error("[auth] Failed to create profile for new user", profileError);
    throw new Error("Could not set up your workspace. Please try again.");
  }
  return org.id as string;
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

// Organization id for the current session user, or null when logged out
// (or when the user predates profiles). Callers fall back to the demo org.
export async function getSessionOrganizationId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();
  return (data?.organization_id as string | undefined) ?? null;
}
