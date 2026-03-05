import { beforeEach, describe, expect, it } from "vitest";
import {
  createFunnel,
  createOrder,
  deleteFunnel,
  getFunnelOffers,
  getDatabaseSnapshot,
  getFunnelProduct,
  getLandingSections,
  listOrders,
  saveFunnelOffers,
  saveLandingSections,
  updateFunnelCurrency,
  upsertFunnelProduct,
  updateOrderStatus,
} from "@/lib/funnel-system";

describe("funnel-system", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates a funnel with the 3 base pages", () => {
    const funnel = createFunnel({
      name: "Funnel Test",
      userId: "user-1",
      userEmail: "demo@example.com",
    });

    const snapshot = getDatabaseSnapshot();
    const pages = snapshot.pages.filter((page) => page.funnel_id === funnel.id);
    const types = pages.map((page) => page.type).sort();

    expect(types).toEqual(["checkout", "landing", "thankyou"]);
  });

  it("keeps only one product per funnel", () => {
    const funnel = createFunnel({
      name: "Producto unico",
      userId: "user-1",
    });

    upsertFunnelProduct({
      funnelId: funnel.id,
      name: "Producto A",
      price: 10,
      type: "physical",
      paymentType: "stripe",
    });
    upsertFunnelProduct({
      funnelId: funnel.id,
      name: "Producto B",
      price: 20,
      type: "digital",
      paymentType: "paypal",
    });

    const snapshot = getDatabaseSnapshot();
    const products = snapshot.products.filter((product) => product.funnel_id === funnel.id);

    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Producto B");
    expect(getFunnelProduct(funnel.id)?.payment_type).toBe("paypal");
  });

  it("stores landing sections as ordered JSON", () => {
    const funnel = createFunnel({
      name: "Landing edit",
      userId: "user-1",
    });

    saveLandingSections(funnel.id, [
      { id: "1", type: "hero", title: "Amazing Product", subtitle: "Best hero" },
      { id: "2", type: "button", text: "Buy Now", href: "#checkout" },
    ]);

    const sections = getLandingSections(funnel.id);
    expect(sections).toHaveLength(2);
    expect(sections[0].type).toBe("hero");
    expect(sections[1].type).toBe("button");
  });

  it("creates and updates order status", () => {
    const funnel = createFunnel({
      name: "Pedidos",
      userId: "user-1",
    });
    const product = upsertFunnelProduct({
      funnelId: funnel.id,
      name: "Producto pedidos",
      price: 99,
      type: "physical",
      paymentType: "cash_on_delivery",
    });

    const order = createOrder({
      funnelId: funnel.id,
      productId: product.id,
      name: "Ken",
      phone: "999999999",
      address: "Av test 123",
      city: "Lima",
      paymentType: "cash_on_delivery",
    });

    expect(listOrders(funnel.id)[0].status).toBe("new");

    const updated = updateOrderStatus(order.id, "processing");
    const orderRow = updated.find((row) => row.id === order.id);
    expect(orderRow?.status).toBe("processing");
  });

  it("deletes funnel with related records", () => {
    const funnel = createFunnel({
      name: "Delete me",
      userId: "user-1",
    });
    const product = upsertFunnelProduct({
      funnelId: funnel.id,
      name: "Producto",
      price: 10,
      type: "physical",
      paymentType: "cash_on_delivery",
    });
    createOrder({
      funnelId: funnel.id,
      productId: product.id,
      name: "Ken",
      phone: "999",
      address: "Street",
      city: "Lima",
      paymentType: "cash_on_delivery",
    });

    const deleted = deleteFunnel(funnel.id);
    const snapshot = getDatabaseSnapshot();

    expect(deleted).toBe(true);
    expect(snapshot.funnels.find((item) => item.id === funnel.id)).toBeUndefined();
    expect(snapshot.products.find((item) => item.funnel_id === funnel.id)).toBeUndefined();
    expect(snapshot.pages.find((item) => item.funnel_id === funnel.id)).toBeUndefined();
    expect(snapshot.orders.find((item) => item.funnel_id === funnel.id)).toBeUndefined();
  });

  it("updates funnel currency and saves offers", () => {
    const funnel = createFunnel({
      name: "Moneda y ofertas",
      userId: "user-1",
    });

    const updated = updateFunnelCurrency(funnel.id, "PEN");
    expect(updated?.currency).toBe("PEN");

    const savedOffers = saveFunnelOffers(funnel.id, {
      upsell_enabled: true,
      upsell_name: "Upsell Pro",
      upsell_price: 29,
      discount_enabled: true,
      discount_percentage: 20,
    });
    expect(savedOffers.upsell_enabled).toBe(true);
    expect(savedOffers.discount_percentage).toBe(20);
    expect(getFunnelOffers(funnel.id).upsell_name).toBe("Upsell Pro");
  });
});
