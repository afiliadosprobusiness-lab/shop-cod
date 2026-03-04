export type BlockType =
  | "hero"
  | "problem"
  | "benefits"
  | "reviews"
  | "faq"
  | "checkout"
  | "cta";

export type StoreStatus = "activa" | "borrador" | "pausada";

export interface FunnelBlock {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}

export interface StoreProfile {
  storeName: string;
  productName: string;
  headline: string;
  subheadline: string;
  price: string;
  originalPrice: string;
  ctaText: string;
  category: string;
}

export interface StoreCatalogItem {
  id: string;
  name: string;
  product: string;
  category: string;
  status: StoreStatus;
  orders: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StoredEditorState {
  blocks: FunnelBlock[];
  profile: StoreProfile | null;
  updatedAt: string;
  publishedAt: string | null;
}

const EDITOR_STORAGE_PREFIX = "shopcod-editor:";
const STORE_CATALOG_KEY = "shopcod-store-catalog";

function isBrowser() {
  return typeof window !== "undefined";
}

function getEditorStorageKey(storeId: string) {
  return `${EDITOR_STORAGE_PREFIX}${storeId}`;
}

function isValidBlock(candidate: unknown): candidate is FunnelBlock {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const block = candidate as Partial<FunnelBlock>;

  return (
    typeof block.id === "string" &&
    typeof block.type === "string" &&
    !!block.data &&
    typeof block.data === "object"
  );
}

function normalizeProfile(candidate: unknown) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const profile = candidate as Partial<StoreProfile>;

  const storeName = typeof profile.storeName === "string" ? profile.storeName : "";
  const productName = typeof profile.productName === "string" ? profile.productName : "";
  const headline = typeof profile.headline === "string" ? profile.headline : "";
  const subheadline =
    typeof profile.subheadline === "string" ? profile.subheadline : "";
  const price = typeof profile.price === "string" ? profile.price : "";
  const originalPrice =
    typeof profile.originalPrice === "string" ? profile.originalPrice : "";
  const ctaText = typeof profile.ctaText === "string" ? profile.ctaText : "";
  const category = typeof profile.category === "string" ? profile.category : "";

  if (!storeName && !productName && !headline) {
    return null;
  }

  return {
    storeName,
    productName,
    headline,
    subheadline,
    price,
    originalPrice,
    ctaText,
    category,
  } satisfies StoreProfile;
}

function normalizeCatalogItem(candidate: unknown) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const item = candidate as Partial<StoreCatalogItem>;

  if (typeof item.id !== "string" || typeof item.name !== "string") {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    product: typeof item.product === "string" ? item.product : "Producto sin nombre",
    category: typeof item.category === "string" ? item.category : "General",
    status:
      item.status === "activa" || item.status === "pausada" || item.status === "borrador"
        ? item.status
        : "borrador",
    orders: typeof item.orders === "number" ? item.orders : 0,
    revenue: typeof item.revenue === "number" ? item.revenue : 0,
    createdAt:
      typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    updatedAt:
      typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
    publishedAt:
      typeof item.publishedAt === "string" ? item.publishedAt : null,
  } satisfies StoreCatalogItem;
}

function writeStoreCatalog(items: StoreCatalogItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORE_CATALOG_KEY, JSON.stringify(items));
}

export function loadStoreCatalog() {
  if (!isBrowser()) {
    return [] as StoreCatalogItem[];
  }

  try {
    const rawValue = window.localStorage.getItem(STORE_CATALOG_KEY);

    if (!rawValue) {
      return [] as StoreCatalogItem[];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [] as StoreCatalogItem[];
    }

    return parsedValue
      .map((item) => normalizeCatalogItem(item))
      .filter((item): item is StoreCatalogItem => Boolean(item))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch {
    return [] as StoreCatalogItem[];
  }
}

export function upsertStoreCatalogItem(
  storeId: string,
  profile: StoreProfile | null,
  options?: {
    status?: StoreStatus;
    publishedAt?: string | null;
    updatedAt?: string;
  },
) {
  if (!profile) {
    return loadStoreCatalog();
  }

  const catalog = loadStoreCatalog();
  const now = options?.updatedAt ?? new Date().toISOString();
  const existingItem = catalog.find((item) => item.id === storeId);

  const nextItem: StoreCatalogItem = {
    id: storeId,
    name: profile.storeName || existingItem?.name || "Nueva tienda",
    product: profile.productName || existingItem?.product || "Producto principal",
    category: profile.category || existingItem?.category || "General",
    status: options?.status || existingItem?.status || "borrador",
    orders: existingItem?.orders || 0,
    revenue: existingItem?.revenue || 0,
    createdAt: existingItem?.createdAt || now,
    updatedAt: now,
    publishedAt:
      options?.publishedAt !== undefined
        ? options.publishedAt
        : existingItem?.publishedAt || null,
  };

  const nextCatalog = [
    nextItem,
    ...catalog.filter((item) => item.id !== storeId),
  ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  writeStoreCatalog(nextCatalog);
  return nextCatalog;
}

export function setStoreCatalogStatus(storeId: string, status: StoreStatus) {
  const catalog = loadStoreCatalog();
  const hasStore = catalog.some((item) => item.id === storeId);

  if (!hasStore) {
    return catalog;
  }

  const updatedAt = new Date().toISOString();
  const nextCatalog = catalog
    .map((item) =>
      item.id === storeId ? { ...item, status, updatedAt } : item,
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  writeStoreCatalog(nextCatalog);
  return nextCatalog;
}

export function loadEditorState(storeId: string) {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getEditorStorageKey(storeId));

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StoredEditorState>;

    if (!Array.isArray(parsedValue.blocks) || !parsedValue.blocks.every(isValidBlock)) {
      return null;
    }

    return {
      blocks: parsedValue.blocks,
      profile: normalizeProfile(parsedValue.profile),
      updatedAt:
        typeof parsedValue.updatedAt === "string"
          ? parsedValue.updatedAt
          : new Date().toISOString(),
      publishedAt:
        typeof parsedValue.publishedAt === "string" ? parsedValue.publishedAt : null,
    } satisfies StoredEditorState;
  } catch {
    return null;
  }
}

export function saveEditorState(
  storeId: string,
  blocks: FunnelBlock[],
  profile?: StoreProfile | null,
) {
  const previousState = loadEditorState(storeId);
  const nextState: StoredEditorState = {
    blocks,
    profile: profile ?? previousState?.profile ?? null,
    updatedAt: new Date().toISOString(),
    publishedAt: previousState?.publishedAt ?? null,
  };

  if (isBrowser()) {
    window.localStorage.setItem(getEditorStorageKey(storeId), JSON.stringify(nextState));
  }

  upsertStoreCatalogItem(storeId, nextState.profile, {
    status: nextState.publishedAt ? "activa" : "borrador",
    publishedAt: nextState.publishedAt,
    updatedAt: nextState.updatedAt,
  });

  return nextState;
}

export function publishEditorState(
  storeId: string,
  fallbackBlocks?: FunnelBlock[],
  profile?: StoreProfile | null,
) {
  const baseState =
    loadEditorState(storeId) ??
    (fallbackBlocks
      ? {
          blocks: fallbackBlocks,
          profile: profile ?? null,
          updatedAt: new Date().toISOString(),
          publishedAt: null,
        }
      : null);

  if (!baseState) {
    return null;
  }

  const nextState: StoredEditorState = {
    ...baseState,
    profile: profile ?? baseState.profile ?? null,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(getEditorStorageKey(storeId), JSON.stringify(nextState));
  }

  upsertStoreCatalogItem(storeId, nextState.profile, {
    status: "activa",
    publishedAt: nextState.publishedAt,
    updatedAt: nextState.updatedAt,
  });

  return nextState;
}
