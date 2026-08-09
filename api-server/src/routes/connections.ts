import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  ConfigureWebsiteConnectionBody,
  ConfigureWebsiteConnectionParams,
  ConfigureWebsiteConnectionResponse,
  DisconnectConnectionParams,
  DisconnectConnectionResponse,
  GetConnectionParams,
  GetConnectionResponse,
  ListConnectionsResponse,
  StartConnectionBody,
  StartConnectionParams,
  StartConnectionResponse,
  SyncConnectionParams,
  SyncConnectionResponse,
} from "@workspace/api-zod";
import {
  connectionCatalog,
  catalogFor,
  isProvider,
  PROVIDERS,
  providerScopes,
  syntheticConnectionId,
  type ConnectionProvider,
} from "../lib/connection-catalog";
import { resolveOrganizationId } from "../lib/tenant";
import { getProviderCounts, getRevenueCounts } from "../lib/revenue-data";
import {
  connectionEventsTable,
  connectionsTable,
  db,
  syncJobsTable,
} from "@workspace/db";

const router: IRouter = Router();

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function baseConnection(provider: ConnectionProvider) {
  const catalog = catalogFor(provider);
  const now = new Date().toISOString();
  return {
    id: syntheticConnectionId(provider),
    provider,
    name: catalog.name,
    description: catalog.description,
    status: "NOT_CONNECTED" as const,
    externalAccountId: null,
    externalAccountName: null,
    connectedAt: null,
    lastSyncAt: null,
    lastSuccessAt: null,
    lastError: provider === "website"
      ? "Add your website URL to prepare widget tracking."
      : provider === "csv" || provider === "manual"
        ? null
        : "Provider credentials and official OAuth configuration are required.",
    webhookStatus: "NOT_CONFIGURED",
    syncStatus: "NOT_CONFIGURED",
    dataTypes: catalog.dataTypes,
    scopes: providerScopes[provider],
    createdAt: now,
    updatedAt: now,
  };
}

function serializeConnection(
  provider: ConnectionProvider,
  record: typeof connectionsTable.$inferSelect | undefined,
) {
  const fallback = baseConnection(provider);
  const catalog = catalogFor(provider);
  if (!record) return fallback;

  const configuration =
    record.configuration && typeof record.configuration === "object"
      ? (record.configuration as Record<string, unknown>)
      : {};
  return {
    ...fallback,
    id: record.id,
    status: record.status as typeof fallback.status,
    externalAccountId: record.externalAccountId,
    externalAccountName:
      record.externalAccountName ??
      (typeof configuration.websiteUrl === "string"
        ? configuration.websiteUrl
        : null),
    connectedAt: toIso(record.connectedAt),
    lastSyncAt: toIso(record.lastSyncAt),
    lastSuccessAt: toIso(record.lastSuccessAt),
    lastError: record.lastError,
    webhookStatus:
      typeof configuration.webhookStatus === "string"
        ? configuration.webhookStatus
        : fallback.webhookStatus,
    syncStatus:
      typeof configuration.syncStatus === "string"
        ? configuration.syncStatus
        : record.status,
    dataTypes: catalog.dataTypes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function getProviderRecord(
  organizationId: string,
  provider: ConnectionProvider,
) {
  const [record] = await db
    .select()
    .from(connectionsTable)
    .where(
      and(
        eq(connectionsTable.organizationId, organizationId),
        eq(connectionsTable.provider, provider),
      ),
    )
    .limit(1);
  return record;
}

export async function activityFor(
  organizationId: string,
  provider?: ConnectionProvider,
) {
  const jobs = await db
    .select({
      id: syncJobsTable.id,
      provider: connectionsTable.provider,
      status: syncJobsTable.status,
      error: syncJobsTable.error,
      createdAt: syncJobsTable.createdAt,
      completedAt: syncJobsTable.completedAt,
    })
    .from(syncJobsTable)
    .innerJoin(connectionsTable, eq(syncJobsTable.connectionId, connectionsTable.id))
    .where(
      provider
        ? and(
            eq(syncJobsTable.organizationId, organizationId),
            eq(connectionsTable.provider, provider),
          )
        : eq(syncJobsTable.organizationId, organizationId),
    )
    .orderBy(desc(syncJobsTable.createdAt))
    .limit(12);

  return jobs.map((job) => ({
    id: job.id,
    provider: job.provider as ConnectionProvider,
    title:
      job.status === "FAILED"
        ? "Synchronization needs attention"
        : job.status === "SUCCEEDED"
          ? "Synchronization completed"
          : "Synchronization requested",
    detail: job.error ?? `Sync job is ${job.status.toLowerCase()}.`,
    status: job.status === "FAILED" ? ("error" as const) : ("info" as const),
    createdAt: job.createdAt.toISOString(),
  }));
}

router.get("/connections", async (req, res): Promise<void> => {
  const organizationId = await resolveOrganizationId(req);
  const records = await db
    .select()
    .from(connectionsTable)
    .where(eq(connectionsTable.organizationId, organizationId));
  const connections = PROVIDERS.map((provider) =>
    serializeConnection(
      provider,
      records.find((record) => record.provider === provider),
    ),
  );
  const activity = await activityFor(organizationId);
  const counts = await getRevenueCounts(organizationId);
  const connected = connections.filter((item) =>
    ["CONNECTED", "SYNCING", "SYNCED"].includes(item.status),
  ).length;
  const needsAttention = connections.filter((item) => String(item.status) === "ERROR").length;
  const lastSynchronization = connections
    .map((item) => item.lastSyncAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;

  const result = {
    connections,
    catalog: connectionCatalog,
    activity,
    summary: {
      connected,
      needsAttention,
      lastSynchronization,
      ...counts,
    },
  };
  res.json(ListConnectionsResponse.parse(result));
});

router.get("/connections/:provider", async (req, res): Promise<void> => {
  const params = GetConnectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const organizationId = await resolveOrganizationId(req);
  const provider = params.data.provider;
  const record = await getProviderRecord(organizationId, provider);
  const activity = await activityFor(organizationId, provider);
  const counts = await getProviderCounts(organizationId, provider);
  const [eventCount] = record
    ? await db
        .select({ count: connectionEventsTable.id })
        .from(connectionEventsTable)
        .where(eq(connectionEventsTable.connectionId, record.id))
    : [{ count: undefined }];
  const detail = {
    connection: serializeConnection(provider, record),
    syncJobs: [],
    activity,
    statistics: {
      customers: counts.customers,
      orders: counts.orders,
      leads: 0,
      events: eventCount?.count ? 1 : 0,
    },
  };
  res.json(GetConnectionResponse.parse(detail));
});

router.post("/connections/:provider", async (req, res): Promise<void> => {
  const params = StartConnectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = StartConnectionBody.safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const organizationId = await resolveOrganizationId(req);
  const provider = params.data.provider;
  const existing = await getProviderRecord(organizationId, provider);
  const configuration = {
    ...(existing?.configuration && typeof existing.configuration === "object"
      ? existing.configuration
      : {}),
    ...(body.data.configuration ?? {}),
    ...(body.data.storeUrl ? { storeUrl: body.data.storeUrl } : {}),
  };
  const values = {
    organizationId,
    provider,
    status: "NOT_CONNECTED",
    externalAccountId: body.data.accountId ?? existing?.externalAccountId ?? null,
    externalAccountName:
      body.data.externalAccountName ?? existing?.externalAccountName ?? null,
    configuration,
    lastError:
      "Official provider credentials and OAuth configuration are required before this channel can connect.",
    updatedAt: new Date(),
  };
  const [record] = existing
    ? await db
        .update(connectionsTable)
        .set(values)
        .where(eq(connectionsTable.id, existing.id))
        .returning()
    : await db
        .insert(connectionsTable)
        .values(values)
        .returning();
  res.status(202).json(StartConnectionResponse.parse(serializeConnection(provider, record)));
});

router.delete("/connections/:provider", async (req, res): Promise<void> => {
  const params = DisconnectConnectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const organizationId = await resolveOrganizationId(req);
  const existing = await getProviderRecord(organizationId, params.data.provider);
  if (!existing) {
    res.json(DisconnectConnectionResponse.parse(baseConnection(params.data.provider)));
    return;
  }
  const [record] = await db
    .update(connectionsTable)
    .set({
      status: "DISCONNECTED",
      lastError: null,
      externalAccountId: null,
      externalAccountName: null,
      connectedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(connectionsTable.id, existing.id))
    .returning();
  res.json(DisconnectConnectionResponse.parse(serializeConnection(params.data.provider, record)));
});

router.post("/connections/:provider/sync", async (req, res): Promise<void> => {
  const params = SyncConnectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const organizationId = await resolveOrganizationId(req);
  const provider = params.data.provider;
  const existing = await getProviderRecord(organizationId, provider);
  const [job] = await db
    .insert(syncJobsTable)
    .values({
      organizationId,
      connectionId:
        existing?.id ??
        (
          await db
            .insert(connectionsTable)
            .values({
              organizationId,
              provider,
              status: "NOT_CONNECTED",
              lastError: "Connect this provider before requesting synchronization.",
            })
            .returning({ id: connectionsTable.id })
        )[0].id,
      status: "FAILED",
      completedAt: new Date(),
      error: "Synchronization is unavailable until official provider credentials are configured.",
    })
    .returning();
  res.status(202).json(
    SyncConnectionResponse.parse({
      id: job.id,
      provider,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      completedAt: toIso(job.completedAt),
      error: job.error,
    }),
  );
});

router.post("/connections/:provider/website", async (req, res): Promise<void> => {
  const params = ConfigureWebsiteConnectionParams.safeParse(req.params);
  const body = ConfigureWebsiteConnectionBody.safeParse(req.body);
  if (!params.success || !body.success || params.data.provider !== "website") {
    res.status(400).json({ error: "A valid website provider and website URL are required." });
    return;
  }
  const organizationId = await resolveOrganizationId(req);
  const existing = await getProviderRecord(organizationId, "website");
  const configuration = {
    ...(existing?.configuration && typeof existing.configuration === "object"
      ? existing.configuration
      : {}),
    websiteUrl: body.data.websiteUrl,
    webhookStatus: "NOT_CONFIGURED",
    syncStatus: "WAITING_FOR_FIRST_EVENT",
  };
  const [record] = existing
    ? await db
        .update(connectionsTable)
        .set({
          configuration,
          status: "NOT_CONNECTED",
          externalAccountName: body.data.websiteUrl,
          lastError: "Waiting for the first verified website event.",
          updatedAt: new Date(),
        })
        .where(eq(connectionsTable.id, existing.id))
        .returning()
    : await db
        .insert(connectionsTable)
        .values({
          organizationId,
          provider: "website",
          status: "NOT_CONNECTED",
          externalAccountName: body.data.websiteUrl,
          configuration,
          lastError: "Waiting for the first verified website event.",
        })
        .returning();
  res.json(ConfigureWebsiteConnectionResponse.parse(serializeConnection("website", record)));
});

export default router;