import { emitShopcodDataUpdated } from "@/lib/live-sync";

export interface ProductCustomField {
  id: string;
  key: string;
  value: string;
}

export interface ProductOffer {
  name: string;
  description: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  images: string[];
  variants: string[];
  inventory: number;
  sku: string;
  slug: string;
  tags: string[];
  createdAt: string;
  inventoryTracking: boolean;
  shipping: boolean;
  customFields: ProductCustomField[];
  orderBump: ProductOffer | null;
  upsell: ProductOffer | null;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  images: string[];
  variants: string[];
  inventory: number;
  sku: string;
  slug: string;
  tags: string[];
  inventoryTracking: boolean;
  shipping: boolean;
  customFields: ProductCustomField[];
  orderBump: ProductOffer | null;
  upsell: ProductOffer | null;
}

const PRODUCTS_STORAGE_KEY = "shopcod-products-v1";

const seedProducts: Product[] = [
  {
    id: "prod-101",
    name: "Glow Serum Pro",
    description: "Serum premium para rutinas de belleza con alta recompra.",
    price: 39.9,
    comparePrice: 59.9,
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"],
    variants: ["30 ml", "50 ml"],
    inventory: 142,
    sku: "GLOW-SERUM-PRO",
    slug: "glow-serum-pro",
    tags: ["belleza", "skincare"],
    createdAt: "2026-03-01T10:30:00.000Z",
    inventoryTracking: true,
    shipping: true,
    customFields: [
      { id: "cf-1", key: "Rutina", value: "Noche" },
      { id: "cf-2", key: "Pais origen", value: "Corea" },
    ],
    orderBump: {
      name: "Mini serum de viaje",
      description: "Tamano reducido para prueba rapida.",
      price: 9.9,
    },
    upsell: {
      name: "Glow Cream",
      description: "Complemento para aumentar el ticket.",
      price: 19.9,
    },
  },
  {
    id: "prod-102",
    name: "Fit Pulse Band",
    description: "Smartband enfocada en ofertas directas y seguimiento diario.",
    price: 79,
    comparePrice: 109,
    images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80"],
    variants: ["Negro", "Azul"],
    inventory: 38,
    sku: "FIT-PULSE-BAND",
    slug: "fit-pulse-band",
    tags: ["fitness", "gadgets"],
    createdAt: "2026-02-26T15:20:00.000Z",
    inventoryTracking: true,
    shipping: true,
    customFields: [{ id: "cf-3", key: "Bateria", value: "7 dias" }],
    orderBump: null,
    upsell: {
      name: "Correa premium",
      description: "Accesorio con mayor margen.",
      price: 14.5,
    },
  },
  {
    id: "prod-103",
    name: "Plantilla Ebook COD",
    description: "Producto digital para equipos de venta que no requiere envio.",
    price: 24,
    comparePrice: 34,
    images: [],
    variants: ["PDF", "Notion"],
    inventory: 999,
    sku: "EBOOK-COD-TEMPLATE",
    slug: "ebook-cod-template",
    tags: ["digital", "templates"],
    createdAt: "2026-02-20T08:00:00.000Z",
    inventoryTracking: false,
    shipping: false,
    customFields: [{ id: "cf-4", key: "Entrega", value: "Inmediata" }],
    orderBump: {
      name: "Checklist de cierre",
      description: "Guia extra para el equipo comercial.",
      price: 7,
    },
    upsell: null,
  },
];

function cloneSeedProducts() {
  return seedProducts.map((product) => ({
    ...product,
    images: [...product.images],
    variants: [...product.variants],
    tags: [...product.tags],
    customFields: product.customFields.map((field) => ({ ...field })),
    orderBump: product.orderBump ? { ...product.orderBump } : null,
    upsell: product.upsell ? { ...product.upsell } : null,
  }));
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeTextList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function normalizeCustomFields(customFields: ProductCustomField[]) {
  return customFields
    .map((field) => ({
      id: field.id || createEntityId("cf"),
      key: field.key.trim(),
      value: field.value.trim(),
    }))
    .filter((field) => field.key || field.value);
}

function sanitizeOffer(offer: ProductOffer | null) {
  if (!offer) {
    return null;
  }

  const name = offer.name.trim();
  const description = offer.description.trim();
  const price = Number.isFinite(offer.price) ? offer.price : 0;

  if (!name && !description && price <= 0) {
    return null;
  }

  return {
    name: name || "Oferta adicional",
    description,
    price: Math.max(price, 0),
  };
}

function readStoredProducts() {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Product[];

    if (!Array.isArray(parsedValue)) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

function writeStoredProducts(products: Product[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  emitShopcodDataUpdated();
}

function createEntityId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function ensureUniqueSlug(baseSlug: string, products: Product[]) {
  const normalizedBase = slugifyProductName(baseSlug) || "producto";
  let candidate = normalizedBase;
  let counter = 2;

  while (products.some((product) => product.slug === candidate)) {
    candidate = `${normalizedBase}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function loadProducts() {
  const storedProducts = readStoredProducts();
  return storedProducts ?? cloneSeedProducts();
}

export function findProduct(productId: string) {
  return loadProducts().find((product) => product.id === productId) ?? null;
}

export function saveProduct(input: ProductInput) {
  const currentProducts = loadProducts();
  const product: Product = {
    id: createEntityId("prod"),
    name: input.name.trim() || "Nuevo producto",
    description: input.description.trim(),
    price: Math.max(Number(input.price) || 0, 0),
    comparePrice: Math.max(Number(input.comparePrice) || 0, 0),
    images: normalizeTextList(input.images),
    variants: normalizeTextList(input.variants),
    inventory: Math.max(Number(input.inventory) || 0, 0),
    sku: input.sku.trim() || createEntityId("sku").toUpperCase(),
    slug: ensureUniqueSlug(input.slug || input.name, currentProducts),
    tags: normalizeTextList(input.tags),
    createdAt: new Date().toISOString(),
    inventoryTracking: input.inventoryTracking,
    shipping: input.shipping,
    customFields: normalizeCustomFields(input.customFields),
    orderBump: sanitizeOffer(input.orderBump),
    upsell: sanitizeOffer(input.upsell),
  };

  writeStoredProducts([product, ...currentProducts]);
  return product;
}

export function duplicateProduct(productId: string) {
  const currentProducts = loadProducts();
  const source = currentProducts.find((product) => product.id === productId);

  if (!source) {
    return null;
  }

  const duplicate = {
    ...source,
    id: createEntityId("prod"),
    name: `${source.name} copia`,
    slug: ensureUniqueSlug(`${source.slug}-copy`, currentProducts),
    createdAt: new Date().toISOString(),
    images: [...source.images],
    variants: [...source.variants],
    tags: [...source.tags],
    customFields: source.customFields.map((field) => ({
      ...field,
      id: createEntityId("cf"),
    })),
    orderBump: source.orderBump ? { ...source.orderBump } : null,
    upsell: source.upsell ? { ...source.upsell } : null,
  };

  writeStoredProducts([duplicate, ...currentProducts]);
  return duplicate;
}

export function deleteProduct(productId: string) {
  const currentProducts = loadProducts();
  const nextProducts = currentProducts.filter((product) => product.id !== productId);

  if (nextProducts.length === currentProducts.length) {
    return null;
  }

  writeStoredProducts(nextProducts);
  return nextProducts;
}

export function consumeProductInventory(productId: string, quantity: number) {
  const currentProducts = loadProducts();
  const nextProducts = currentProducts.map((product) => {
    if (product.id !== productId || !product.inventoryTracking) {
      return product;
    }

    return {
      ...product,
      inventory: Math.max(0, product.inventory - Math.max(1, Math.trunc(quantity))),
    };
  });

  writeStoredProducts(nextProducts);
  return nextProducts;
}
