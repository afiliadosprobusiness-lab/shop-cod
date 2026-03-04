import { emitShopcodDataUpdated } from "@/lib/live-sync";
import { loadFunnels } from "@/lib/funnels";
import { loadOrders, loadPlatformSettings } from "@/lib/platform-data";
import { loadStores } from "@/lib/stores";

export const SUPERADMIN_EMAIL = "afiliadosprobusiness@gmail.com";

export type SuperAdminClientStatus = "active" | "inactive";

export interface SuperAdminClient {
  id: string;
  workspaceName: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  planName: string;
  status: SuperAdminClientStatus;
  storesCount: number;
  funnelsCount: number;
  ordersCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  isProtected: boolean;
}

const SUPERADMIN_STORAGE_KEY = "shopcod-superadmin-clients-v1";
const ROOT_CLIENT_ID = "superadmin-root";
const CURRENT_WORKSPACE_ID = "workspace-current";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  emitShopcodDataUpdated();
}

function createClientId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isClientStatus(value: unknown): value is SuperAdminClientStatus {
  return value === "active" || value === "inactive";
}

function createRootClient() {
  const now = new Date().toISOString();

  return {
    id: ROOT_CLIENT_ID,
    workspaceName: "ShopCOD Root",
    companyName: "Afiliados Pro Business",
    ownerName: "Superadmin",
    ownerEmail: SUPERADMIN_EMAIL,
    planName: "Root",
    status: "active",
    storesCount: 0,
    funnelsCount: 0,
    ordersCount: 0,
    revenue: 0,
    createdAt: now,
    updatedAt: now,
    isProtected: true,
  } satisfies SuperAdminClient;
}

function createCurrentWorkspaceClient() {
  const now = new Date().toISOString();
  const settings = loadPlatformSettings();
  const stores = loadStores();
  const funnels = loadFunnels();
  const orders = loadOrders();
  const revenue = Number(orders.reduce((sum, order) => sum + order.total, 0).toFixed(2));

  return {
    id: CURRENT_WORKSPACE_ID,
    workspaceName: settings.accountName,
    companyName: settings.companyName || settings.accountName,
    ownerName: settings.legalName || settings.accountName,
    ownerEmail: settings.ownerEmail,
    planName: settings.billing.planName,
    status: "active",
    storesCount: stores.length,
    funnelsCount: funnels.length,
    ordersCount: orders.length,
    revenue,
    createdAt: now,
    updatedAt: now,
    isProtected: false,
  } satisfies SuperAdminClient;
}

function createSeedClients() {
  const now = new Date().toISOString();

  return [
    createRootClient(),
    createCurrentWorkspaceClient(),
    {
      id: createClientId("client"),
      workspaceName: "COD Growth Lab",
      companyName: "COD Growth Lab",
      ownerName: "Mariana Ortiz",
      ownerEmail: "mariana@codgrowthlab.com",
      planName: "Growth",
      status: "active",
      storesCount: 4,
      funnelsCount: 7,
      ordersCount: 94,
      revenue: 18430,
      createdAt: now,
      updatedAt: now,
      isProtected: false,
    },
    {
      id: createClientId("client"),
      workspaceName: "Latam Widget House",
      companyName: "Latam Widget House",
      ownerName: "Jorge Perez",
      ownerEmail: "jorge@widgethouse.io",
      planName: "Starter",
      status: "inactive",
      storesCount: 1,
      funnelsCount: 2,
      ordersCount: 11,
      revenue: 2140,
      createdAt: now,
      updatedAt: now,
      isProtected: false,
    },
  ] satisfies SuperAdminClient[];
}

function normalizeClient(candidate: unknown): SuperAdminClient | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const client = candidate as Partial<SuperAdminClient>;

  if (
    typeof client.id !== "string" ||
    typeof client.workspaceName !== "string" ||
    typeof client.companyName !== "string" ||
    typeof client.ownerName !== "string" ||
    typeof client.ownerEmail !== "string" ||
    typeof client.planName !== "string" ||
    !isClientStatus(client.status)
  ) {
    return null;
  }

  return {
    id: client.id,
    workspaceName: client.workspaceName,
    companyName: client.companyName,
    ownerName: client.ownerName,
    ownerEmail: client.ownerEmail,
    planName: client.planName,
    status: client.status,
    storesCount:
      typeof client.storesCount === "number" && Number.isFinite(client.storesCount)
        ? Math.max(0, Math.trunc(client.storesCount))
        : 0,
    funnelsCount:
      typeof client.funnelsCount === "number" && Number.isFinite(client.funnelsCount)
        ? Math.max(0, Math.trunc(client.funnelsCount))
        : 0,
    ordersCount:
      typeof client.ordersCount === "number" && Number.isFinite(client.ordersCount)
        ? Math.max(0, Math.trunc(client.ordersCount))
        : 0,
    revenue:
      typeof client.revenue === "number" && Number.isFinite(client.revenue)
        ? Math.max(0, Number(client.revenue.toFixed(2)))
        : 0,
    createdAt:
      typeof client.createdAt === "string" ? client.createdAt : new Date().toISOString(),
    updatedAt:
      typeof client.updatedAt === "string" ? client.updatedAt : new Date().toISOString(),
    isProtected: Boolean(client.isProtected),
  };
}

function normalizeClients(candidate: unknown) {
  const normalized = Array.isArray(candidate)
    ? candidate
        .map((client) => normalizeClient(client))
        .filter((client): client is SuperAdminClient => Boolean(client))
    : [];

  const rootIndex = normalized.findIndex((client) => client.id === ROOT_CLIENT_ID);

  if (rootIndex === -1) {
    normalized.unshift(createRootClient());
  } else {
    normalized[rootIndex] = {
      ...normalized[rootIndex],
      workspaceName: "ShopCOD Root",
      companyName: "Afiliados Pro Business",
      ownerName: "Superadmin",
      ownerEmail: SUPERADMIN_EMAIL,
      planName: "Root",
      status: "active",
      isProtected: true,
    };
  }

  const workspaceIndex = normalized.findIndex(
    (client) => client.id === CURRENT_WORKSPACE_ID,
  );

  if (workspaceIndex >= 0) {
    const workspace = createCurrentWorkspaceClient();

    normalized[workspaceIndex] = {
      ...normalized[workspaceIndex],
      workspaceName: workspace.workspaceName,
      companyName: workspace.companyName,
      ownerName: workspace.ownerName,
      ownerEmail: workspace.ownerEmail,
      planName: workspace.planName,
      storesCount: workspace.storesCount,
      funnelsCount: workspace.funnelsCount,
      ordersCount: workspace.ordersCount,
      revenue: workspace.revenue,
      updatedAt: new Date().toISOString(),
    };
  }

  return normalized.sort((left, right) => {
    if (left.isProtected === right.isProtected) {
      return left.workspaceName.localeCompare(right.workspaceName);
    }

    return left.isProtected ? -1 : 1;
  });
}

function persistClients(clients: SuperAdminClient[]) {
  writeStorage(SUPERADMIN_STORAGE_KEY, clients);
  return clients;
}

export function isSuperAdminEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === SUPERADMIN_EMAIL;
}

export function loadSuperAdminClients() {
  const stored = readStorage<unknown>(SUPERADMIN_STORAGE_KEY);

  if (!stored) {
    const seeded = createSeedClients();
    persistClients(seeded);
    return seeded;
  }

  return normalizeClients(stored);
}

export function toggleSuperAdminClientStatus(clientId: string) {
  const nextClients = loadSuperAdminClients().map((client) => {
    if (client.id !== clientId || client.isProtected) {
      return client;
    }

    return {
      ...client,
      status: client.status === "active" ? "inactive" : "active",
      updatedAt: new Date().toISOString(),
    };
  });

  return persistClients(nextClients);
}

export function deleteSuperAdminClient(clientId: string) {
  const currentClients = loadSuperAdminClients();
  const target = currentClients.find((client) => client.id === clientId);

  if (!target || target.isProtected) {
    return currentClients;
  }

  return persistClients(currentClients.filter((client) => client.id !== clientId));
}
