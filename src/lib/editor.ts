import {
  isPageBuilderBlockType,
  type PageBuilderBlock,
} from "@/builders/page-builder/blocks/schema";
import {
  createDefaultFunnelGraph,
  isFunnelNodeType,
  syncFunnelPagesFromNodes,
  type FunnelConnection as VisualFunnelConnection,
  type FunnelGraph as VisualFunnelGraph,
  type FunnelNode as VisualFunnelNode,
  type FunnelPage as VisualFunnelPage,
} from "@/builders/funnel-builder";
import {
  createDefaultStoreBuilderState,
  isCurrencyCode,
  type StoreBuilderState,
} from "@/builders/store-builder/schema";
import { emitShopcodDataUpdated } from "@/lib/live-sync";

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
  pageBuilder: PageBuilderBlock[] | null;
  pageBuilderPages: Record<string, PageBuilderBlock[]> | null;
  funnelBuilder: VisualFunnelGraph | null;
  storeBuilder: StoreBuilderState | null;
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

function normalizePageBuilderBlock(candidate: unknown): PageBuilderBlock | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const block = candidate as Partial<PageBuilderBlock>;

  if (
    typeof block.id !== "string" ||
    typeof block.type !== "string" ||
    !isPageBuilderBlockType(block.type) ||
    !block.content ||
    typeof block.content !== "object" ||
    !block.style ||
    typeof block.style !== "object" ||
    !block.layout ||
    typeof block.layout !== "object" ||
    !Array.isArray(block.children)
  ) {
    return null;
  }

  const normalizedChildren = block.children
    .map((child) => normalizePageBuilderBlock(child))
    .filter((child): child is PageBuilderBlock => Boolean(child));

  return {
    id: block.id,
    type: block.type,
    content: Object.fromEntries(
      Object.entries(block.content).filter(
        (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string",
      ),
    ),
    style: {
      backgroundColor:
        typeof block.style.backgroundColor === "string"
          ? block.style.backgroundColor
          : "#0f172a",
      textColor:
        typeof block.style.textColor === "string" ? block.style.textColor : "#f8fafc",
      align:
        block.style.align === "center" ||
        block.style.align === "right" ||
        block.style.align === "left"
          ? block.style.align
          : "left",
      padding:
        block.style.padding === "compact" ||
        block.style.padding === "spacious" ||
        block.style.padding === "comfortable"
          ? block.style.padding
          : "comfortable",
      margin:
        block.style.margin === "none" ||
        block.style.margin === "sm" ||
        block.style.margin === "md" ||
        block.style.margin === "lg"
          ? block.style.margin
          : "sm",
      radius:
        block.style.radius === "soft" ||
        block.style.radius === "pill" ||
        block.style.radius === "rounded"
          ? block.style.radius
          : "rounded",
      fontFamily:
        block.style.fontFamily === "sans" ||
        block.style.fontFamily === "serif" ||
        block.style.fontFamily === "mono"
          ? block.style.fontFamily
          : "sans",
      fontSize:
        block.style.fontSize === "sm" ||
        block.style.fontSize === "base" ||
        block.style.fontSize === "lg" ||
        block.style.fontSize === "xl"
          ? block.style.fontSize
          : "base",
      borderStyle:
        block.style.borderStyle === "none" ||
        block.style.borderStyle === "solid" ||
        block.style.borderStyle === "dashed"
          ? block.style.borderStyle
          : "solid",
      borderWidth:
        block.style.borderWidth === "none" ||
        block.style.borderWidth === "thin" ||
        block.style.borderWidth === "medium"
          ? block.style.borderWidth
          : "thin",
      borderColor:
        typeof block.style.borderColor === "string"
          ? block.style.borderColor
          : "rgba(255,255,255,0.12)",
    },
    layout: {
      width:
        block.layout.width === "wide" ||
        block.layout.width === "narrow" ||
        block.layout.width === "full"
          ? block.layout.width
          : "full",
      gap:
        block.layout.gap === "tight" ||
        block.layout.gap === "loose" ||
        block.layout.gap === "normal"
          ? block.layout.gap
          : "normal",
      columns:
        typeof block.layout.columns === "number" && Number.isFinite(block.layout.columns)
          ? Math.max(2, Math.trunc(block.layout.columns))
          : 2,
      minHeight:
        block.layout.minHeight === "auto" ||
        block.layout.minHeight === "sm" ||
        block.layout.minHeight === "md" ||
        block.layout.minHeight === "lg"
          ? block.layout.minHeight
          : "auto",
    },
    children: normalizedChildren,
  };
}

function normalizePageBuilder(candidate: unknown) {
  if (!Array.isArray(candidate)) {
    return null;
  }

  return candidate
    .map((block) => normalizePageBuilderBlock(block))
    .filter((block): block is PageBuilderBlock => Boolean(block));
}

function normalizePageBuilderPages(candidate: unknown) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }

  const entries = Object.entries(candidate).flatMap(([key, value]) => {
    const normalizedBlocks = normalizePageBuilder(value);

    if (!normalizedBlocks) {
      return [];
    }

    return [[key, normalizedBlocks] as const];
  });

  return entries.length ? Object.fromEntries(entries) : null;
}

function normalizeFunnelNode(candidate: unknown): VisualFunnelNode | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const node = candidate as Partial<VisualFunnelNode>;

  if (
    typeof node.id !== "string" ||
    typeof node.pageId !== "string" ||
    typeof node.type !== "string" ||
    !isFunnelNodeType(node.type) ||
    !node.position ||
    typeof node.position !== "object" ||
    typeof node.position.x !== "number" ||
    typeof node.position.y !== "number" ||
    !node.analytics ||
    typeof node.analytics !== "object"
  ) {
    return null;
  }

  return {
    id: node.id,
    pageId: node.pageId,
    type: node.type,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
    analytics: {
      visits:
        typeof node.analytics.visits === "number" ? node.analytics.visits : 0,
      clicks:
        typeof node.analytics.clicks === "number" ? node.analytics.clicks : 0,
      conversionRate:
        typeof node.analytics.conversionRate === "number"
          ? node.analytics.conversionRate
          : 0,
    },
  };
}

function normalizeFunnelConnection(
  candidate: unknown,
): VisualFunnelConnection | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const connection = candidate as Partial<VisualFunnelConnection>;

  if (typeof connection.from !== "string" || typeof connection.to !== "string") {
    return null;
  }

  return {
    from: connection.from,
    to: connection.to,
  };
}

function normalizeFunnelPage(candidate: unknown): VisualFunnelPage | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const page = candidate as Partial<VisualFunnelPage>;

  if (
    typeof page.id !== "string" ||
    typeof page.funnelId !== "string" ||
    typeof page.type !== "string" ||
    !isFunnelNodeType(page.type)
  ) {
    return null;
  }

  return {
    id: page.id,
    funnelId: page.funnelId,
    type: page.type,
    contentJson: typeof page.contentJson === "string" ? page.contentJson : "",
  };
}

function normalizeFunnelBuilder(candidate: unknown) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const graph = candidate as Partial<VisualFunnelGraph>;

  if (
    typeof graph.id !== "string" ||
    typeof graph.name !== "string" ||
    !Array.isArray(graph.nodes) ||
    !Array.isArray(graph.connections)
  ) {
    return null;
  }

  const nodes = graph.nodes
    .map((node) => normalizeFunnelNode(node))
    .filter((node): node is VisualFunnelNode => Boolean(node));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const connections = graph.connections
    .map((connection) => normalizeFunnelConnection(connection))
    .filter(
      (connection): connection is VisualFunnelConnection =>
        Boolean(connection) &&
        nodeIds.has(connection.from) &&
        nodeIds.has(connection.to),
    );
  const nodePageIds = new Set(nodes.map((node) => node.pageId));
  const pages = Array.isArray(graph.pages)
    ? graph.pages
        .map((page) => normalizeFunnelPage(page))
        .filter(
          (page): page is VisualFunnelPage =>
            Boolean(page) && nodePageIds.has(page.id),
        )
    : [];

  return syncFunnelPagesFromNodes({
    id: graph.id,
    name: graph.name,
    nodes,
    pages,
    connections,
  } satisfies VisualFunnelGraph);
}

function normalizeStoreBuilder(candidate: unknown) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const storeBuilder = candidate as Partial<StoreBuilderState>;

  if (
    !Array.isArray(storeBuilder.products) ||
    !Array.isArray(storeBuilder.bundles) ||
    !Array.isArray(storeBuilder.collections) ||
    !storeBuilder.checkout ||
    typeof storeBuilder.checkout !== "object"
  ) {
    return null;
  }

  const products = storeBuilder.products.flatMap((product) => {
    if (!product || typeof product !== "object") {
      return [];
    }

    const candidateProduct = product as Partial<StoreBuilderState["products"][number]>;

    if (
      typeof candidateProduct.id !== "string" ||
      typeof candidateProduct.name !== "string" ||
      typeof candidateProduct.description !== "string" ||
      typeof candidateProduct.price !== "number" ||
      !Array.isArray(candidateProduct.images) ||
      !Array.isArray(candidateProduct.variants) ||
      typeof candidateProduct.stock !== "number" ||
      !candidateProduct.prices ||
      typeof candidateProduct.prices !== "object"
    ) {
      return [];
    }

    return [
      {
        id: candidateProduct.id,
        name: candidateProduct.name,
        description: candidateProduct.description,
        price: candidateProduct.price,
        prices: {
          USD:
            typeof candidateProduct.prices.USD === "number"
              ? candidateProduct.prices.USD
              : candidateProduct.price,
          EUR:
            typeof candidateProduct.prices.EUR === "number"
              ? candidateProduct.prices.EUR
              : candidateProduct.price,
          PEN:
            typeof candidateProduct.prices.PEN === "number"
              ? candidateProduct.prices.PEN
              : candidateProduct.price,
        },
        images: candidateProduct.images.filter(
          (image): image is string => typeof image === "string",
        ),
        variants: candidateProduct.variants.filter(
          (variant): variant is string => typeof variant === "string",
        ),
        stock: Math.max(0, Math.trunc(candidateProduct.stock)),
      },
    ];
  });

  const productIds = new Set(products.map((product) => product.id));
  const bundles = storeBuilder.bundles.flatMap((bundle) => {
    if (!bundle || typeof bundle !== "object") {
      return [];
    }

    const candidateBundle = bundle as Partial<StoreBuilderState["bundles"][number]>;

    if (
      typeof candidateBundle.id !== "string" ||
      !Array.isArray(candidateBundle.productIds) ||
      typeof candidateBundle.bundlePrice !== "number"
    ) {
      return [];
    }

    return [
      {
        id: candidateBundle.id,
        productIds: candidateBundle.productIds.filter(
          (productId): productId is string =>
            typeof productId === "string" && productIds.has(productId),
        ),
        bundlePrice: candidateBundle.bundlePrice,
      },
    ];
  });

  const collections = storeBuilder.collections.flatMap((collection) => {
    if (!collection || typeof collection !== "object") {
      return [];
    }

    const candidateCollection = collection as Partial<StoreBuilderState["collections"][number]>;

    if (
      typeof candidateCollection.id !== "string" ||
      typeof candidateCollection.name !== "string" ||
      !Array.isArray(candidateCollection.productIds)
    ) {
      return [];
    }

    return [
      {
        id: candidateCollection.id,
        name: candidateCollection.name,
        productIds: candidateCollection.productIds.filter(
          (productId): productId is string =>
            typeof productId === "string" && productIds.has(productId),
        ),
      },
    ];
  });

  const checkout = storeBuilder.checkout as Partial<StoreBuilderState["checkout"]>;

  return {
    products,
    bundles,
    collections,
    checkout: {
      domains: Array.isArray(checkout.domains)
        ? checkout.domains.filter((domain): domain is string => typeof domain === "string")
        : [],
      enabledCurrencies: Array.isArray(checkout.enabledCurrencies)
        ? checkout.enabledCurrencies.filter(
            (currency): currency is StoreBuilderState["checkout"]["enabledCurrencies"][number] =>
              typeof currency === "string" && isCurrencyCode(currency),
          )
        : [],
      orderBumps: Array.isArray(checkout.orderBumps)
        ? checkout.orderBumps.flatMap((orderBump) => {
            if (!orderBump || typeof orderBump !== "object") {
              return [];
            }

            const candidateOrderBump = orderBump as Partial<
              StoreBuilderState["checkout"]["orderBumps"][number]
            >;

            if (
              typeof candidateOrderBump.productId !== "string" ||
              !productIds.has(candidateOrderBump.productId) ||
              typeof candidateOrderBump.price !== "number" ||
              typeof candidateOrderBump.description !== "string"
            ) {
              return [];
            }

            return [
              {
                productId: candidateOrderBump.productId,
                price: candidateOrderBump.price,
                description: candidateOrderBump.description,
              },
            ];
          })
        : [],
    },
  } satisfies StoreBuilderState;
}

function writeStoreCatalog(items: StoreCatalogItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORE_CATALOG_KEY, JSON.stringify(items));
  emitShopcodDataUpdated();
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

export function deleteStoreDraft(storeId: string) {
  if (!isBrowser()) {
    return [] as StoreCatalogItem[];
  }

  window.localStorage.removeItem(getEditorStorageKey(storeId));

  const nextCatalog = loadStoreCatalog().filter((item) => item.id !== storeId);
  writeStoreCatalog(nextCatalog);
  emitShopcodDataUpdated();
  return nextCatalog;
}

export function removeEditorState(storeId: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(getEditorStorageKey(storeId));
  emitShopcodDataUpdated();
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
      pageBuilder: normalizePageBuilder(parsedValue.pageBuilder),
      pageBuilderPages:
        normalizePageBuilderPages(parsedValue.pageBuilderPages) ??
        (normalizePageBuilder(parsedValue.pageBuilder)
          ? { default: normalizePageBuilder(parsedValue.pageBuilder) ?? [] }
          : null),
      funnelBuilder:
        normalizeFunnelBuilder(parsedValue.funnelBuilder) ?? createDefaultFunnelGraph(),
      storeBuilder:
        normalizeStoreBuilder(parsedValue.storeBuilder) ?? createDefaultStoreBuilderState(),
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
  pageBuilder?: PageBuilderBlock[] | null,
  pageBuilderPages?: Record<string, PageBuilderBlock[]> | null,
  funnelBuilder?: VisualFunnelGraph | null,
  storeBuilder?: StoreBuilderState | null,
) {
  const previousState = loadEditorState(storeId);
  const nextState: StoredEditorState = {
    blocks,
    profile: profile ?? previousState?.profile ?? null,
    pageBuilder: pageBuilder ?? previousState?.pageBuilder ?? null,
    pageBuilderPages: pageBuilderPages ?? previousState?.pageBuilderPages ?? null,
    funnelBuilder: funnelBuilder ?? previousState?.funnelBuilder ?? createDefaultFunnelGraph(),
    storeBuilder: storeBuilder ?? previousState?.storeBuilder ?? createDefaultStoreBuilderState(),
    updatedAt: new Date().toISOString(),
    publishedAt: previousState?.publishedAt ?? null,
  };

  if (isBrowser()) {
    window.localStorage.setItem(getEditorStorageKey(storeId), JSON.stringify(nextState));
    emitShopcodDataUpdated();
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
  pageBuilder?: PageBuilderBlock[] | null,
  pageBuilderPages?: Record<string, PageBuilderBlock[]> | null,
  funnelBuilder?: VisualFunnelGraph | null,
  storeBuilder?: StoreBuilderState | null,
) {
  const baseState =
    loadEditorState(storeId) ??
    (fallbackBlocks
      ? {
          blocks: fallbackBlocks,
          profile: profile ?? null,
          pageBuilder: pageBuilder ?? null,
          pageBuilderPages: pageBuilderPages ?? null,
          funnelBuilder: funnelBuilder ?? createDefaultFunnelGraph(),
          storeBuilder: storeBuilder ?? createDefaultStoreBuilderState(),
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
    pageBuilder: pageBuilder ?? baseState.pageBuilder ?? null,
    pageBuilderPages: pageBuilderPages ?? baseState.pageBuilderPages ?? null,
    funnelBuilder: funnelBuilder ?? baseState.funnelBuilder ?? createDefaultFunnelGraph(),
    storeBuilder: storeBuilder ?? baseState.storeBuilder ?? createDefaultStoreBuilderState(),
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(getEditorStorageKey(storeId), JSON.stringify(nextState));
    emitShopcodDataUpdated();
  }

  upsertStoreCatalogItem(storeId, nextState.profile, {
    status: "activa",
    publishedAt: nextState.publishedAt,
    updatedAt: nextState.updatedAt,
  });

  return nextState;
}
