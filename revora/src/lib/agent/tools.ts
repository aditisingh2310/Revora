import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getRevenueCounts, getProviderCounts } from "@/lib/revenue-data";

export const toolNames = [
  "getShopStats",
  "searchRecentOrders",
  "getRecentMessages",
] as const;

export function agentToolNames(): string[] {
  return [...toolNames];
}

const SALES_HINT = /(sale|revenue|order|today|total|how much|sales)/i;

export function shouldUseRevenueTools(text: string): boolean {
  return SALES_HINT.test(text);
}

export const getShopStatsInput = z.object({ organizationId: z.string().uuid() });

export async function getShopStats(organizationId: string) {
  const input = getShopStatsInput.parse({ organizationId });
  const supabaseCheck = getSupabaseAdmin();
  void supabaseCheck;
  const [totals, telegram] = await Promise.all([
    getRevenueCounts(input.organizationId),
    getProviderCounts(input.organizationId, "telegram"),
  ]);
  return { customers: totals.customers, orders: totals.orders, telegram };
}

export async function searchRecentOrders(organizationId: string, limit = 10) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("id,product,order_value,order_date,status")
    .eq("organization_id", organizationId)
    .order("order_date", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`orders lookup failed: ${error.message}`);
  return data ?? [];
}

export async function getRecentMessages(contactId: string, limit = 10) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("messages")
    .select("direction,text,created_at")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`messages lookup failed: ${error.message}`);
  return (data ?? []).reverse();
}
