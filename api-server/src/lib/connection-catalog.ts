import { createHash } from "node:crypto";

export const PROVIDERS = [
  "instagram",
  "whatsapp",
  "website",
  "shopify",
  "woocommerce",
  "csv",
  "manual",
] as const;

export type ConnectionProvider = (typeof PROVIDERS)[number];

type CatalogEntry = {
  provider: ConnectionProvider;
  name: string;
  description: string;
  dataTypes: Array<
    "messages" | "customers" | "leads" | "products" | "orders" | "payments" | "events"
  >;
};

export const connectionCatalog: CatalogEntry[] = [
  {
    provider: "instagram",
    name: "Instagram",
    description: "Capture conversations, customer profiles and lead activity from Instagram.",
    dataTypes: ["messages", "customers", "leads"],
  },
  {
    provider: "whatsapp",
    name: "WhatsApp Business",
    description: "Connect your WhatsApp Business account to capture customer conversations and sales opportunities.",
    dataTypes: ["messages", "customers", "leads"],
  },
  {
    provider: "website",
    name: "Website",
    description: "Capture customer activity and revenue events from your website with the Revora widget.",
    dataTypes: ["events", "customers", "leads", "orders"],
  },
  {
    provider: "shopify",
    name: "Shopify",
    description: "Synchronize customers, products and orders from your Shopify store.",
    dataTypes: ["customers", "products", "orders", "payments"],
  },
  {
    provider: "woocommerce",
    name: "WooCommerce",
    description: "Bring your WooCommerce customers, products and orders into Revora.",
    dataTypes: ["customers", "products", "orders", "payments"],
  },
  {
    provider: "csv",
    name: "CSV / Excel",
    description: "Import historical customer and order data with a guided mapping wizard.",
    dataTypes: ["customers", "orders"],
  },
  {
    provider: "manual",
    name: "Manual Import",
    description: "Add a revenue record when you are not ready to connect an external channel.",
    dataTypes: ["customers", "orders"],
  },
];

export function isProvider(value: string): value is ConnectionProvider {
  return (PROVIDERS as readonly string[]).includes(value);
}

export function catalogFor(provider: ConnectionProvider): CatalogEntry {
  return connectionCatalog.find((item) => item.provider === provider)!;
}

export function syntheticConnectionId(provider: ConnectionProvider): string {
  const hex = createHash("sha1")
    .update(`revora-connection:${provider}`)
    .digest("hex")
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}-${hex.slice(20)}`;
}

export const providerScopes: Record<ConnectionProvider, string[]> = {
  instagram: ["instagram_basic", "instagram_manage_messages"],
  whatsapp: ["whatsapp_business_management", "whatsapp_business_messaging"],
  website: ["events:write"],
  shopify: ["read_customers", "read_products", "read_orders"],
  woocommerce: ["read:customers", "read:products", "read:orders"],
  csv: ["import:customers", "import:orders"],
  manual: ["import:orders"],
};