import { z } from "zod";

export const ProviderSchema = z.enum([
  "instagram",
  "whatsapp",
  "website",
  "shopify",
  "woocommerce",
  "csv",
  "manual",
]);

export const ConnectionStatusSchema = z.enum([
  "NOT_CONNECTED",
  "CONNECTING",
  "CONNECTED",
  "SYNCING",
  "SYNCED",
  "ERROR",
  "DISCONNECTED",
]);

export const HealthCheckResponse = z.object({
  status: z.string(),
});

export const ProviderCatalogItem = z.object({
  provider: ProviderSchema,
  name: z.string(),
  description: z.string(),
  dataTypes: z.array(z.enum(["messages", "customers", "leads", "products", "orders", "payments", "events"])),
});

export const ConnectionSchema = z.object({
  id: z.string(),
  provider: ProviderSchema,
  name: z.string(),
  description: z.string(),
  status: ConnectionStatusSchema,
  externalAccountId: z.string().nullable(),
  externalAccountName: z.string().nullable(),
  connectedAt: z.string().nullable(),
  lastSyncAt: z.string().nullable(),
  lastSuccessAt: z.string().nullable(),
  lastError: z.string().nullable(),
  webhookStatus: z.string(),
  syncStatus: z.string(),
  dataTypes: z.array(z.enum(["messages", "customers", "leads", "products", "orders", "payments", "events"])),
  scopes: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ActivityItemSchema = z.object({
  id: z.string(),
  provider: ProviderSchema,
  title: z.string(),
  detail: z.string(),
  status: z.enum(["info", "success", "error"]),
  createdAt: z.string(),
});

export const ListConnectionsResponse = z.object({
  connections: z.array(ConnectionSchema),
  catalog: z.array(ProviderCatalogItem),
  activity: z.array(ActivityItemSchema),
  summary: z.object({
    connected: z.number(),
    needsAttention: z.number(),
    lastSynchronization: z.string().nullable(),
    customers: z.number(),
    orders: z.number(),
  }),
});

export const GetConnectionParams = z.object({
  provider: ProviderSchema,
});

export const ConnectionDetailSchema = z.object({
  connection: ConnectionSchema,
  syncJobs: z.array(z.object({
    id: z.string(),
    provider: ProviderSchema,
    status: z.string(),
    createdAt: z.string(),
    completedAt: z.string().nullable(),
    error: z.string().nullable(),
  })),
  activity: z.array(ActivityItemSchema),
  statistics: z.object({
    customers: z.number(),
    orders: z.number(),
    leads: z.number(),
    events: z.number(),
  }),
});

export const GetConnectionResponse = ConnectionDetailSchema;

export const StartConnectionParams = z.object({
  provider: ProviderSchema,
});

export const StartConnectionBody = z.object({
  accountId: z.string().optional(),
  externalAccountName: z.string().optional(),
  configuration: z.record(z.unknown()).optional(),
  storeUrl: z.string().optional(),
});

export const StartConnectionResponse = ConnectionSchema;

export const DisconnectConnectionParams = z.object({
  provider: ProviderSchema,
});

export const DisconnectConnectionResponse = ConnectionSchema;

export const SyncConnectionParams = z.object({
  provider: ProviderSchema,
});

export const SyncConnectionResponse = z.object({
  id: z.string(),
  provider: ProviderSchema,
  status: z.string(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  error: z.string().nullable(),
});

export const ConfigureWebsiteConnectionParams = z.object({
  provider: ProviderSchema,
});

export const ConfigureWebsiteConnectionBody = z.object({
  websiteUrl: z.string().url(),
});

export const ConfigureWebsiteConnectionResponse = ConnectionSchema;

export const ListSyncActivityResponse = z.array(ActivityItemSchema);

export const CreateManualImportBody = z.object({
  customer: z.string().min(1),
  product: z.string().min(1),
  orderValue: z.number().min(0),
  channel: z.string().min(1),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["paid", "pending", "cancelled"]),
});

export const ImportSummaryResponse = z.object({
  importedCustomers: z.number(),
  importedOrders: z.number(),
  revenue: z.number(),
  failedRows: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    message: z.string(),
  })),
});

export const CreateManualImportResponse = ImportSummaryResponse;

export const ImportCsvRowsBody = z.object({
  rows: z.array(z.record(z.unknown())),
  mappings: z.record(z.string()),
});

export const ImportCsvRowsResponse = ImportSummaryResponse;

export type Provider = z.infer<typeof ProviderSchema>;
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type ConnectionDetail = z.infer<typeof ConnectionDetailSchema>;
export type ActivityItem = z.infer<typeof ActivityItemSchema>;
export type ProviderCatalogItemType = z.infer<typeof ProviderCatalogItem>;
export type ImportSummary = z.infer<typeof ImportSummaryResponse>;
