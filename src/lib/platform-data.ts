import { firebaseApp, hasFirebaseConfig } from "@/lib/firebase";
import { loadFunnels } from "@/lib/funnels";
import { emitShopcodDataUpdated } from "@/lib/live-sync";
import { consumeProductInventory, loadProducts } from "@/lib/products";
import { loadStores } from "@/lib/stores";

export type PlatformOrderStatus =
  | "new"
  | "confirmed"
  | "fulfilled"
  | "cancelled";

export type PlatformContactKind = "buyer" | "lead";
export type PlatformEventType = "page_view" | "checkout_started" | "order_placed";

export interface PlatformOrderItem {
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PlatformOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  notes: string;
  quantity: number;
  total: number;
  currency: "USD" | "PEN";
  status: PlatformOrderStatus;
  source: "checkout";
  storeId: string | null;
  funnelId: string | null;
  items: PlatformOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformContact {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  department: string;
  kind: PlatformContactKind;
  source: "checkout";
  lastOrderId: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformEvent {
  id: string;
  type: PlatformEventType;
  path: string;
  visitorId: string;
  createdAt: string;
}

export interface BundleOffer {
  id: string;
  type: "bundle";
  name: string;
  description: string;
  productIds: string[];
  bundlePrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountOffer {
  id: string;
  type: "discount";
  name: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  value: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PlatformOffer = BundleOffer | DiscountOffer;

export interface PlatformSettings {
  accountName: string;
  ownerEmail: string;
  supportEmail: string;
  subdomain: string;
  legalName: string;
  companyName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  timezone: string;
}

export interface PlatformSalesPoint {
  label: string;
  sales: number;
  orders: number;
}

export interface PlatformTopProduct {
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface PlatformAnalyticsSnapshot {
  visitors: number;
  pageViews: number;
  checkoutsStarted: number;
  orders: number;
  contacts: number;
  sales: number;
  avgTicket: number;
  conversionRate: number;
  catalogValue: number;
  activeStores: number;
  activeFunnels: number;
  salesByDay: PlatformSalesPoint[];
  topProducts: PlatformTopProduct[];
}

interface CloudPlatformState {
  orders: PlatformOrder[];
  contacts: PlatformContact[];
  offers: PlatformOffer[];
  settings: PlatformSettings;
  events: PlatformEvent[];
  updatedAt: string;
}

export interface SaveCodOrderInput {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  notes?: string;
  quantity: number;
  unitPrice: number;
  currency?: "USD" | "PEN";
  productId?: string | null;
  productName: string;
  storeId?: string | null;
  funnelId?: string | null;
}

export interface SaveBundleOfferInput {
  name: string;
  description: string;
  productIds: string[];
  bundlePrice: number;
}

export interface SaveDiscountOfferInput {
  name: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  value: number;
}

const ORDERS_STORAGE_KEY = "shopcod-orders-v1";
const CONTACTS_STORAGE_KEY = "shopcod-contacts-v1";
const OFFERS_STORAGE_KEY = "shopcod-offers-v1";
const SETTINGS_STORAGE_KEY = "shopcod-settings-v1";
const EVENTS_STORAGE_KEY = "shopcod-events-v1";
const VISITOR_ID_STORAGE_KEY = "shopcod-visitor-id";
const CLOUD_SYNC_META_KEY = "shopcod-cloud-sync-meta-v1";
const CLOUD_COLLECTION = "shopcod";
const CLOUD_DOC_ID = "platform-state";

const defaultSettings: PlatformSettings = {
  accountName: "ShopCOD Workspace",
  ownerEmail: "owner@shopcod.app",
  supportEmail: "support@shopcod.app",
  subdomain: "my-shopcod-workspace",
  legalName: "ShopCOD LLC",
  companyName: "ShopCOD",
  phone: "+1 555 010 2026",
  addressLine1: "742 Evergreen Avenue",
  addressLine2: "Suite 200",
  city: "Miami",
  postalCode: "33101",
  country: "United States",
  timezone: "(GMT-05:00) America/Lima",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createEntityId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStorage<T>(key: string) {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function mergeByRecency<
  T extends {
    id: string;
    updatedAt?: string;
    createdAt?: string;
  },
>(localItems: T[], remoteItems: T[]) {
  const merged = new Map<string, T>();

  for (const item of [...localItems, ...remoteItems]) {
    const current = merged.get(item.id);
    const currentTimestamp = current?.updatedAt || current?.createdAt || "";
    const itemTimestamp = item.updatedAt || item.createdAt || "";

    if (!current || itemTimestamp >= currentTimestamp) {
      merged.set(item.id, item);
    }
  }

  return [...merged.values()];
}

function getVisitorId() {
  if (!canUseStorage()) {
    return "visitor-server";
  }

  const currentVisitorId = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);

  if (currentVisitorId) {
    return currentVisitorId;
  }

  const nextVisitorId = createEntityId("visitor");
  window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, nextVisitorId);
  return nextVisitorId;
}

async function getCloudDocumentTools() {
  if (!canUseStorage() || !hasFirebaseConfig()) {
    return null;
  }

  try {
    const { doc, getDoc, getFirestore, setDoc } = await import("firebase/firestore");
    const firestore = getFirestore(firebaseApp);
    const documentRef = doc(firestore, CLOUD_COLLECTION, CLOUD_DOC_ID);

    return {
      documentRef,
      getDoc,
      setDoc,
    };
  } catch {
    return null;
  }
}

function readCloudSyncMeta() {
  return readStorage<{ hydratedAt?: string }>(CLOUD_SYNC_META_KEY) ?? {};
}

function writeCloudSyncMeta(meta: { hydratedAt: string }) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CLOUD_SYNC_META_KEY, JSON.stringify(meta));
}

async function pushCloudState() {
  const tools = await getCloudDocumentTools();

  if (!tools) {
    return;
  }

  const payload: CloudPlatformState = {
    orders: loadOrders(),
    contacts: loadContacts(),
    offers: loadOffers(),
    settings: loadPlatformSettings(),
    events: loadPlatformEvents(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await tools.setDoc(tools.documentRef, payload);
    writeCloudSyncMeta({ hydratedAt: payload.updatedAt });
  } catch {
    // Keep local persistence as the source of truth when remote sync fails.
  }
}

let cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;
let cloudBootstrapPromise: Promise<void> | null = null;

function queueCloudSync() {
  if (!canUseStorage() || !hasFirebaseConfig()) {
    return;
  }

  if (cloudSyncTimer) {
    clearTimeout(cloudSyncTimer);
  }

  cloudSyncTimer = setTimeout(() => {
    void pushCloudState();
    cloudSyncTimer = null;
  }, 250);
}

function writeStorage<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  queueCloudSync();
  emitShopcodDataUpdated();
}

function normalizeOrderItem(candidate: unknown): PlatformOrderItem | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const item = candidate as Partial<PlatformOrderItem>;

  if (typeof item.productName !== "string") {
    return null;
  }

  return {
    productId: typeof item.productId === "string" ? item.productId : null,
    productName: item.productName,
    quantity:
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.max(1, Math.trunc(item.quantity))
        : 1,
    unitPrice:
      typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice)
        ? Math.max(0, item.unitPrice)
        : 0,
  };
}

function normalizeOrder(candidate: unknown): PlatformOrder | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const order = candidate as Partial<PlatformOrder>;

  if (
    typeof order.id !== "string" ||
    typeof order.customerName !== "string" ||
    typeof order.phone !== "string" ||
    typeof order.address !== "string" ||
    typeof order.city !== "string" ||
    typeof order.department !== "string" ||
    !Array.isArray(order.items)
  ) {
    return null;
  }

  return {
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    city: order.city,
    department: order.department,
    notes: typeof order.notes === "string" ? order.notes : "",
    quantity:
      typeof order.quantity === "number" && Number.isFinite(order.quantity)
        ? Math.max(1, Math.trunc(order.quantity))
        : 1,
    total:
      typeof order.total === "number" && Number.isFinite(order.total)
        ? Math.max(0, order.total)
        : 0,
    currency: order.currency === "USD" ? "USD" : "PEN",
    status:
      order.status === "confirmed" ||
      order.status === "fulfilled" ||
      order.status === "cancelled"
        ? order.status
        : "new",
    source: "checkout",
    storeId: typeof order.storeId === "string" ? order.storeId : null,
    funnelId: typeof order.funnelId === "string" ? order.funnelId : null,
    items: order.items
      .map((item) => normalizeOrderItem(item))
      .filter((item): item is PlatformOrderItem => Boolean(item)),
    createdAt:
      typeof order.createdAt === "string" ? order.createdAt : new Date().toISOString(),
    updatedAt:
      typeof order.updatedAt === "string" ? order.updatedAt : new Date().toISOString(),
  };
}

function normalizeContact(candidate: unknown): PlatformContact | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const contact = candidate as Partial<PlatformContact>;

  if (
    typeof contact.id !== "string" ||
    typeof contact.fullName !== "string" ||
    typeof contact.phone !== "string"
  ) {
    return null;
  }

  return {
    id: contact.id,
    fullName: contact.fullName,
    phone: contact.phone,
    city: typeof contact.city === "string" ? contact.city : "",
    department: typeof contact.department === "string" ? contact.department : "",
    kind: contact.kind === "lead" ? "lead" : "buyer",
    source: "checkout",
    lastOrderId: typeof contact.lastOrderId === "string" ? contact.lastOrderId : null,
    totalOrders:
      typeof contact.totalOrders === "number" && Number.isFinite(contact.totalOrders)
        ? Math.max(0, Math.trunc(contact.totalOrders))
        : 0,
    totalSpent:
      typeof contact.totalSpent === "number" && Number.isFinite(contact.totalSpent)
        ? Math.max(0, contact.totalSpent)
        : 0,
    createdAt:
      typeof contact.createdAt === "string" ? contact.createdAt : new Date().toISOString(),
    updatedAt:
      typeof contact.updatedAt === "string" ? contact.updatedAt : new Date().toISOString(),
  };
}

function normalizeEvent(candidate: unknown): PlatformEvent | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const event = candidate as Partial<PlatformEvent>;

  if (
    typeof event.id !== "string" ||
    typeof event.path !== "string" ||
    typeof event.visitorId !== "string"
  ) {
    return null;
  }

  return {
    id: event.id,
    type:
      event.type === "checkout_started" || event.type === "order_placed"
        ? event.type
        : "page_view",
    path: event.path,
    visitorId: event.visitorId,
    createdAt:
      typeof event.createdAt === "string" ? event.createdAt : new Date().toISOString(),
  };
}

function normalizeOffer(candidate: unknown): PlatformOffer | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const offer = candidate as Partial<PlatformOffer>;
  const now = new Date().toISOString();

  if (offer.type === "bundle") {
    return {
      id: typeof offer.id === "string" ? offer.id : createEntityId("offer"),
      type: "bundle",
      name: typeof offer.name === "string" ? offer.name : "Nuevo bundle",
      description: typeof offer.description === "string" ? offer.description : "",
      productIds: Array.isArray(offer.productIds)
        ? offer.productIds.filter((productId): productId is string => typeof productId === "string")
        : [],
      bundlePrice:
        typeof offer.bundlePrice === "number" && Number.isFinite(offer.bundlePrice)
          ? Math.max(0, offer.bundlePrice)
          : 0,
      active: offer.active !== false,
      createdAt: typeof offer.createdAt === "string" ? offer.createdAt : now,
      updatedAt: typeof offer.updatedAt === "string" ? offer.updatedAt : now,
    };
  }

  if (offer.type === "discount") {
    return {
      id: typeof offer.id === "string" ? offer.id : createEntityId("offer"),
      type: "discount",
      name: typeof offer.name === "string" ? offer.name : "Nuevo descuento",
      code: typeof offer.code === "string" ? offer.code : "SHOPCOD",
      description: typeof offer.description === "string" ? offer.description : "",
      discountType: offer.discountType === "fixed" ? "fixed" : "percentage",
      value:
        typeof offer.value === "number" && Number.isFinite(offer.value)
          ? Math.max(0, offer.value)
          : 0,
      active: offer.active !== false,
      createdAt: typeof offer.createdAt === "string" ? offer.createdAt : now,
      updatedAt: typeof offer.updatedAt === "string" ? offer.updatedAt : now,
    };
  }

  return null;
}

function normalizeSettings(candidate: unknown): PlatformSettings {
  if (!candidate || typeof candidate !== "object") {
    return { ...defaultSettings };
  }

  const settings = candidate as Partial<PlatformSettings>;

  return {
    accountName:
      typeof settings.accountName === "string" ? settings.accountName : defaultSettings.accountName,
    ownerEmail:
      typeof settings.ownerEmail === "string" ? settings.ownerEmail : defaultSettings.ownerEmail,
    supportEmail:
      typeof settings.supportEmail === "string"
        ? settings.supportEmail
        : defaultSettings.supportEmail,
    subdomain:
      typeof settings.subdomain === "string" ? settings.subdomain : defaultSettings.subdomain,
    legalName:
      typeof settings.legalName === "string" ? settings.legalName : defaultSettings.legalName,
    companyName:
      typeof settings.companyName === "string"
        ? settings.companyName
        : defaultSettings.companyName,
    phone: typeof settings.phone === "string" ? settings.phone : defaultSettings.phone,
    addressLine1:
      typeof settings.addressLine1 === "string"
        ? settings.addressLine1
        : defaultSettings.addressLine1,
    addressLine2:
      typeof settings.addressLine2 === "string"
        ? settings.addressLine2
        : defaultSettings.addressLine2,
    city: typeof settings.city === "string" ? settings.city : defaultSettings.city,
    postalCode:
      typeof settings.postalCode === "string"
        ? settings.postalCode
        : defaultSettings.postalCode,
    country:
      typeof settings.country === "string" ? settings.country : defaultSettings.country,
    timezone:
      typeof settings.timezone === "string" ? settings.timezone : defaultSettings.timezone,
  };
}

function writeContacts(contacts: PlatformContact[]) {
  writeStorage(CONTACTS_STORAGE_KEY, contacts);
}

function saveContactFromOrder(order: PlatformOrder) {
  const contacts = loadContacts();
  const existingContact = contacts.find((contact) => contact.phone === order.phone);
  const now = new Date().toISOString();

  const nextContact: PlatformContact = {
    id: existingContact?.id ?? createEntityId("contact"),
    fullName: order.customerName,
    phone: order.phone,
    city: order.city,
    department: order.department,
    kind: "buyer",
    source: "checkout",
    lastOrderId: order.id,
    totalOrders: (existingContact?.totalOrders ?? 0) + 1,
    totalSpent: Number(((existingContact?.totalSpent ?? 0) + order.total).toFixed(2)),
    createdAt: existingContact?.createdAt ?? now,
    updatedAt: now,
  };

  writeContacts([
    nextContact,
    ...contacts.filter((contact) => contact.id !== nextContact.id),
  ]);
}

function readSalesByDay(orders: PlatformOrder[]) {
  const grouped = new Map<string, PlatformSalesPoint>();

  for (const order of orders) {
    const label = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const current = grouped.get(label);

    grouped.set(label, {
      label,
      sales: Number(((current?.sales ?? 0) + order.total).toFixed(2)),
      orders: (current?.orders ?? 0) + 1,
    });
  }

  return [...grouped.values()].slice(-7);
}

function readTopProducts(orders: PlatformOrder[]) {
  const grouped = new Map<string, PlatformTopProduct>();

  for (const order of orders) {
    for (const item of order.items) {
      const current = grouped.get(item.productName);

      grouped.set(item.productName, {
        name: item.productName,
        unitsSold: (current?.unitsSold ?? 0) + item.quantity,
        revenue: Number(
          (((current?.revenue ?? 0) + item.quantity * item.unitPrice)).toFixed(2),
        ),
      });
    }
  }

  return [...grouped.values()]
    .sort((left, right) => right.unitsSold - left.unitsSold)
    .slice(0, 5);
}

export function loadOrders() {
  const storedOrders = readStorage<unknown[]>(ORDERS_STORAGE_KEY);

  if (!Array.isArray(storedOrders)) {
    return [] as PlatformOrder[];
  }

  return storedOrders
    .map((order) => normalizeOrder(order))
    .filter((order): order is PlatformOrder => Boolean(order))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function loadContacts() {
  const storedContacts = readStorage<unknown[]>(CONTACTS_STORAGE_KEY);

  if (!Array.isArray(storedContacts)) {
    return [] as PlatformContact[];
  }

  return storedContacts
    .map((contact) => normalizeContact(contact))
    .filter((contact): contact is PlatformContact => Boolean(contact))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function loadPlatformEvents() {
  const storedEvents = readStorage<unknown[]>(EVENTS_STORAGE_KEY);

  if (!Array.isArray(storedEvents)) {
    return [] as PlatformEvent[];
  }

  return storedEvents
    .map((event) => normalizeEvent(event))
    .filter((event): event is PlatformEvent => Boolean(event))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function loadOffers() {
  const storedOffers = readStorage<unknown[]>(OFFERS_STORAGE_KEY);

  if (!Array.isArray(storedOffers)) {
    return [] as PlatformOffer[];
  }

  return storedOffers
    .map((offer) => normalizeOffer(offer))
    .filter((offer): offer is PlatformOffer => Boolean(offer))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function loadPlatformSettings() {
  return normalizeSettings(readStorage<unknown>(SETTINGS_STORAGE_KEY));
}

export function recordPlatformEvent(type: PlatformEventType, path: string) {
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return null;
  }

  const event: PlatformEvent = {
    id: createEntityId("evt"),
    type,
    path: normalizedPath,
    visitorId: getVisitorId(),
    createdAt: new Date().toISOString(),
  };

  writeStorage(EVENTS_STORAGE_KEY, [event, ...loadPlatformEvents()].slice(0, 500));
  return event;
}

export async function bootstrapPlatformCloudState() {
  if (cloudBootstrapPromise) {
    return cloudBootstrapPromise;
  }

  cloudBootstrapPromise = (async () => {
    const tools = await getCloudDocumentTools();

    if (!tools) {
      return;
    }

    try {
      const snapshot = await tools.getDoc(tools.documentRef);

      if (!snapshot.exists()) {
        return;
      }

      const remote = snapshot.data() as Partial<CloudPlatformState>;
      const nextOrders = mergeByRecency(
        loadOrders(),
        Array.isArray(remote.orders)
          ? remote.orders
              .map((order) => normalizeOrder(order))
              .filter((order): order is PlatformOrder => Boolean(order))
          : [],
      ).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      const nextContacts = mergeByRecency(
        loadContacts(),
        Array.isArray(remote.contacts)
          ? remote.contacts
              .map((contact) => normalizeContact(contact))
              .filter((contact): contact is PlatformContact => Boolean(contact))
          : [],
      ).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      const nextOffers = mergeByRecency(
        loadOffers(),
        Array.isArray(remote.offers)
          ? remote.offers
              .map((offer) => normalizeOffer(offer))
              .filter((offer): offer is PlatformOffer => Boolean(offer))
          : [],
      ).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      const nextEvents = mergeByRecency(
        loadPlatformEvents(),
        Array.isArray(remote.events)
          ? remote.events
              .map((event) => normalizeEvent(event))
              .filter((event): event is PlatformEvent => Boolean(event))
          : [],
      ).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      const nextSettings = normalizeSettings(remote.settings);
      const remoteUpdatedAt =
        typeof remote.updatedAt === "string" ? remote.updatedAt : new Date().toISOString();
      const currentMeta = readCloudSyncMeta();

      if (!currentMeta.hydratedAt || remoteUpdatedAt >= currentMeta.hydratedAt) {
        writeStorage(ORDERS_STORAGE_KEY, nextOrders);
        writeStorage(CONTACTS_STORAGE_KEY, nextContacts);
        writeStorage(OFFERS_STORAGE_KEY, nextOffers);
        writeStorage(EVENTS_STORAGE_KEY, nextEvents);
        writeStorage(SETTINGS_STORAGE_KEY, nextSettings);
        writeCloudSyncMeta({ hydratedAt: remoteUpdatedAt });
      }
    } catch {
      // Local fallback remains active when cloud bootstrap fails.
    }
  })().finally(() => {
    cloudBootstrapPromise = null;
  });

  return cloudBootstrapPromise;
}

export function saveCodOrder(input: SaveCodOrderInput) {
  const now = new Date().toISOString();
  const quantity = Math.max(1, Math.trunc(input.quantity || 1));
  const unitPrice = Math.max(0, input.unitPrice || 0);
  const order: PlatformOrder = {
    id: createEntityId("ord"),
    customerName: input.customerName.trim() || "Cliente ShopCOD",
    phone: input.phone.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    department: input.department.trim(),
    notes: input.notes?.trim() || "",
    quantity,
    total: Number((quantity * unitPrice).toFixed(2)),
    currency: input.currency === "USD" ? "USD" : "PEN",
    status: "new",
    source: "checkout",
    storeId: input.storeId ?? null,
    funnelId: input.funnelId ?? null,
    items: [
      {
        productId: input.productId ?? null,
        productName: input.productName.trim() || "Producto ShopCOD",
        quantity,
        unitPrice,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  writeStorage(ORDERS_STORAGE_KEY, [order, ...loadOrders()]);
  saveContactFromOrder(order);
  if (order.items[0]?.productId) {
    consumeProductInventory(order.items[0].productId, quantity);
  }
  recordPlatformEvent("order_placed", "/order-confirmed");
  return order;
}

export function updateOrderStatus(orderId: string, status: PlatformOrderStatus) {
  const orders = loadOrders();
  const now = new Date().toISOString();
  const nextOrders = orders.map((order) =>
    order.id === orderId ? { ...order, status, updatedAt: now } : order,
  );

  writeStorage(ORDERS_STORAGE_KEY, nextOrders);
  return nextOrders;
}

export function saveBundleOffer(input: SaveBundleOfferInput) {
  const offers = loadOffers();
  const now = new Date().toISOString();
  const offer: BundleOffer = {
    id: createEntityId("offer"),
    type: "bundle",
    name: input.name.trim() || "Nuevo bundle",
    description: input.description.trim(),
    productIds: input.productIds,
    bundlePrice: Math.max(0, input.bundlePrice),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  writeStorage(OFFERS_STORAGE_KEY, [offer, ...offers]);
  return offer;
}

export function saveDiscountOffer(input: SaveDiscountOfferInput) {
  const offers = loadOffers();
  const now = new Date().toISOString();
  const offer: DiscountOffer = {
    id: createEntityId("offer"),
    type: "discount",
    name: input.name.trim() || "Nuevo descuento",
    code: input.code.trim().toUpperCase() || "SHOPCOD",
    description: input.description.trim(),
    discountType: input.discountType,
    value: Math.max(0, input.value),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  writeStorage(OFFERS_STORAGE_KEY, [offer, ...offers]);
  return offer;
}

export function deleteOffer(offerId: string) {
  const nextOffers = loadOffers().filter((offer) => offer.id !== offerId);
  writeStorage(OFFERS_STORAGE_KEY, nextOffers);
  return nextOffers;
}

export function savePlatformSettings(nextSettings: PlatformSettings) {
  const normalizedSettings = normalizeSettings(nextSettings);
  writeStorage(SETTINGS_STORAGE_KEY, normalizedSettings);
  return normalizedSettings;
}

export function getPlatformAnalyticsSnapshot() {
  const orders = loadOrders().filter((order) => order.status !== "cancelled");
  const contacts = loadContacts();
  const products = loadProducts();
  const funnels = loadFunnels();
  const stores = loadStores();
  const events = loadPlatformEvents();
  const sales = Number(
    orders.reduce((sum, order) => sum + order.total, 0).toFixed(2),
  );
  const pageViews = events.filter((event) => event.type === "page_view");
  const visitors = Math.max(
    new Set(pageViews.map((event) => event.visitorId)).size,
    contacts.length,
  );
  const checkoutsStarted = events.filter((event) => event.type === "checkout_started").length;
  const catalogValue = Number(
    products.reduce((sum, product) => sum + product.inventory * product.price, 0).toFixed(2),
  );

  return {
    visitors,
    pageViews: pageViews.length,
    checkoutsStarted,
    orders: orders.length,
    contacts: contacts.length,
    sales,
    avgTicket: orders.length > 0 ? Number((sales / orders.length).toFixed(2)) : 0,
    conversionRate:
      visitors > 0
        ? Number(((orders.length / visitors) * 100).toFixed(2))
        : checkoutsStarted > 0
          ? Number(((orders.length / checkoutsStarted) * 100).toFixed(2))
          : 0,
    catalogValue,
    activeStores: stores.length,
    activeFunnels: funnels.length,
    salesByDay: readSalesByDay(orders),
    topProducts: readTopProducts(orders),
  } satisfies PlatformAnalyticsSnapshot;
}
