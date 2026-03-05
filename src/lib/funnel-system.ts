import { emitShopcodDataUpdated } from "@/lib/live-sync";

export type ProductType = "physical" | "digital";
export type PaymentType = "stripe" | "paypal" | "cash_on_delivery";
export type PageType = "landing" | "checkout" | "thankyou";
export type OrderStatus = "new" | "processing" | "shipped" | "completed";
export type LandingBlockType =
  | "hero"
  | "section"
  | "headline"
  | "text"
  | "image"
  | "video"
  | "button"
  | "testimonials"
  | "faq"
  | "cod_form"
  | "footer";

export interface UserRow {
  id: string;
  email: string;
  password: string;
}

export interface FunnelRow {
  id: string;
  name: string;
  slug: string;
  user_id: string;
  created_at: string;
  published_at: string | null;
}

export interface ProductRow {
  id: string;
  funnel_id: string;
  name: string;
  price: number;
  type: ProductType;
  payment_type: PaymentType;
}

export interface PageRow {
  id: string;
  funnel_id: string;
  type: PageType;
  content_json: string;
}

export interface OrderRow {
  id: string;
  funnel_id: string;
  product_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  payment_type: PaymentType;
  status: OrderStatus;
  created_at: string;
}

export interface LandingBlock {
  id: string;
  type: LandingBlockType;
  title?: string;
  subtitle?: string;
  content?: string;
  src?: string;
  text?: string;
  href?: string;
  question?: string;
  answer?: string;
}

interface LandingContent {
  sections: LandingBlock[];
}

interface FunnelDatabase {
  users: UserRow[];
  funnels: FunnelRow[];
  products: ProductRow[];
  pages: PageRow[];
  orders: OrderRow[];
}

interface CreateFunnelInput {
  name: string;
  userId: string;
  userEmail?: string;
}

interface UpsertProductInput {
  funnelId: string;
  name: string;
  price: number;
  type: ProductType;
  paymentType: PaymentType;
}

interface CreateOrderInput {
  funnelId: string;
  productId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  paymentType: PaymentType;
}

const DATABASE_STORAGE_KEY = "shopcod-funnel-system-db-v1";

const allowedBlockTypes = new Set<LandingBlockType>([
  "hero",
  "section",
  "headline",
  "text",
  "image",
  "video",
  "button",
  "testimonials",
  "faq",
  "cod_form",
  "footer",
]);

function emptyDatabase(): FunnelDatabase {
  return {
    users: [],
    funnels: [],
    products: [],
    pages: [],
    orders: [],
  };
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readDatabase(): FunnelDatabase {
  if (!isBrowser()) {
    return emptyDatabase();
  }

  const rawDatabase = window.localStorage.getItem(DATABASE_STORAGE_KEY);
  if (!rawDatabase) {
    return emptyDatabase();
  }

  try {
    const parsed = JSON.parse(rawDatabase) as Partial<FunnelDatabase>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      funnels: Array.isArray(parsed.funnels) ? parsed.funnels : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return emptyDatabase();
  }
}

function writeDatabase(database: FunnelDatabase) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(database));
  emitShopcodDataUpdated();
}

function defaultLandingContent(funnelName: string): LandingContent {
  return {
    sections: [
      {
        id: createId("blk"),
        type: "hero",
        title: funnelName,
        subtitle: "Oferta principal para conversion rapida.",
        text: "Comprar ahora",
        href: "#checkout",
      },
      {
        id: createId("blk"),
        type: "section",
        title: "Beneficios",
        content: "Describe en pocas lineas por que este producto resuelve el problema.",
      },
      {
        id: createId("blk"),
        type: "cod_form",
        title: "Formulario COD",
        text: "Confirm Order",
      },
      {
        id: createId("blk"),
        type: "footer",
        content: "Copyright 2026 - Todos los derechos reservados.",
      },
    ],
  };
}

function defaultCheckoutContent() {
  return JSON.stringify({
    title: "Checkout",
    note: "Pagina generada automaticamente desde el producto del funnel.",
  });
}

function defaultThankYouContent() {
  return JSON.stringify({
    title: "Thank you",
    message: "Thank you for your order",
  });
}

function normalizeLandingContent(contentJson: string): LandingContent {
  try {
    const parsed = JSON.parse(contentJson) as { sections?: unknown };
    if (!parsed || !Array.isArray(parsed.sections)) {
      return { sections: [] };
    }

    const sections = parsed.sections
      .map((section) => {
        if (!section || typeof section !== "object") {
          return null;
        }

        const entry = section as Partial<LandingBlock>;
        if (typeof entry.type !== "string" || !allowedBlockTypes.has(entry.type as LandingBlockType)) {
          return null;
        }

        return {
          id: typeof entry.id === "string" ? entry.id : createId("blk"),
          type: entry.type as LandingBlockType,
          title: typeof entry.title === "string" ? entry.title : undefined,
          subtitle: typeof entry.subtitle === "string" ? entry.subtitle : undefined,
          content: typeof entry.content === "string" ? entry.content : undefined,
          src: typeof entry.src === "string" ? entry.src : undefined,
          text: typeof entry.text === "string" ? entry.text : undefined,
          href: typeof entry.href === "string" ? entry.href : undefined,
          question: typeof entry.question === "string" ? entry.question : undefined,
          answer: typeof entry.answer === "string" ? entry.answer : undefined,
        } satisfies LandingBlock;
      })
      .filter((section): section is LandingBlock => Boolean(section));

    return { sections };
  } catch {
    return { sections: [] };
  }
}

export function slugifyFunnelName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function ensureUniqueSlug(candidate: string, existingFunnels: FunnelRow[]) {
  const base = slugifyFunnelName(candidate) || "funnel";
  let slug = base;
  let suffix = 2;

  while (existingFunnels.some((funnel) => funnel.slug === slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function ensureUserRow(userId: string, email: string, password = "") {
  const database = readDatabase();
  const existing = database.users.find((user) => user.id === userId);

  if (existing) {
    if (existing.email !== email || existing.password !== password) {
      const nextUsers = database.users.map((user) =>
        user.id === userId ? { ...user, email, password } : user,
      );
      writeDatabase({ ...database, users: nextUsers });
    }
    return;
  }

  const nextUsers = [
    ...database.users,
    {
      id: userId,
      email,
      password,
    } satisfies UserRow,
  ];
  writeDatabase({ ...database, users: nextUsers });
}

export function createFunnel({ name, userId, userEmail }: CreateFunnelInput) {
  const database = readDatabase();
  const trimmedName = name.trim() || "New Funnel";
  const now = new Date().toISOString();
  const funnelId = createId("funnel");
  const slug = ensureUniqueSlug(trimmedName, database.funnels);

  const funnel: FunnelRow = {
    id: funnelId,
    name: trimmedName,
    slug,
    user_id: userId,
    created_at: now,
    published_at: null,
  };

  const pages: PageRow[] = [
    {
      id: createId("page"),
      funnel_id: funnel.id,
      type: "landing",
      content_json: JSON.stringify(defaultLandingContent(trimmedName)),
    },
    {
      id: createId("page"),
      funnel_id: funnel.id,
      type: "checkout",
      content_json: defaultCheckoutContent(),
    },
    {
      id: createId("page"),
      funnel_id: funnel.id,
      type: "thankyou",
      content_json: defaultThankYouContent(),
    },
  ];

  const nextDatabase: FunnelDatabase = {
    ...database,
    funnels: [funnel, ...database.funnels],
    pages: [...database.pages, ...pages],
  };

  if (userEmail) {
    const existingUser = nextDatabase.users.find((user) => user.id === userId);
    if (!existingUser) {
      nextDatabase.users = [
        ...nextDatabase.users,
        {
          id: userId,
          email: userEmail,
          password: "",
        },
      ];
    }
  }

  writeDatabase(nextDatabase);
  return funnel;
}

export function listFunnelsByUser(userId: string) {
  const database = readDatabase();
  return database.funnels
    .filter((funnel) => funnel.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function findFunnelById(funnelId: string) {
  const database = readDatabase();
  return database.funnels.find((funnel) => funnel.id === funnelId) ?? null;
}

export function findFunnelBySlug(slug: string) {
  const database = readDatabase();
  return database.funnels.find((funnel) => funnel.slug === slug) ?? null;
}

export function listFunnelPages(funnelId: string) {
  const database = readDatabase();
  return database.pages.filter((page) => page.funnel_id === funnelId);
}

export function getFunnelPage(funnelId: string, pageType: PageType) {
  return listFunnelPages(funnelId).find((page) => page.type === pageType) ?? null;
}

export function getLandingSections(funnelId: string) {
  const landingPage = getFunnelPage(funnelId, "landing");
  if (!landingPage) {
    return [];
  }

  return normalizeLandingContent(landingPage.content_json).sections;
}

export function saveLandingSections(funnelId: string, sections: LandingBlock[]) {
  const database = readDatabase();
  const landingPage = database.pages.find(
    (page) => page.funnel_id === funnelId && page.type === "landing",
  );

  if (!landingPage) {
    return null;
  }

  const filteredSections = sections
    .filter((section) => allowedBlockTypes.has(section.type))
    .map((section) => ({
      ...section,
      id: section.id || createId("blk"),
    }));
  const content = JSON.stringify({ sections: filteredSections });

  const nextPages = database.pages.map((page) =>
    page.id === landingPage.id
      ? {
          ...page,
          content_json: content,
        }
      : page,
  );

  writeDatabase({ ...database, pages: nextPages });
  return filteredSections;
}

export function getFunnelProduct(funnelId: string) {
  const database = readDatabase();
  return database.products.find((product) => product.funnel_id === funnelId) ?? null;
}

export function upsertFunnelProduct({
  funnelId,
  name,
  price,
  type,
  paymentType,
}: UpsertProductInput) {
  const database = readDatabase();
  const existingProduct = database.products.find((product) => product.funnel_id === funnelId);
  const normalizedName = name.trim() || "Producto";
  const normalizedPrice = Number.isFinite(price) && price > 0 ? Number(price) : 0;

  const product: ProductRow = existingProduct
    ? {
        ...existingProduct,
        name: normalizedName,
        price: normalizedPrice,
        type,
        payment_type: paymentType,
      }
    : {
        id: createId("prod"),
        funnel_id: funnelId,
        name: normalizedName,
        price: normalizedPrice,
        type,
        payment_type: paymentType,
      };

  const nextProducts = database.products
    .filter((candidate) => candidate.funnel_id !== funnelId)
    .concat(product);
  writeDatabase({ ...database, products: nextProducts });
  return product;
}

export function setFunnelPublished(funnelId: string, published: boolean) {
  const database = readDatabase();
  const nextFunnels = database.funnels.map((funnel) =>
    funnel.id === funnelId
      ? {
          ...funnel,
          published_at: published ? new Date().toISOString() : null,
        }
      : funnel,
  );
  writeDatabase({ ...database, funnels: nextFunnels });
  return nextFunnels.find((funnel) => funnel.id === funnelId) ?? null;
}

export function deleteFunnel(funnelId: string) {
  const database = readDatabase();
  const target = database.funnels.find((funnel) => funnel.id === funnelId);

  if (!target) {
    return false;
  }

  const nextDatabase: FunnelDatabase = {
    ...database,
    funnels: database.funnels.filter((funnel) => funnel.id !== funnelId),
    products: database.products.filter((product) => product.funnel_id !== funnelId),
    pages: database.pages.filter((page) => page.funnel_id !== funnelId),
    orders: database.orders.filter((order) => order.funnel_id !== funnelId),
  };

  writeDatabase(nextDatabase);
  return true;
}

export function createOrder({
  funnelId,
  productId,
  name,
  phone,
  address,
  city,
  paymentType,
}: CreateOrderInput) {
  const database = readDatabase();
  const order: OrderRow = {
    id: createId("ord"),
    funnel_id: funnelId,
    product_id: productId,
    name: name.trim(),
    phone: phone.trim(),
    address: address.trim(),
    city: city.trim(),
    payment_type: paymentType,
    status: "new",
    created_at: new Date().toISOString(),
  };

  const nextOrders = [order, ...database.orders];
  writeDatabase({ ...database, orders: nextOrders });
  return order;
}

export function listOrders(funnelId?: string) {
  const database = readDatabase();
  const rows = funnelId
    ? database.orders.filter((order) => order.funnel_id === funnelId)
    : database.orders;

  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const database = readDatabase();
  const nextOrders = database.orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
        }
      : order,
  );
  writeDatabase({ ...database, orders: nextOrders });
  return nextOrders;
}

export function getDatabaseSnapshot() {
  return readDatabase();
}
