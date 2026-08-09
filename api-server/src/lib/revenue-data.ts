import { and, eq, sql } from "drizzle-orm";
import {
  customersTable,
  db,
  ordersTable,
  type InsertCustomer,
  type InsertOrder,
} from "@workspace/db";

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

    const [existingCustomer] = await db
      .select()
      .from(customersTable)
      .where(
        and(
          eq(customersTable.organizationId, organizationId),
          eq(customersTable.name, row.customer),
        ),
      )
      .limit(1);

    const customer =
      existingCustomer ??
      (
        await db
          .insert(customersTable)
          .values({
            organizationId,
            externalSource: source,
            name: row.customer,
            phone: row.phone,
            email: row.email,
          } satisfies InsertCustomer)
          .returning()
      )[0];

    if (!existingCustomer) importedCustomers += 1;

    await db.insert(ordersTable).values({
      organizationId,
      customerId: customer.id,
      externalSource: source,
      product: row.product,
      orderValue: row.orderValue,
      channel: row.channel,
      orderDate: row.orderDate,
      status: row.status,
    } satisfies InsertOrder);
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
  const [customerCount, orderCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(customersTable)
      .where(eq(customersTable.organizationId, organizationId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(eq(ordersTable.organizationId, organizationId)),
  ]);

  return {
    customers: customerCount[0]?.count ?? 0,
    orders: orderCount[0]?.count ?? 0,
  };
}

export async function getProviderCounts(
  organizationId: string,
  provider: string,
) {
  const [customerCount, orderCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(customersTable)
      .where(
        and(
          eq(customersTable.organizationId, organizationId),
          eq(customersTable.externalSource, provider),
        ),
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.organizationId, organizationId),
          eq(ordersTable.externalSource, provider),
        ),
      ),
  ]);

  return {
    customers: customerCount[0]?.count ?? 0,
    orders: orderCount[0]?.count ?? 0,
  };
}