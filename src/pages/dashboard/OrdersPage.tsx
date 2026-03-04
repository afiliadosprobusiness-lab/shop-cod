import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Package, Truck, XCircle } from "lucide-react";
import MainContent from "@/components/dashboard/MainContent";
import { subscribeToShopcodData } from "@/lib/live-sync";
import {
  loadOrders,
  updateOrderStatus,
  type PlatformOrder,
  type PlatformOrderStatus,
} from "@/lib/platform-data";

const orderStatusLabels: Record<PlatformOrderStatus, string> = {
  new: "Nuevo",
  confirmed: "Confirmado",
  fulfilled: "Entregado",
  cancelled: "Cancelado",
};

const orderStatusIcons = {
  new: Clock3,
  confirmed: CheckCircle2,
  fulfilled: Truck,
  cancelled: XCircle,
} satisfies Record<PlatformOrderStatus, typeof Clock3>;

function formatCurrency(value: number, currency: "USD" | "PEN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PlatformOrder[]>(() => loadOrders());

  useEffect(() => {
    return subscribeToShopcodData(() => {
      setOrders(loadOrders());
    });
  }, []);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== "cancelled");
    const sales = activeOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      total: orders.length,
      confirmed: orders.filter((order) => order.status === "confirmed").length,
      delivered: orders.filter((order) => order.status === "fulfilled").length,
      sales,
      avgTicket: activeOrders.length > 0 ? sales / activeOrders.length : 0,
    };
  }, [orders]);

  const handleStatusChange = (orderId: string, status: PlatformOrderStatus) => {
    setOrders(updateOrderStatus(orderId, status));
  };

  return (
    <MainContent
      eyebrow="Operacion"
      title="Pedidos"
      description="Sigue los pedidos reales que entran por el checkout COD y actualiza su estado desde el panel."
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Pedidos
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{metrics.total}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Confirmados
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{metrics.confirmed}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Entregados
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{metrics.delivered}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Ticket promedio
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {formatCurrency(metrics.avgTicket, "PEN")}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/80 bg-card/90 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Flujo en tiempo real
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(metrics.sales, "PEN")} en ventas registradas
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Package className="h-4 w-4" />
            Checkout COD conectado
          </span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border/80">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.length ? (
                  orders.map((order) => {
                    const StatusIcon = orderStatusIcons[order.status];

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-border/70 bg-card/70 transition-colors hover:bg-secondary/20"
                      >
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-foreground">{order.id}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.items[0]?.productName || "Producto ShopCOD"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-foreground">{order.customerName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{order.phone}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.city}, {order.department}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top font-semibold text-foreground">
                          {formatCurrency(order.total, order.currency)}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <label className="sr-only" htmlFor={`order-status-${order.id}`}>
                            Estado
                          </label>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4 text-primary" />
                            <select
                              id={`order-status-${order.id}`}
                              value={order.status}
                              onChange={(event) =>
                                handleStatusChange(
                                  order.id,
                                  event.target.value as PlatformOrderStatus,
                                )
                              }
                              className="h-10 rounded-xl border border-border bg-secondary/40 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <option value="new">Nuevo</option>
                              <option value="confirmed">Confirmado</option>
                              <option value="fulfilled">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString("en-US")}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center">
                      <p className="font-semibold text-foreground">Todavia no hay pedidos</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Los pedidos apareceran aqui cuando entren desde el checkout de la plataforma.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </MainContent>
  );
}
