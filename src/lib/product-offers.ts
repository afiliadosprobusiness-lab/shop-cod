import type { Product, ProductOffer } from "@/lib/products";

const MIN_ORDER_BUMP_QUANTITY = 2;
const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 100;

function toSafeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeOrderBumpQuantity(value: number) {
  return Math.max(MIN_ORDER_BUMP_QUANTITY, Math.trunc(toSafeNumber(value, MIN_ORDER_BUMP_QUANTITY)));
}

export function normalizeDiscountPercentage(value: number) {
  const normalized = toSafeNumber(value, 0);
  return Math.min(MAX_PERCENTAGE, Math.max(MIN_PERCENTAGE, normalized));
}

interface BuildQuantityOrderBumpOfferInput {
  enabled: boolean;
  baseProductName: string;
  baseProductUnitPrice: number;
  quantity: number;
  discountPercentage: number;
}

export function buildQuantityOrderBumpOffer(
  input: BuildQuantityOrderBumpOfferInput,
): ProductOffer | null {
  if (!input.enabled) {
    return null;
  }

  const quantity = normalizeOrderBumpQuantity(input.quantity);
  const discountPercentage = normalizeDiscountPercentage(input.discountPercentage);
  const unitPrice = Math.max(toSafeNumber(input.baseProductUnitPrice), 0);
  const listTotal = roundCurrency(unitPrice * quantity);
  const finalPrice = roundCurrency(listTotal * (1 - discountPercentage / 100));
  const savings = roundCurrency(listTotal - finalPrice);

  return {
    name: `Pack x${quantity} ${input.baseProductName.trim() || "Producto"}`,
    description: `Oferta por cantidad: ${quantity} unidades con ${discountPercentage}% OFF. Ahorro: $${savings.toFixed(2)}.`,
    price: finalPrice,
  };
}

interface BuildUpsellOfferFromProductInput {
  enabled: boolean;
  selectedProduct: Product | null;
  customPrice?: number;
}

export function buildUpsellOfferFromProduct(
  input: BuildUpsellOfferFromProductInput,
): ProductOffer | null {
  if (!input.enabled || !input.selectedProduct) {
    return null;
  }

  const fallbackPrice = Math.max(toSafeNumber(input.selectedProduct.price), 0);
  const nextPrice =
    typeof input.customPrice === "number"
      ? Math.max(toSafeNumber(input.customPrice, fallbackPrice), 0)
      : fallbackPrice;

  return {
    name: input.selectedProduct.name,
    description: input.selectedProduct.description,
    price: nextPrice,
  };
}
