import { emitShopcodDataUpdated } from "@/lib/live-sync";
import { loadOrders, loadPlatformSettings } from "@/lib/platform-data";
import {
  applyPlanToSettings,
  getPlanDefinition,
  resolvePlanId,
  type ShopPlanId,
} from "@/lib/plans";

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
const SETTINGS_STORAGE_KEY = "shopcod-settings-v1";
const STORES_STORAGE_KEY = "shopcod-stores-v1";
const FUNNELS_STORAGE_KEY = "shopcod-funnels-v1";
const ROOT_CLIENT_ID = "superadmin-root";
const CURRENT_WORKSPACE_ID = "workspace-current";
const LEGACY_DEMO_EMAILS = new Set([
  "mariana@codgrowthlab.com",
  "jorge@widgethouse.io",
]);
const LEGACY_DEMO_WORKSPACES = new Set([
  "COD Growth Lab",
  "Latam Widget House",
]);

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

function hasPersistedKey(key: string) {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(key) !== null;
}

function readPersistedCollectionCount(key: string) {
  const stored = readStorage<unknown>(key);
  return Array.isArray(stored) ? stored.length : 0;
}

function hasPersistedWorkspaceData() {
  return (
    hasPersistedKey(SETTINGS_STORAGE_KEY) ||
    hasPersistedKey(STORES_STORAGE_KEY) ||
    hasPersistedKey(FUNNELS_STORAGE_KEY) ||
    loadOrders().length > 0
  );
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
  const orders = loadOrders();
  const revenue = Number(orders.reduce((sum, order) => sum + order.total, 0).toFixed(2));
  const resolvedPlan = getPlanDefinition(resolvePlanId(settings.billing.planName));

  return {
    id: CURRENT_WORKSPACE_ID,
    workspaceName: settings.accountName,
    companyName: settings.companyName || settings.accountName,
    ownerName: settings.legalName || settings.accountName,
    ownerEmail: settings.ownerEmail,
    planName: resolvedPlan.name,
    status: "active",
    storesCount: readPersistedCollectionCount(STORES_STORAGE_KEY),
    funnelsCount: readPersistedCollectionCount(FUNNELS_STORAGE_KEY),
    ordersCount: orders.length,
    revenue,
    createdAt: now,
    updatedAt: now,
    isProtected: false,
  } satisfies SuperAdminClient;
}

function createInitialClients() {
  return [
    createRootClient(),
    ...(hasPersistedWorkspaceData() ? [createCurrentWorkspaceClient()] : []),
  ] satisfies SuperAdminClient[];
}

function isLegacyDemoClient(client: SuperAdminClient) {
  return (
    client.id !== CURRENT_WORKSPACE_ID &&
    !client.isProtected &&
    (LEGACY_DEMO_EMAILS.has(client.ownerEmail.trim().toLowerCase()) ||
      LEGACY_DEMO_WORKSPACES.has(client.workspaceName))
  );
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

  const isProtected =
    Boolean(client.isProtected) ||
    client.id === ROOT_CLIENT_ID ||
    client.ownerEmail.trim().toLowerCase() === SUPERADMIN_EMAIL;

  const resolvedPlanName = isProtected
    ? "Root"
    : getPlanDefinition(resolvePlanId(client.planName)).name;

  return {
    id: client.id,
    workspaceName: client.workspaceName,
    companyName: client.companyName,
    ownerName: client.ownerName,
    ownerEmail: client.ownerEmail,
    planName: resolvedPlanName,
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
    isProtected,
  };
}

function normalizeClients(candidate: unknown) {
  const normalized = Array.isArray(candidate)
    ? candidate
        .map((client) => normalizeClient(client))
        .filter((client): client is SuperAdminClient => Boolean(client))
        .filter((client) => !isLegacyDemoClient(client))
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

  if (hasPersistedWorkspaceData()) {
    const workspace = createCurrentWorkspaceClient();

    if (workspaceIndex >= 0) {
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
  } else if (workspaceIndex >= 0) {
    normalized.splice(workspaceIndex, 1);
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
    const initialClients = createInitialClients();
    persistClients(initialClients);
    return initialClients;
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

export function updateSuperAdminClientPlan(clientId: string, nextPlanId: ShopPlanId) {
  const currentClients = loadSuperAdminClients();
  const target = currentClients.find((client) => client.id === clientId);

  if (!target || target.isProtected) {
    return currentClients;
  }

  if (clientId === CURRENT_WORKSPACE_ID) {
    applyPlanToSettings(loadPlatformSettings(), nextPlanId);
  }

  const nextPlan = getPlanDefinition(nextPlanId);
  const nextClients = currentClients.map((client) =>
    client.id === clientId
      ? {
          ...client,
          planName: nextPlan.name,
          updatedAt: new Date().toISOString(),
        }
      : client,
  );

  persistClients(nextClients);
  return loadSuperAdminClients();
}
