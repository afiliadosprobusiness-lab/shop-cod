export const supportedCurrencies = ["USD", "EUR", "PEN"] as const;
export type CurrencyCode = (typeof supportedCurrencies)[number];

export interface StoreBuilderSeed {
  storeName?: string;
  productName?: string;
  subheadline?: string;
  price?: string;
}

export interface ProductPrices {
  USD: number;
  EUR: number;
  PEN: number;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  prices: ProductPrices;
  images: string[];
  variants: string[];
  stock: number;
}

export interface StoreBundle {
  id: string;
  productIds: string[];
  bundlePrice: number;
}

export interface StoreOrderBump {
  productId: string;
  price: number;
  description: string;
}

export interface StoreCollection {
  id: string;
  name: string;
  productIds: string[];
}

export interface StoreCheckoutConfig {
  domains: string[];
  enabledCurrencies: CurrencyCode[];
  orderBumps: StoreOrderBump[];
}

export interface StoreBuilderState {
  products: StoreProduct[];
  bundles: StoreBundle[];
  collections: StoreCollection[];
  checkout: StoreCheckoutConfig;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return supportedCurrencies.includes(value as CurrencyCode);
}

export function createDefaultProduct(profile?: StoreBuilderSeed): StoreProduct {
  const basePrice = Number.parseFloat(
    (profile?.price || "49.9").replace(/[^0-9.,]/g, "").replace(",", "."),
  );
  const normalizedPrice = Number.isFinite(basePrice) ? basePrice : 49.9;

  return {
    id: createId("product"),
    name: profile?.productName || "Producto principal",
    description:
      profile?.subheadline || "Descripcion editable para destacar beneficios, garantia y envio.",
    price: normalizedPrice,
    prices: {
      USD: Number(normalizedPrice.toFixed(2)),
      EUR: Number((normalizedPrice * 0.92).toFixed(2)),
      PEN: Number((normalizedPrice * 3.75).toFixed(2)),
    },
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    ],
    variants: ["Default"],
    stock: 120,
  };
}

export function createDefaultStoreBuilderState(profile?: StoreBuilderSeed): StoreBuilderState {
  const primaryProduct = createDefaultProduct(profile);

  return {
    products: [primaryProduct],
    bundles: [
      {
        id: createId("bundle"),
        productIds: [primaryProduct.id],
        bundlePrice: Number((primaryProduct.price * 0.9).toFixed(2)),
      },
    ],
    collections: [
      {
        id: createId("collection"),
        name: "Coleccion principal",
        productIds: [primaryProduct.id],
      },
    ],
    checkout: {
      domains: profile?.storeName
        ? [`${profile.storeName.toLowerCase().replace(/\s+/g, "")}.shopcod.co`]
        : ["mystore.shopcod.co"],
      enabledCurrencies: ["USD", "EUR", "PEN"],
      orderBumps: [
        {
          productId: primaryProduct.id,
          price: Number((primaryProduct.price * 0.35).toFixed(2)),
          description: "Oferta adicional que se muestra en checkout.",
        },
      ],
    },
  };
}

export function createStoreProduct(profile?: StoreBuilderSeed) {
  return createDefaultProduct(profile);
}

export function createStoreBundle(productIds: string[] = []): StoreBundle {
  return {
    id: createId("bundle"),
    productIds,
    bundlePrice: 0,
  };
}

export function createStoreCollection(productIds: string[] = []): StoreCollection {
  return {
    id: createId("collection"),
    name: "Nueva coleccion",
    productIds,
  };
}

export function createOrderBump(productId = ""): StoreOrderBump {
  return {
    productId,
    price: 0,
    description: "Oferta adicional que se muestra en checkout.",
  };
}
