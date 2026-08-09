import { z } from "zod";
export declare const ProviderSchema: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
export declare const ConnectionStatusSchema: z.ZodEnum<["NOT_CONNECTED", "CONNECTING", "CONNECTED", "SYNCING", "SYNCED", "ERROR", "DISCONNECTED"]>;
export declare const HealthCheckResponse: z.ZodObject<{
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: string;
}, {
    status: string;
}>;
export declare const ProviderCatalogItem: z.ZodObject<{
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
    name: z.ZodString;
    description: z.ZodString;
    dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
}, "strip", z.ZodTypeAny, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
}, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
}>;
export declare const ConnectionSchema: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
    name: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<["NOT_CONNECTED", "CONNECTING", "CONNECTED", "SYNCING", "SYNCED", "ERROR", "DISCONNECTED"]>;
    externalAccountId: z.ZodNullable<z.ZodString>;
    externalAccountName: z.ZodNullable<z.ZodString>;
    connectedAt: z.ZodNullable<z.ZodString>;
    lastSyncAt: z.ZodNullable<z.ZodString>;
    lastSuccessAt: z.ZodNullable<z.ZodString>;
    lastError: z.ZodNullable<z.ZodString>;
    webhookStatus: z.ZodString;
    syncStatus: z.ZodString;
    dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
    scopes: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    id: string;
    externalAccountId: string | null;
    externalAccountName: string | null;
    connectedAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    webhookStatus: string;
    syncStatus: string;
    scopes: string[];
    createdAt: string;
    updatedAt: string;
}, {
    status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    id: string;
    externalAccountId: string | null;
    externalAccountName: string | null;
    connectedAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    webhookStatus: string;
    syncStatus: string;
    scopes: string[];
    createdAt: string;
    updatedAt: string;
}>;
export declare const ActivityItemSchema: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
    title: z.ZodString;
    detail: z.ZodString;
    status: z.ZodEnum<["info", "success", "error"]>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "info" | "success" | "error";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    id: string;
    createdAt: string;
    title: string;
    detail: string;
}, {
    status: "info" | "success" | "error";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    id: string;
    createdAt: string;
    title: string;
    detail: string;
}>;
export declare const ListConnectionsResponse: z.ZodObject<{
    connections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["NOT_CONNECTED", "CONNECTING", "CONNECTED", "SYNCING", "SYNCED", "ERROR", "DISCONNECTED"]>;
        externalAccountId: z.ZodNullable<z.ZodString>;
        externalAccountName: z.ZodNullable<z.ZodString>;
        connectedAt: z.ZodNullable<z.ZodString>;
        lastSyncAt: z.ZodNullable<z.ZodString>;
        lastSuccessAt: z.ZodNullable<z.ZodString>;
        lastError: z.ZodNullable<z.ZodString>;
        webhookStatus: z.ZodString;
        syncStatus: z.ZodString;
        dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
        scopes: z.ZodArray<z.ZodString, "many">;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    }, {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    }>, "many">;
    catalog: z.ZodArray<z.ZodObject<{
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        name: z.ZodString;
        description: z.ZodString;
        dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
    }, "strip", z.ZodTypeAny, {
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    }, {
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    }>, "many">;
    activity: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        title: z.ZodString;
        detail: z.ZodString;
        status: z.ZodEnum<["info", "success", "error"]>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }, {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }>, "many">;
    summary: z.ZodObject<{
        connected: z.ZodNumber;
        needsAttention: z.ZodNumber;
        lastSynchronization: z.ZodNullable<z.ZodString>;
        customers: z.ZodNumber;
        orders: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        customers: number;
        orders: number;
        connected: number;
        needsAttention: number;
        lastSynchronization: string | null;
    }, {
        customers: number;
        orders: number;
        connected: number;
        needsAttention: number;
        lastSynchronization: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    connections: {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    }[];
    catalog: {
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    }[];
    activity: {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }[];
    summary: {
        customers: number;
        orders: number;
        connected: number;
        needsAttention: number;
        lastSynchronization: string | null;
    };
}, {
    connections: {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    }[];
    catalog: {
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    }[];
    activity: {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }[];
    summary: {
        customers: number;
        orders: number;
        connected: number;
        needsAttention: number;
        lastSynchronization: string | null;
    };
}>;
export declare const GetConnectionParams: z.ZodObject<{
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
}, "strip", z.ZodTypeAny, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}>;
export declare const ConnectionDetailSchema: z.ZodObject<{
    connection: z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["NOT_CONNECTED", "CONNECTING", "CONNECTED", "SYNCING", "SYNCED", "ERROR", "DISCONNECTED"]>;
        externalAccountId: z.ZodNullable<z.ZodString>;
        externalAccountName: z.ZodNullable<z.ZodString>;
        connectedAt: z.ZodNullable<z.ZodString>;
        lastSyncAt: z.ZodNullable<z.ZodString>;
        lastSuccessAt: z.ZodNullable<z.ZodString>;
        lastError: z.ZodNullable<z.ZodString>;
        webhookStatus: z.ZodString;
        syncStatus: z.ZodString;
        dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
        scopes: z.ZodArray<z.ZodString, "many">;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    }, {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    }>;
    syncJobs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        status: z.ZodString;
        createdAt: z.ZodString;
        completedAt: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        error: string | null;
        completedAt: string | null;
    }, {
        status: string;
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        error: string | null;
        completedAt: string | null;
    }>, "many">;
    activity: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        title: z.ZodString;
        detail: z.ZodString;
        status: z.ZodEnum<["info", "success", "error"]>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }, {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }>, "many">;
    statistics: z.ZodObject<{
        customers: z.ZodNumber;
        orders: z.ZodNumber;
        leads: z.ZodNumber;
        events: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        customers: number;
        leads: number;
        orders: number;
        events: number;
    }, {
        customers: number;
        leads: number;
        orders: number;
        events: number;
    }>;
}, "strip", z.ZodTypeAny, {
    activity: {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }[];
    connection: {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    };
    syncJobs: {
        status: string;
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        error: string | null;
        completedAt: string | null;
    }[];
    statistics: {
        customers: number;
        leads: number;
        orders: number;
        events: number;
    };
}, {
    activity: {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }[];
    connection: {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    };
    syncJobs: {
        status: string;
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        error: string | null;
        completedAt: string | null;
    }[];
    statistics: {
        customers: number;
        leads: number;
        orders: number;
        events: number;
    };
}>;
export declare const GetConnectionResponse: z.ZodObject<{
    connection: z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["NOT_CONNECTED", "CONNECTING", "CONNECTED", "SYNCING", "SYNCED", "ERROR", "DISCONNECTED"]>;
        externalAccountId: z.ZodNullable<z.ZodString>;
        externalAccountName: z.ZodNullable<z.ZodString>;
        connectedAt: z.ZodNullable<z.ZodString>;
        lastSyncAt: z.ZodNullable<z.ZodString>;
        lastSuccessAt: z.ZodNullable<z.ZodString>;
        lastError: z.ZodNullable<z.ZodString>;
        webhookStatus: z.ZodString;
        syncStatus: z.ZodString;
        dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
        scopes: z.ZodArray<z.ZodString, "many">;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    }, {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    }>;
    syncJobs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        status: z.ZodString;
        createdAt: z.ZodString;
        completedAt: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        error: string | null;
        completedAt: string | null;
    }, {
        status: string;
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        error: string | null;
        completedAt: string | null;
    }>, "many">;
    activity: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
        title: z.ZodString;
        detail: z.ZodString;
        status: z.ZodEnum<["info", "success", "error"]>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }, {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }>, "many">;
    statistics: z.ZodObject<{
        customers: z.ZodNumber;
        orders: z.ZodNumber;
        leads: z.ZodNumber;
        events: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        customers: number;
        leads: number;
        orders: number;
        events: number;
    }, {
        customers: number;
        leads: number;
        orders: number;
        events: number;
    }>;
}, "strip", z.ZodTypeAny, {
    activity: {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }[];
    connection: {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    };
    syncJobs: {
        status: string;
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        error: string | null;
        completedAt: string | null;
    }[];
    statistics: {
        customers: number;
        leads: number;
        orders: number;
        events: number;
    };
}, {
    activity: {
        status: "info" | "success" | "error";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        title: string;
        detail: string;
    }[];
    connection: {
        status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        name: string;
        description: string;
        dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
        id: string;
        externalAccountId: string | null;
        externalAccountName: string | null;
        connectedAt: string | null;
        lastSyncAt: string | null;
        lastSuccessAt: string | null;
        lastError: string | null;
        webhookStatus: string;
        syncStatus: string;
        scopes: string[];
        createdAt: string;
        updatedAt: string;
    };
    syncJobs: {
        status: string;
        provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
        id: string;
        createdAt: string;
        error: string | null;
        completedAt: string | null;
    }[];
    statistics: {
        customers: number;
        leads: number;
        orders: number;
        events: number;
    };
}>;
export declare const StartConnectionParams: z.ZodObject<{
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
}, "strip", z.ZodTypeAny, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}>;
export declare const StartConnectionBody: z.ZodObject<{
    accountId: z.ZodOptional<z.ZodString>;
    externalAccountName: z.ZodOptional<z.ZodString>;
    configuration: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    storeUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    externalAccountName?: string | undefined;
    accountId?: string | undefined;
    configuration?: Record<string, unknown> | undefined;
    storeUrl?: string | undefined;
}, {
    externalAccountName?: string | undefined;
    accountId?: string | undefined;
    configuration?: Record<string, unknown> | undefined;
    storeUrl?: string | undefined;
}>;
export declare const StartConnectionResponse: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
    name: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<["NOT_CONNECTED", "CONNECTING", "CONNECTED", "SYNCING", "SYNCED", "ERROR", "DISCONNECTED"]>;
    externalAccountId: z.ZodNullable<z.ZodString>;
    externalAccountName: z.ZodNullable<z.ZodString>;
    connectedAt: z.ZodNullable<z.ZodString>;
    lastSyncAt: z.ZodNullable<z.ZodString>;
    lastSuccessAt: z.ZodNullable<z.ZodString>;
    lastError: z.ZodNullable<z.ZodString>;
    webhookStatus: z.ZodString;
    syncStatus: z.ZodString;
    dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
    scopes: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    id: string;
    externalAccountId: string | null;
    externalAccountName: string | null;
    connectedAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    webhookStatus: string;
    syncStatus: string;
    scopes: string[];
    createdAt: string;
    updatedAt: string;
}, {
    status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    id: string;
    externalAccountId: string | null;
    externalAccountName: string | null;
    connectedAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    webhookStatus: string;
    syncStatus: string;
    scopes: string[];
    createdAt: string;
    updatedAt: string;
}>;
export declare const DisconnectConnectionParams: z.ZodObject<{
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
}, "strip", z.ZodTypeAny, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}>;
export declare const DisconnectConnectionResponse: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
    name: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<["NOT_CONNECTED", "CONNECTING", "CONNECTED", "SYNCING", "SYNCED", "ERROR", "DISCONNECTED"]>;
    externalAccountId: z.ZodNullable<z.ZodString>;
    externalAccountName: z.ZodNullable<z.ZodString>;
    connectedAt: z.ZodNullable<z.ZodString>;
    lastSyncAt: z.ZodNullable<z.ZodString>;
    lastSuccessAt: z.ZodNullable<z.ZodString>;
    lastError: z.ZodNullable<z.ZodString>;
    webhookStatus: z.ZodString;
    syncStatus: z.ZodString;
    dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
    scopes: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    id: string;
    externalAccountId: string | null;
    externalAccountName: string | null;
    connectedAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    webhookStatus: string;
    syncStatus: string;
    scopes: string[];
    createdAt: string;
    updatedAt: string;
}, {
    status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    id: string;
    externalAccountId: string | null;
    externalAccountName: string | null;
    connectedAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    webhookStatus: string;
    syncStatus: string;
    scopes: string[];
    createdAt: string;
    updatedAt: string;
}>;
export declare const SyncConnectionParams: z.ZodObject<{
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
}, "strip", z.ZodTypeAny, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}>;
export declare const SyncConnectionResponse: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
    status: z.ZodString;
    createdAt: z.ZodString;
    completedAt: z.ZodNullable<z.ZodString>;
    error: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    id: string;
    createdAt: string;
    error: string | null;
    completedAt: string | null;
}, {
    status: string;
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    id: string;
    createdAt: string;
    error: string | null;
    completedAt: string | null;
}>;
export declare const ConfigureWebsiteConnectionParams: z.ZodObject<{
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
}, "strip", z.ZodTypeAny, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}, {
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
}>;
export declare const ConfigureWebsiteConnectionBody: z.ZodObject<{
    websiteUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    websiteUrl: string;
}, {
    websiteUrl: string;
}>;
export declare const ConfigureWebsiteConnectionResponse: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
    name: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<["NOT_CONNECTED", "CONNECTING", "CONNECTED", "SYNCING", "SYNCED", "ERROR", "DISCONNECTED"]>;
    externalAccountId: z.ZodNullable<z.ZodString>;
    externalAccountName: z.ZodNullable<z.ZodString>;
    connectedAt: z.ZodNullable<z.ZodString>;
    lastSyncAt: z.ZodNullable<z.ZodString>;
    lastSuccessAt: z.ZodNullable<z.ZodString>;
    lastError: z.ZodNullable<z.ZodString>;
    webhookStatus: z.ZodString;
    syncStatus: z.ZodString;
    dataTypes: z.ZodArray<z.ZodEnum<["messages", "customers", "leads", "products", "orders", "payments", "events"]>, "many">;
    scopes: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    id: string;
    externalAccountId: string | null;
    externalAccountName: string | null;
    connectedAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    webhookStatus: string;
    syncStatus: string;
    scopes: string[];
    createdAt: string;
    updatedAt: string;
}, {
    status: "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "SYNCING" | "SYNCED" | "ERROR" | "DISCONNECTED";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    name: string;
    description: string;
    dataTypes: ("messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events")[];
    id: string;
    externalAccountId: string | null;
    externalAccountName: string | null;
    connectedAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    webhookStatus: string;
    syncStatus: string;
    scopes: string[];
    createdAt: string;
    updatedAt: string;
}>;
export declare const ListSyncActivityResponse: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["instagram", "whatsapp", "website", "shopify", "woocommerce", "csv", "manual"]>;
    title: z.ZodString;
    detail: z.ZodString;
    status: z.ZodEnum<["info", "success", "error"]>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "info" | "success" | "error";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    id: string;
    createdAt: string;
    title: string;
    detail: string;
}, {
    status: "info" | "success" | "error";
    provider: "instagram" | "whatsapp" | "website" | "shopify" | "woocommerce" | "csv" | "manual";
    id: string;
    createdAt: string;
    title: string;
    detail: string;
}>, "many">;
export declare const CreateManualImportBody: z.ZodObject<{
    customer: z.ZodString;
    product: z.ZodString;
    orderValue: z.ZodNumber;
    channel: z.ZodString;
    orderDate: z.ZodString;
    status: z.ZodEnum<["paid", "pending", "cancelled"]>;
}, "strip", z.ZodTypeAny, {
    status: "paid" | "pending" | "cancelled";
    customer: string;
    product: string;
    orderValue: number;
    channel: string;
    orderDate: string;
}, {
    status: "paid" | "pending" | "cancelled";
    customer: string;
    product: string;
    orderValue: number;
    channel: string;
    orderDate: string;
}>;
export declare const ImportSummaryResponse: z.ZodObject<{
    importedCustomers: z.ZodNumber;
    importedOrders: z.ZodNumber;
    revenue: z.ZodNumber;
    failedRows: z.ZodNumber;
    errors: z.ZodArray<z.ZodObject<{
        row: z.ZodNumber;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        row: number;
    }, {
        message: string;
        row: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    importedCustomers: number;
    importedOrders: number;
    revenue: number;
    failedRows: number;
    errors: {
        message: string;
        row: number;
    }[];
}, {
    importedCustomers: number;
    importedOrders: number;
    revenue: number;
    failedRows: number;
    errors: {
        message: string;
        row: number;
    }[];
}>;
export declare const CreateManualImportResponse: z.ZodObject<{
    importedCustomers: z.ZodNumber;
    importedOrders: z.ZodNumber;
    revenue: z.ZodNumber;
    failedRows: z.ZodNumber;
    errors: z.ZodArray<z.ZodObject<{
        row: z.ZodNumber;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        row: number;
    }, {
        message: string;
        row: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    importedCustomers: number;
    importedOrders: number;
    revenue: number;
    failedRows: number;
    errors: {
        message: string;
        row: number;
    }[];
}, {
    importedCustomers: number;
    importedOrders: number;
    revenue: number;
    failedRows: number;
    errors: {
        message: string;
        row: number;
    }[];
}>;
export declare const ImportCsvRowsBody: z.ZodObject<{
    rows: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    mappings: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rows: Record<string, unknown>[];
    mappings: Record<string, string>;
}, {
    rows: Record<string, unknown>[];
    mappings: Record<string, string>;
}>;
export declare const ImportCsvRowsResponse: z.ZodObject<{
    importedCustomers: z.ZodNumber;
    importedOrders: z.ZodNumber;
    revenue: z.ZodNumber;
    failedRows: z.ZodNumber;
    errors: z.ZodArray<z.ZodObject<{
        row: z.ZodNumber;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        row: number;
    }, {
        message: string;
        row: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    importedCustomers: number;
    importedOrders: number;
    revenue: number;
    failedRows: number;
    errors: {
        message: string;
        row: number;
    }[];
}, {
    importedCustomers: number;
    importedOrders: number;
    revenue: number;
    failedRows: number;
    errors: {
        message: string;
        row: number;
    }[];
}>;
export type Provider = z.infer<typeof ProviderSchema>;
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type ConnectionDetail = z.infer<typeof ConnectionDetailSchema>;
export type ActivityItem = z.infer<typeof ActivityItemSchema>;
export type ProviderCatalogItemType = z.infer<typeof ProviderCatalogItem>;
export type ImportSummary = z.infer<typeof ImportSummaryResponse>;
//# sourceMappingURL=index.d.ts.map