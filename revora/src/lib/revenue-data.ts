import { sqlite } from "@workspace/db";

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

    const existingCustomer = await sqlite.execute({
      sql: "SELECT * FROM customers WHERE organization_id = ? AND name = ? LIMIT 1",
      args: [organizationId, row.customer],
    });

    let customerId: string;
    if (existingCustomer.rows.length > 0) {
      customerId = String(existingCustomer.rows[0].id);
    } else {
      const result = await sqlite.execute({
        sql: "INSERT INTO customers (organization_id, external_source, name, phone, email) VALUES (?, ?, ?, ?, ?)",
        args: [organizationId, source, row.customer, row.phone ?? null, row.email ?? null],
      });
      customerId = String(result.lastInsertRowid);
      importedCustomers += 1;
    }

    await sqlite.execute({
      sql: "INSERT INTO orders (organization_id, customer_id, external_source, product, order_value, channel, order_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [organizationId, customerId, source, row.product, row.orderValue, row.channel, row.orderDate, row.status],
    });
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
    sqlite.execute({ sql: "SELECT COUNT(*) as count FROM customers WHERE organization_id = ?", args: [organizationId] }),
    sqlite.execute({ sql: "SELECT COUNT(*) as count FROM orders WHERE organization_id = ?", args: [organizationId] }),
  ]);

  return {
    customers: Number(customerCount.rows[0]?.count ?? 0),
    orders: Number(orderCount.rows[0]?.count ?? 0),
  };
}

export async function getProviderCounts(organizationId: string, provider: string) {
  const [customerCount, orderCount] = await Promise.all([
    sqlite.execute({ sql: "SELECT COUNT(*) as count FROM customers WHERE organization_id = ? AND external_source = ?", args: [organizationId, provider] }),
    sqlite.execute({ sql: "SELECT COUNT(*) as count FROM orders WHERE organization_id = ? AND external_source = ?", args: [organizationId, provider] }),
  ]);

  return {
    customers: Number(customerCount.rows[0]?.count ?? 0),
    orders: Number(orderCount.rows[0]?.count ?? 0),
  };
}
