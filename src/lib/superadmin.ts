import { firebaseApp, firebaseAuth, hasFirebaseConfig } from "@/lib/firebase";
import { emitShopcodDataUpdated } from "@/lib/live-sync";
import { loadPlatformSettings, savePlatformSettings } from "@/lib/platform-data";
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

interface SuperAdminSessionUser {
  uid?: string;
  email: string;
  name: string;
}

const SUPERADMIN_STORAGE_KEY = "shopcod-superadmin-clients-v1";
const LOCAL_CLIENT_ID_STORAGE_KEY = "shopcod-superadmin-local-client-id-v1";
const ORDERS_STORAGE_KEY = "shopcod-orders-v1";
const STORES_STORAGE_KEY = "shopcod-stores-v1";
const FUNNELS_STORAGE_KEY = "shopcod-funnels-v1";
const ROOT_CLIENT_ID = "superadmin-root";
const CLOUD_COLLECTION = "shopcod-superadmin-clients";
const LEGACY_DEMO_EMAILS = new Set([
  "mariana@codgrowthlab.com",
  "jorge@widgethouse.io",
]);
const LEGACY_DEMO_WORKSPACES = new Set([
  "COD Growth Lab",
  "Latam Widget House",
]);
const isTestEnvironment = import.meta.env.MODE === "test";
const CLOUD_SYNC_RETRY_DELAY_MS = 12_000;
let cloudSyncBlockedUntil = 0;
let cloudSyncDisabledReason = "";

let cloudBootstrapPromise: Promise<SuperAdminClient[]> | null = null;

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

function removeStorageKey(key: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
  emitShopcodDataUpdated();
}

function readPersistedCollectionCount(key: string) {
  const stored = readStorage<unknown>(key);
  return Array.isArray(stored) ? stored.length : 0;
}

function readPersistedOrders() {
  const stored = readStorage<Array<{ total?: unknown }>>(ORDERS_STORAGE_KEY);

  if (!Array.isArray(stored)) {
    return [] as Array<{ total?: unknown }>;
  }

  return stored;
}

function getPersistedRevenue() {
  return Number(
    readPersistedOrders()
      .reduce((sum, order) => {
        const total = typeof order?.total === "number" && Number.isFinite(order.total) ? order.total : 0;
        return sum + total;
      }, 0)
      .toFixed(2),
  );
}

function toWorkspaceToken(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getWorkspaceClientId(sessionUser: Pick<SuperAdminSessionUser, "uid" | "email">) {
  const normalizedEmail = sessionUser.email.trim().toLowerCase();
  const currentUid = sessionUser.uid?.trim() || firebaseAuth.currentUser?.uid?.trim() || "";
  const fallbackToken = toWorkspaceToken(normalizedEmail);

  return `workspace-${currentUid || fallbackToken || "client"}`;
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

function createWorkspaceClient(sessionUser: SuperAdminSessionUser) {
  const now = new Date().toISOString();
  const settings = loadPlatformSettings();
  const resolvedPlan = getPlanDefinition(resolvePlanId(settings.billing.planName));

  return {
    id: getWorkspaceClientId(sessionUser),
    workspaceName: settings.accountName,
    companyName: settings.companyName || settings.accountName,
    ownerName: settings.legalName || sessionUser.name || settings.accountName,
    ownerEmail: sessionUser.email,
    planName: resolvedPlan.name,
    status: "active",
    storesCount: readPersistedCollectionCount(STORES_STORAGE_KEY),
    funnelsCount: readPersistedCollectionCount(FUNNELS_STORAGE_KEY),
    ordersCount: readPersistedCollectionCount(ORDERS_STORAGE_KEY),
    revenue: getPersistedRevenue(),
    createdAt: now,
    updatedAt: now,
    isProtected: false,
  } satisfies SuperAdminClient;
}

function isLegacyDemoClient(client: SuperAdminClient) {
  return (
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

  return {
    id: client.id,
    workspaceName: client.workspaceName,
    companyName: client.companyName,
    ownerName: client.ownerName,
    ownerEmail: client.ownerEmail,
    planName: isProtected ? "Root" : getPlanDefinition(resolvePlanId(client.planName)).name,
    status: isProtected ? "active" : client.status,
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

function sortClients(clients: SuperAdminClient[]) {
  return [...clients].sort((left, right) => {
    if (left.isProtected === right.isProtected) {
      return left.workspaceName.localeCompare(right.workspaceName);
    }

    return left.isProtected ? -1 : 1;
  });
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
      ...createRootClient(),
    };
  }

  return sortClients(normalized);
}

function persistClients(clients: SuperAdminClient[]) {
  const normalized = normalizeClients(clients);
  writeStorage(SUPERADMIN_STORAGE_KEY, normalized);
  return normalized;
}

function mergeClientsByRecency(localClients: SuperAdminClient[], remoteClients: SuperAdminClient[]) {
  const merged = new Map<string, SuperAdminClient>();

  for (const client of [...localClients, ...remoteClients]) {
    const current = merged.get(client.id);

    if (!current || client.updatedAt >= current.updatedAt) {
      merged.set(client.id, client);
    }
  }

  return normalizeClients([...merged.values()]);
}

function disableCloudSync(reason: string) {
  cloudSyncBlockedUntil = Date.now() + CLOUD_SYNC_RETRY_DELAY_MS;
  cloudSyncDisabledReason = reason;
}

function canUseCloudSync() {
  if (!hasFirebaseConfig() || isTestEnvironment) {
    return false;
  }

  if (Date.now() < cloudSyncBlockedUntil) {
    return false;
  }

  if (cloudSyncBlockedUntil > 0) {
    cloudSyncBlockedUntil = 0;
    cloudSyncDisabledReason = "";
  }

  return true;
}

function readCloudSyncErrorMessage(error: unknown) {
  const normalizedError = error as { code?: string; message?: string };
  const code = normalizedError?.code || "";
  const message = normalizedError?.message || "";
  const text = `${code} ${message}`.toLowerCase();

  if (text.includes("not-found")) {
    return "Firestore (default) no existe en el proyecto Firebase.";
  }

  if (text.includes("permission-denied")) {
    return "Reglas de Firestore bloquean el registro compartido del superadmin.";
  }

  if (text.includes("blocked_by_client") || text.includes("failed to fetch")) {
    return "El navegador o una extension esta bloqueando conexiones a Firestore.";
  }

  return "No se pudo conectar con Firestore para el registro compartido del superadmin.";
}

async function getCloudCollectionTools() {
  if (!canUseCloudSync()) {
    return null;
  }

  try {
    const { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } = await import(
      "firebase/firestore"
    );
    const firestore = getFirestore(firebaseApp);
    const clientsCollection = collection(firestore, CLOUD_COLLECTION);

    return {
      clientsCollection,
      deleteDoc,
      doc,
      getDocs,
      setDoc,
    };
  } catch (error) {
    disableCloudSync(readCloudSyncErrorMessage(error));
    return null;
  }
}

async function pushClientToCloud(client: SuperAdminClient) {
  if (client.isProtected) {
    return;
  }

  const tools = await getCloudCollectionTools();

  if (!tools) {
    return;
  }

  try {
    const clientRef = tools.doc(tools.clientsCollection, client.id);
    await tools.setDoc(clientRef, client, { merge: true });
  } catch (error) {
    disableCloudSync(readCloudSyncErrorMessage(error));
    // Keep local storage as fallback when Firestore is unavailable or denied.
  }
}

async function removeClientFromCloud(clientId: string) {
  const tools = await getCloudCollectionTools();

  if (!tools) {
    return;
  }

  try {
    const clientRef = tools.doc(tools.clientsCollection, clientId);
    await tools.deleteDoc(clientRef);
  } catch (error) {
    disableCloudSync(readCloudSyncErrorMessage(error));
    // Keep local storage as fallback when Firestore is unavailable or denied.
  }
}

function shouldSyncLocalWorkspace(clientId: string) {
  const storedLocalClientId = readStorage<string>(LOCAL_CLIENT_ID_STORAGE_KEY);
  return storedLocalClientId === clientId;
}

function markLocalWorkspaceClient(clientId: string) {
  writeStorage(LOCAL_CLIENT_ID_STORAGE_KEY, clientId);
}

export function isSuperAdminEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === SUPERADMIN_EMAIL;
}

export function loadSuperAdminClients() {
  const stored = readStorage<unknown>(SUPERADMIN_STORAGE_KEY);

  if (!stored) {
    const initialClients = persistClients([createRootClient()]);
    return initialClients;
  }

  return normalizeClients(stored);
}

export function getSuperAdminCloudSyncState() {
  const enabled = canUseCloudSync();

  return {
    enabled,
    reason: enabled
      ? ""
      : !hasFirebaseConfig()
        ? "Firebase no esta configurado para sincronizacion compartida."
        : cloudSyncDisabledReason,
  };
}

export async function bootstrapSuperAdminClientsFromCloud() {
  if (cloudBootstrapPromise) {
    return cloudBootstrapPromise;
  }

  cloudBootstrapPromise = (async () => {
    const tools = await getCloudCollectionTools();

    if (!tools) {
      return loadSuperAdminClients();
    }

    try {
      const snapshot = await tools.getDocs(tools.clientsCollection);
      const remoteClients = snapshot.docs
        .map((document) => normalizeClient(document.data()))
        .filter((client): client is SuperAdminClient => Boolean(client));
      const merged = mergeClientsByRecency(loadSuperAdminClients(), remoteClients);
      return persistClients(merged);
    } catch (error) {
      disableCloudSync(readCloudSyncErrorMessage(error));
      return loadSuperAdminClients();
    }
  })().finally(() => {
    cloudBootstrapPromise = null;
  });

  return cloudBootstrapPromise;
}

export async function registerAuthenticatedWorkspaceClient(
  sessionUser: SuperAdminSessionUser | null | undefined,
) {
  if (!sessionUser || !sessionUser.email || isSuperAdminEmail(sessionUser.email)) {
    return loadSuperAdminClients();
  }

  const clientId = getWorkspaceClientId(sessionUser);
  const hydratedClients = await bootstrapSuperAdminClientsFromCloud();
  const normalizedOwnerEmail = sessionUser.email.trim().toLowerCase();
  const existingClient = hydratedClients.find((client) => client.id === clientId && !client.isProtected);
  const legacyClient =
    existingClient ??
    hydratedClients.find(
      (client) =>
        !client.isProtected &&
        client.id !== clientId &&
        client.ownerEmail.trim().toLowerCase() === normalizedOwnerEmail,
    );
  const currentSettings = loadPlatformSettings();

  if (legacyClient && resolvePlanId(legacyClient.planName) !== resolvePlanId(currentSettings.billing.planName)) {
    applyPlanToSettings(currentSettings, resolvePlanId(legacyClient.planName));
  }

  const settings = loadPlatformSettings();

  if (settings.ownerEmail !== sessionUser.email) {
    savePlatformSettings({
      ...settings,
      ownerEmail: sessionUser.email,
      supportEmail: settings.supportEmail || sessionUser.email,
    });
  }

  const client = createWorkspaceClient(sessionUser);
  markLocalWorkspaceClient(client.id);
  const obsoleteClientIds = legacyClient && legacyClient.id !== client.id ? [legacyClient.id] : [];
  const nextClients = persistClients([
    ...loadSuperAdminClients().filter(
      (currentClient) =>
        currentClient.id !== client.id && !obsoleteClientIds.includes(currentClient.id),
    ),
    client,
  ]);

  for (const obsoleteClientId of obsoleteClientIds) {
    if (shouldSyncLocalWorkspace(obsoleteClientId)) {
      markLocalWorkspaceClient(client.id);
    }

    void removeClientFromCloud(obsoleteClientId);
  }

  void pushClientToCloud(client);
  return nextClients;
}

export function toggleSuperAdminClientStatus(clientId: string) {
  const nextClients = loadSuperAdminClients().map((client) => {
    if (client.id !== clientId || client.isProtected) {
      return client;
    }

    const nextClient = {
      ...client,
      status: client.status === "active" ? "inactive" : "active",
      updatedAt: new Date().toISOString(),
    };

    void pushClientToCloud(nextClient);
    return nextClient;
  });

  return persistClients(nextClients);
}

export function deleteSuperAdminClient(clientId: string) {
  const currentClients = loadSuperAdminClients();
  const target = currentClients.find((client) => client.id === clientId);

  if (!target || target.isProtected) {
    return currentClients;
  }

  if (shouldSyncLocalWorkspace(clientId)) {
    removeStorageKey(LOCAL_CLIENT_ID_STORAGE_KEY);
  }

  void removeClientFromCloud(clientId);
  return persistClients(currentClients.filter((client) => client.id !== clientId));
}

export function updateSuperAdminClientPlan(clientId: string, nextPlanId: ShopPlanId) {
  const currentClients = loadSuperAdminClients();
  const target = currentClients.find((client) => client.id === clientId);

  if (!target || target.isProtected) {
    return currentClients;
  }

  if (shouldSyncLocalWorkspace(clientId)) {
    applyPlanToSettings(loadPlatformSettings(), nextPlanId);
  }

  const nextPlan = getPlanDefinition(nextPlanId);
  const nextClients = currentClients.map((client) => {
    if (client.id !== clientId) {
      return client;
    }

    const nextClient = {
      ...client,
      planName: nextPlan.name,
      updatedAt: new Date().toISOString(),
    };

    void pushClientToCloud(nextClient);
    return nextClient;
  });

  return persistClients(nextClients);
}
