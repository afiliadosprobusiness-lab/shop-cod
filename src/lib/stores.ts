import { defaultBlockData } from "@/components/editor/block-config";
import {
  createDefaultStoreBuilderState,
  supportedCurrencies,
  type CurrencyCode,
} from "@/builders/store-builder/schema";
import {
  loadEditorState,
  removeEditorState,
  saveEditorState,
  type FunnelBlock,
  type StoreProfile,
} from "@/lib/editor";
import { emitShopcodDataUpdated } from "@/lib/live-sync";

export type StoreCurrency = CurrencyCode;
export type StorePaymentMethod = "separateCheckout" | "productPagePayment";
export type StoreTemplateId = "singleProduct" | "catalog" | "flashSale";
export type StorePageType = "home" | "catalog" | "product" | "checkout" | "thankyou";

export interface StorePage {
  id: string;
  name: string;
  type: StorePageType;
}

export interface StoreTemplate {
  id: StoreTemplateId;
  name: string;
  category: string;
  description: string;
  productName: string;
  pages: StorePage[];
}

export interface PaymentMethodOption {
  id: StorePaymentMethod;
  title: string;
  description: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  currency: StoreCurrency;
  pages: StorePage[];
  paymentMethod: StorePaymentMethod;
  templateId: StoreTemplateId;
  createdAt: string;
  updatedAt: string;
}

export interface StoreInput {
  name: string;
  slug: string;
  currency: StoreCurrency;
  templateId: StoreTemplateId;
  paymentMethod: StorePaymentMethod;
}

export type StoreDashboardSectionId =
  | "summary"
  | "products"
  | "collections"
  | "orders"
  | "pages"
  | "languages"
  | "settings";

export interface StoreDashboardMetrics {
  visitors: number;
  orders: number;
  sales: number;
  conversionRate: number;
}

export interface StoreTopProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  stock: number;
}

export interface StoreTrafficSource {
  source: string;
  visitors: number;
  orders: number;
  conversionRate: number;
}

export interface StoreLanguage {
  code: string;
  label: string;
  status: "principal" | "activo" | "borrador";
}

export interface StoreDashboardSnapshot {
  store: Store;
  metrics: StoreDashboardMetrics;
  topProducts: StoreTopProduct[];
  trafficSources: StoreTrafficSource[];
  languages: StoreLanguage[];
}

const STORES_STORAGE_KEY = "shopcod-stores-v1";

const storeTemplates: StoreTemplate[] = [
  {
    id: "singleProduct",
    name: "One Product",
    category: "Direct response",
    description: "Ideal para una oferta principal con foco total en conversion y checkout rapido.",
    productName: "Producto estrella",
    pages: [
      { id: "page-home", name: "Home", type: "home" },
      { id: "page-product", name: "Producto", type: "product" },
      { id: "page-checkout", name: "Checkout", type: "checkout" },
      { id: "page-thankyou", name: "Thank you", type: "thankyou" },
    ],
  },
  {
    id: "catalog",
    name: "Catalog",
    category: "Ecommerce",
    description: "Pensada para multiples productos con catalogo visible y ruta clara hacia compra.",
    productName: "Coleccion principal",
    pages: [
      { id: "page-home", name: "Home", type: "home" },
      { id: "page-catalog", name: "Catalogo", type: "catalog" },
      { id: "page-product", name: "Producto", type: "product" },
      { id: "page-checkout", name: "Checkout", type: "checkout" },
      { id: "page-thankyou", name: "Thank you", type: "thankyou" },
    ],
  },
  {
    id: "flashSale",
    name: "Flash Sale",
    category: "Campana",
    description: "Preparada para lanzamientos cortos con urgencia y una secuencia compacta.",
    productName: "Oferta flash",
    pages: [
      { id: "page-home", name: "Home", type: "home" },
      { id: "page-product", name: "Oferta", type: "product" },
      { id: "page-checkout", name: "Checkout", type: "checkout" },
      { id: "page-thankyou", name: "Thank you", type: "thankyou" },
    ],
  },
];

const paymentMethodOptions: PaymentMethodOption[] = [
  {
    id: "separateCheckout",
    title: "Checkout separado",
    description: "Mantiene una pagina exclusiva para el pago y reduce ruido antes del cierre.",
  },
  {
    id: "productPagePayment",
    title: "Pago en pagina de producto",
    description: "Integra el pago en la ficha de producto para una compra mas directa y corta.",
  },
];

const seedStores: Store[] = [
  {
    id: "store-201",
    name: "Glow Market",
    slug: "glow-market",
    currency: "USD",
    pages: createPagesForStore(storeTemplates[1], "separateCheckout"),
    paymentMethod: "separateCheckout",
    templateId: "catalog",
    createdAt: "2026-03-02T15:00:00.000Z",
    updatedAt: "2026-03-03T18:40:00.000Z",
  },
  {
    id: "store-202",
    name: "Sprint Offers",
    slug: "sprint-offers",
    currency: "PEN",
    pages: createPagesForStore(storeTemplates[2], "productPagePayment"),
    paymentMethod: "productPagePayment",
    templateId: "flashSale",
    createdAt: "2026-02-28T11:30:00.000Z",
    updatedAt: "2026-03-01T09:10:00.000Z",
  },
];

function clonePages(pages: StorePage[]) {
  return pages.map((page) => ({ ...page }));
}

function cloneSeedStores() {
  return seedStores.map((store) => ({
    ...store,
    pages: clonePages(store.pages),
  }));
}

function createEntityId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createPageId(baseId: string) {
  return `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredStores() {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORES_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Store[];

    if (!Array.isArray(parsedValue)) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

function writeStoredStores(stores: Store[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  emitShopcodDataUpdated();
}

function normalizeStorePage(candidate: unknown): StorePage | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const page = candidate as Partial<StorePage>;

  if (
    typeof page.id !== "string" ||
    typeof page.name !== "string" ||
    (page.type !== "home" &&
      page.type !== "catalog" &&
      page.type !== "product" &&
      page.type !== "checkout" &&
      page.type !== "thankyou")
  ) {
    return null;
  }

  return {
    id: page.id,
    name: page.name,
    type: page.type,
  };
}

function normalizeStore(candidate: unknown): Store | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const store = candidate as Partial<Store>;
  const hasValidCurrency = supportedCurrencies.some((currency) => currency === store.currency);

  if (
    typeof store.id !== "string" ||
    typeof store.name !== "string" ||
    typeof store.slug !== "string" ||
    !hasValidCurrency ||
    !Array.isArray(store.pages) ||
    (store.paymentMethod !== "separateCheckout" &&
      store.paymentMethod !== "productPagePayment") ||
    (store.templateId !== "singleProduct" &&
      store.templateId !== "catalog" &&
      store.templateId !== "flashSale")
  ) {
    return null;
  }

  const pages = store.pages
    .map((page) => normalizeStorePage(page))
    .filter((page): page is StorePage => Boolean(page));

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    currency: store.currency,
    pages,
    paymentMethod: store.paymentMethod,
    templateId: store.templateId,
    createdAt: typeof store.createdAt === "string" ? store.createdAt : new Date().toISOString(),
    updatedAt: typeof store.updatedAt === "string" ? store.updatedAt : new Date().toISOString(),
  };
}

function templateById(templateId: StoreTemplateId) {
  return storeTemplates.find((template) => template.id === templateId) ?? storeTemplates[0];
}

function hashValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function buildDashboardMetrics(store: Store): StoreDashboardMetrics {
  const seed = hashValue(`${store.id}:${store.slug}:${store.currency}`);
  const visitors = 2800 + (seed % 17500);
  const conversionBoost = store.paymentMethod === "productPagePayment" ? 0.45 : 0;
  const conversionRate = Number((1.65 + (seed % 190) / 100 + conversionBoost).toFixed(2));
  const orders = Math.max(18, Math.round((visitors * conversionRate) / 100));
  const averageTicketByCurrency: Record<StoreCurrency, number> = {
    USD: 52,
    EUR: 48,
    PEN: 189,
  };
  const pageFactor = 1 + Math.max(0, store.pages.length - 3) * 0.08;
  const sales = Number((orders * averageTicketByCurrency[store.currency] * pageFactor).toFixed(2));

  return {
    visitors,
    orders,
    sales,
    conversionRate,
  };
}

function buildTopProducts(store: Store, orders: number): StoreTopProduct[] {
  ensureEditorDraft(store);
  const builderState = loadEditorState(store.id)?.storeBuilder;
  const products = builderState?.products ?? [];

  if (products.length === 0) {
    return [];
  }

  return products.slice(0, 3).map((product, index) => {
    const divisor = index + 2;
    const unitsSold = Math.max(6, Math.round(orders / divisor));

    return {
      id: product.id,
      name: product.name,
      unitsSold,
      revenue: Number((unitsSold * product.price).toFixed(2)),
      stock: product.stock,
    };
  });
}

function buildTrafficSources(store: Store, metrics: StoreDashboardMetrics): StoreTrafficSource[] {
  const baseSources = [
    { source: "Meta Ads", share: 0.34 },
    { source: "TikTok Ads", share: 0.27 },
    { source: "Organico", share: 0.22 },
    { source: "Referidos", share: 0.17 },
  ] as const;
  const sourceSeed = hashValue(`${store.slug}:${store.updatedAt}`);

  return baseSources.map((item, index) => {
    const visitors = Math.max(120, Math.round(metrics.visitors * item.share));
    const adjustment = ((sourceSeed >> (index * 3)) % 35) / 100;
    const conversionRate = Number(
      Math.max(0.8, metrics.conversionRate - 0.45 + adjustment).toFixed(2),
    );
    const orders = Math.max(4, Math.round((visitors * conversionRate) / 100));

    return {
      source: item.source,
      visitors,
      orders,
      conversionRate,
    };
  });
}

function buildLanguages(store: Store): StoreLanguage[] {
  const baseLanguages: Record<StoreCurrency, StoreLanguage[]> = {
    USD: [
      { code: "en-US", label: "English (US)", status: "principal" },
      { code: "es-LATAM", label: "Espanol", status: "activo" },
    ],
    EUR: [
      { code: "es-ES", label: "Espanol", status: "principal" },
      { code: "en-GB", label: "English", status: "activo" },
      { code: "fr-FR", label: "Frances", status: "borrador" },
    ],
    PEN: [
      { code: "es-PE", label: "Espanol (PE)", status: "principal" },
      { code: "en-US", label: "English", status: "activo" },
    ],
  };

  return baseLanguages[store.currency];
}

function buildStoreProfile(store: Store, template: StoreTemplate): StoreProfile {
  const priceByCurrency: Record<StoreCurrency, string> = {
    USD: "$49.00",
    EUR: "EUR 45.00",
    PEN: "S/ 179.00",
  };

  return {
    storeName: store.name,
    productName: template.productName,
    headline:
      store.paymentMethod === "productPagePayment"
        ? `${store.name} vende en una sola pagina`
        : `${store.name} listo para checkout dedicado`,
    subheadline:
      store.paymentMethod === "productPagePayment"
        ? "Reduce pasos y deja el pago integrado en la pagina de producto."
        : "Mantiene una ruta clara entre descubrimiento, checkout y confirmacion.",
    price: priceByCurrency[store.currency],
    originalPrice: store.paymentMethod === "productPagePayment" ? "" : priceByCurrency[store.currency],
    ctaText:
      store.paymentMethod === "productPagePayment" ? "Comprar en esta pagina" : "Ir al checkout",
    category: template.category,
  };
}

function createBlocksForStore(store: Store, template: StoreTemplate): FunnelBlock[] {
  const profile = buildStoreProfile(store, template);

  return [
    {
      id: createEntityId("b"),
      type: "hero",
      data: {
        ...defaultBlockData.hero,
        title: profile.headline,
        subtitle: profile.subheadline,
        price: profile.price,
        originalPrice: profile.originalPrice,
        ctaText: profile.ctaText,
      },
    },
    {
      id: createEntityId("b"),
      type: "benefits",
      data: {
        ...defaultBlockData.benefits,
        title: `${template.name} con ${store.pages.length} paginas operativas`,
      },
    },
    {
      id: createEntityId("b"),
      type: "reviews",
      data: {
        ...defaultBlockData.reviews,
        title: "Prueba social para reforzar confianza antes del pedido",
      },
    },
    {
      id: createEntityId("b"),
      type: "checkout",
      data: {
        ...defaultBlockData.checkout,
        title:
          store.paymentMethod === "productPagePayment"
            ? "Pago embebido en la pagina de producto"
            : `Checkout separado en ${store.currency}`,
      },
    },
    {
      id: createEntityId("b"),
      type: "cta",
      data: {
        ...defaultBlockData.cta,
        title: `Activa ${store.name}`,
        subtitle: `${template.name} configurada con ${paymentMethodOptions.find((option) => option.id === store.paymentMethod)?.title.toLowerCase()}.`,
        ctaText: "Seguir en editor",
      },
    },
  ];
}

function ensureEditorDraft(store: Store) {
  if (loadEditorState(store.id)) {
    return;
  }

  const template = templateById(store.templateId);
  const profile = buildStoreProfile(store, template);
  const blocks = createBlocksForStore(store, template);

  saveEditorState(
    store.id,
    blocks,
    profile,
    undefined,
    undefined,
    undefined,
    createDefaultStoreBuilderState({
      storeName: store.name,
      productName: template.productName,
      subheadline: profile.subheadline,
      price: profile.price,
    }),
  );
}

function ensureUniqueSlug(baseSlug: string, stores: Store[]) {
  const normalizedBase = slugifyStoreName(baseSlug) || "nueva-tienda";
  let candidate = normalizedBase;
  let counter = 2;

  while (stores.some((store) => store.slug === candidate)) {
    candidate = `${normalizedBase}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function sortStores(stores: Store[]) {
  return [...stores].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function createPagesForStore(
  template: StoreTemplate,
  paymentMethod: StorePaymentMethod,
) {
  const basePages = clonePages(template.pages);
  const configuredPages =
    paymentMethod === "productPagePayment"
      ? basePages
          .filter((page) => page.type !== "checkout")
          .map((page) =>
            page.type === "product"
              ? {
                  ...page,
                  name: `${page.name} + Pago`,
                }
              : page,
          )
      : basePages;

  return configuredPages.map((page) => ({
    ...page,
    id: createPageId(page.id),
  }));
}

export function slugifyStoreName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function getStoreTemplates() {
  return storeTemplates.map((template) => ({
    ...template,
    pages: clonePages(template.pages),
  }));
}

export function getStoreTemplate(templateId: StoreTemplateId) {
  const template = templateById(templateId);

  return {
    ...template,
    pages: clonePages(template.pages),
  };
}

export function getPaymentMethodOptions() {
  return paymentMethodOptions.map((option) => ({ ...option }));
}

export function loadStores() {
  const storedStores = readStoredStores();
  const normalizedStores = storedStores
    ?.map((store) => normalizeStore(store))
    .filter((store): store is Store => Boolean(store));

  return sortStores(normalizedStores?.length ? normalizedStores : cloneSeedStores());
}

export function loadStoreById(storeId: string) {
  return loadStores().find((store) => store.id === storeId) ?? null;
}

export function ensureStoreEditorDraft(storeId: string) {
  const store = loadStoreById(storeId);

  if (!store) {
    return null;
  }

  ensureEditorDraft(store);
  return store;
}

export function getStoreDashboardSnapshot(storeId: string) {
  const store = ensureStoreEditorDraft(storeId);

  if (!store) {
    return null;
  }

  const metrics = buildDashboardMetrics(store);

  return {
    store,
    metrics,
    topProducts: buildTopProducts(store, metrics.orders),
    trafficSources: buildTrafficSources(store, metrics),
    languages: buildLanguages(store),
  } satisfies StoreDashboardSnapshot;
}

export function saveStore(input: StoreInput) {
  const currentStores = loadStores();
  const template = templateById(input.templateId);
  const now = new Date().toISOString();
  const store: Store = {
    id: createEntityId("store"),
    name: input.name.trim() || "Nueva tienda",
    slug: ensureUniqueSlug(input.slug || input.name, currentStores),
    currency: input.currency,
    pages: createPagesForStore(template, input.paymentMethod),
    paymentMethod: input.paymentMethod,
    templateId: template.id,
    createdAt: now,
    updatedAt: now,
  };

  writeStoredStores(sortStores([store, ...currentStores]));
  ensureEditorDraft(store);
  return store;
}

export function deleteStore(storeId: string) {
  const currentStores = loadStores();
  const nextStores = currentStores.filter((store) => store.id !== storeId);

  if (nextStores.length === currentStores.length) {
    return null;
  }

  writeStoredStores(sortStores(nextStores));
  removeEditorState(storeId);
  return nextStores;
}
