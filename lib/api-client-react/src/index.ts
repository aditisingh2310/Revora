import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  Connection,
  ConnectionDetail,
  Provider,
  ActivityItem,
  ProviderCatalogItemType,
  ImportSummary,
} from "@workspace/api-zod";

export type {
  Connection,
  ConnectionDetail,
  Provider,
  ActivityItem,
  ProviderCatalogItemType,
  ImportSummary,
} from "@workspace/api-zod";

const API_BASE = "/api";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function getListConnectionsQueryKey() {
  return ["connections"] as const;
}

export function getGetConnectionQueryKey(provider: Provider) {
  return ["connections", provider] as const;
}

export function getListSyncActivityQueryKey() {
  return ["activity"] as const;
}

type ConnectionsResponse = {
  connections: Connection[];
  catalog: ProviderCatalogItemType[];
  activity: ActivityItem[];
  summary: {
    connected: number;
    needsAttention: number;
    lastSynchronization: string | null;
    customers: number;
    orders: number;
  };
};

type SyncResponse = {
  id: string;
  provider: Provider;
  status: string;
  createdAt: string;
  completedAt: string | null;
  error: string | null;
};

export function useListConnections(options?: UseQueryOptions<ConnectionsResponse, Error>) {
  return useQuery<ConnectionsResponse, Error>({
    queryKey: getListConnectionsQueryKey(),
    queryFn: () => fetchJson<ConnectionsResponse>("/connections"),
    ...options,
  });
}

export function useGetConnection(provider: Provider, options?: UseQueryOptions<ConnectionDetail, Error>) {
  return useQuery<ConnectionDetail, Error>({
    queryKey: getGetConnectionQueryKey(provider),
    queryFn: () => fetchJson<ConnectionDetail>(`/connections/${provider}`),
    ...options,
  });
}

export function useListSyncActivity(options?: UseQueryOptions<ActivityItem[], Error>) {
  return useQuery<ActivityItem[], Error>({
    queryKey: getListSyncActivityQueryKey(),
    queryFn: () => fetchJson<ActivityItem[]>("/activity"),
    ...options,
  });
}

export function useStartConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, ...body }: { provider: Provider; accountId?: string; externalAccountName?: string; configuration?: Record<string, unknown> }) =>
      fetchJson<Connection>(`/connections/${provider}`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getListConnectionsQueryKey() });
    },
  });
}

export function useDisconnectConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider }: { provider: Provider }) =>
      fetchJson<Connection>(`/connections/${provider}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getListConnectionsQueryKey() });
    },
  });
}

export function useSyncConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider }: { provider: Provider }) =>
      fetchJson<SyncResponse>(`/connections/${provider}/sync`, { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getListConnectionsQueryKey() });
      void queryClient.invalidateQueries({ queryKey: getListSyncActivityQueryKey() });
    },
  });
}

export function useConfigureWebsiteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, websiteUrl }: { provider: Provider; websiteUrl: string }) =>
      fetchJson<Connection>(`/connections/${provider}/website`, {
        method: "POST",
        body: JSON.stringify({ websiteUrl }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getListConnectionsQueryKey() });
    },
  });
}

export function useImportCsvRows() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rows, mappings }: { rows: Record<string, unknown>[]; mappings: Record<string, string> }) =>
      fetchJson<ImportSummary>("/imports/csv", {
        method: "POST",
        body: JSON.stringify({ rows, mappings }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getListConnectionsQueryKey() });
      void queryClient.invalidateQueries({ queryKey: getListSyncActivityQueryKey() });
    },
  });
}

export function useCreateManualImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { customer: string; product: string; orderValue: number; channel: string; orderDate: string; status: "paid" | "pending" | "cancelled" }) =>
      fetchJson<ImportSummary>("/imports/manual", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getListConnectionsQueryKey() });
      void queryClient.invalidateQueries({ queryKey: getListSyncActivityQueryKey() });
    },
  });
}


