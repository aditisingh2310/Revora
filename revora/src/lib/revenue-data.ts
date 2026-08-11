import { getSupabaseAdmin } from "@/lib/supabase/server";

export type NormalizedRevenueRow = {
  customer: string;
  phone?: string;
  email?: string;
  product: string;
  orderValue: number;
  channel: string;
  orderDate: string;
  status: string;
};

export type ImportSummary = {
  importedCustomers: number;
  importedOrders: number;
  revenue: number;
  failedRows: number;
  errors: Array<{ row: number; message: string }>;
};

export function normalizeRevenueRow(
  row: Record<string, unknown>,
  mappings: Record<string, string> = {},
): NormalizedRevenueRow {
  const valueFor = (field: string) => {
    const source = mappings[field] ?? field;
    return row[source] ?? row[field];
  };

  const orderValue = Number(valueFor("order_value"));
  return {
    customer: String(valueFor("customer_name") ?? "").trim(),
    phone: valueFor("phone") == null ? undefined : String(valueFor("phone")),
    email: valueFor("email") == null ? undefined : String(valueFor("email")),
    product: String(valueFor("product") ?? "").trim(),
    orderValue,
    channel: String(valueFor("channel") ?? "manual").trim(),
    orderDate: String(valueFor("order_date") ?? "").trim(),
    status: String(valueFor("status") ?? "paid").trim().toLowerCase(),
  };
}

export async function importNormalizedRows(
  organizationId: string,
  rows: NormalizedRevenueRow[],
  source = "manual",
): Promise<ImportSummary> {
  const supabase = getSupabaseAdmin();
  let importedCustomers = 0;
  let importedOrders = 0;
  let revenue = 0;
  const errors: Array<{ row: number; message: string }> = [];

  for (const [index, row] of rows.entries()) {
    if (!row.customer || !row.product || !Number.isFinite(row.orderValue) || row.orderValue < 0) {
      errors.push({ row: index + 1, message: "Customer, product and a non-negative order value are required." });
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.orderDate)) {
      errors.push({ row: index + 1, message: "Order date must use YYYY-MM-DD." });
      continue;
    }
    if (!["paid", "pending", "cancelled"].includes(row.status)) {
      errors.push({ row: index + 1, message: "Status must be paid, pending or cancelled." });
      continue;
    }

    const { data: existing } = await supabase
      .from("customers")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("name", row.customer)
      .maybeSingle();

    let customerId: string;
    if (existing) {
      customerId = existing.id;
    } else {
      const { data: inserted, error } = await supabase
        .from("customers")
        .insert({
          organization_id: organizationId,
          external_source: source,
          name: row.customer,
          phone: row.phone ?? null,
          email: row.email ?? null,
          metadata: {},
        })
        .select("id")
        .single();
      if (error) throw new Error(`Failed to insert customer: ${error.message}`);
      customerId = inserted!.id;
      importedCustomers += 1;
    }

    const { error: orderError } = await supabase.from("orders").insert({
      organization_id: organizationId,
      customer_id: customerId,
      external_source: source,
      product: row.product,
      order_value: row.orderValue,
      channel: row.channel,
      order_date: row.orderDate,
      status: row.status,
      metadata: {},
    });
    if (orderError) throw new Error(`Failed to insert order: ${orderError.message}`);

    importedOrders += 1;
    revenue += row.orderValue;
  }

  return {
    importedCustomers,
    importedOrders,
    revenue: Math.round(revenue * 100) / 100,
    failedRows: errors.length,
    errors,
  };
}

export async function getRevenueCounts(organizationId: string) {
  const supabase = getSupabaseAdmin();
  const [customerResult, orderResult] = await Promise.all([
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId),
  ]);

  return {
    customers: Number(customerResult.count ?? 0),
    orders: Number(orderResult.count ?? 0),
  };
}

export async function getProviderCounts(organizationId: string, provider: string) {
  const supabase = getSupabaseAdmin();
  const [customerResult, orderResult] = await Promise.all([
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("external_source", provider),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("external_source", provider),
  ]);

  return {
    customers: Number(customerResult.count ?? 0),
    orders: Number(orderResult.count ?? 0),
  };
}
