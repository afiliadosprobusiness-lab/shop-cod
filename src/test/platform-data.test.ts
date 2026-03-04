import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteOffer,
  getPlatformAnalyticsSnapshot,
  loadContacts,
  loadOffers,
  loadOrders,
  loadPlatformSettings,
  saveBundleOffer,
  saveCodOrder,
  saveDiscountOffer,
  saveOrderBumpOffer,
  savePlatformSettings,
  saveUpsellOffer,
} from "@/lib/platform-data";

describe("platform data", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores orders from checkout and creates a linked contact", () => {
    const order = saveCodOrder({
      customerName: "Ana Perez",
      phone: "999888777",
      address: "Av. Central 123",
      city: "Lima",
      department: "Lima",
      quantity: 2,
      unitPrice: 49900,
      currency: "PEN",
      productName: "Glow Serum Pro",
    });

    expect(loadOrders()[0]?.id).toBe(order.id);
    expect(loadContacts()[0]?.lastOrderId).toBe(order.id);
    expect(loadContacts()[0]?.totalOrders).toBe(1);
  });

  it("creates offers and reflects them in storage", () => {
    const bundle = saveBundleOffer({
      name: "Bundle Glow",
      description: "Oferta por paquete",
      productIds: ["prod-101", "prod-102"],
      bundlePrice: 79900,
    });
    const discount = saveDiscountOffer({
      name: "Lanzamiento",
      code: "LANZA10",
      description: "Descuento de lanzamiento",
      discountType: "percentage",
      value: 10,
    });

    const upsell = saveUpsellOffer({
      productId: "prod-101",
      customPrice: 29900,
    });
    const orderBump = saveOrderBumpOffer({
      productId: "prod-102",
      quantity: 3,
      discountPercentage: 15,
    });

    expect(loadOffers()).toHaveLength(4);

    const nextOffers = deleteOffer(bundle.id);

    expect(nextOffers.some((offer) => offer.id === bundle.id)).toBe(false);
    expect(nextOffers.some((offer) => offer.id === discount.id)).toBe(true);
    expect(nextOffers.some((offer) => offer.id === upsell.id)).toBe(true);
    expect(nextOffers.some((offer) => offer.id === orderBump.id)).toBe(true);
  });

  it("persists settings and builds live analytics from orders", () => {
    saveCodOrder({
      customerName: "Luis Mora",
      phone: "300123456",
      address: "Street 45",
      city: "Bogota",
      department: "Cundinamarca",
      quantity: 1,
      unitPrice: 49900,
      currency: "PEN",
      productName: "Fit Pulse Band",
    });

    savePlatformSettings({
      ...loadPlatformSettings(),
      accountName: "Workspace Live",
      billing: {
        ...loadPlatformSettings().billing,
        planName: "Growth",
      },
      payments: {
        ...loadPlatformSettings().payments,
        temporaryStorePassword: "TEMP-12345",
      },
    });

    const analytics = getPlatformAnalyticsSnapshot();

    expect(loadPlatformSettings().accountName).toBe("Workspace Live");
    expect(loadPlatformSettings().billing.planName).toBe("Growth");
    expect(loadPlatformSettings().payments.temporaryStorePassword).toBe("TEMP-12345");
    expect(analytics.orders).toBe(1);
    expect(analytics.sales).toBe(49900);
    expect(analytics.contacts).toBe(1);
  });
});
