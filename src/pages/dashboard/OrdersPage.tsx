import { useEffect, useMemo, useState } from "react";
import MainContent from "@/components/dashboard/MainContent";
import { useAuth } from "@/lib/auth";
import {
  getFunnelProduct,
  listFunnelsByUser,
  listOrders,
  updateOrderStatus,
  type FunnelRow,
  type OrderRow,
  type OrderStatus,
} from "@/lib/funnel-system";
import { subscribeToShopcodData } from "@/lib/live-sync";

const statusOptions: OrderStatus[] = ["new", "processing", "shipped", "completed"];

export default function OrdersPage() {
  const { user } = useAuth();
  const [funnels, setFunnels] = useState<FunnelRow[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>("all");
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const sync = () => {
      const nextFunnels = listFunnelsByUser(user.uid);
      setFunnels(nextFunnels);
      setOrders(selectedFunnelId === "all" ? listOrders() : listOrders(selectedFunnelId));
    };

    sync();
    return subscribeToShopcodData(sync);
  }, [selectedFunnelId, user]);

  const visibleOrders = useMemo(() => {
    const allowedFunnels = new Set(funnels.map((funnel) => funnel.id));

    if (selectedFunnelId === "all") {
      return orders.filter((order) => allowedFunnels.has(order.funnel_id));
    }
    return orders.filter((order) => allowedFunnels.has(order.funnel_id));
  }, [funnels, orders, selectedFunnelId]);

  return (
    <MainContent
      eyebrow="Orders Dashboard"
      title="Pedidos"
      description="Tabla por funnel con estados operativos del proceso de venta."
    >
      <section className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5">
        <label htmlFor="orders-funnel-filter" className="mb-2 block text-sm font-medium">
          Filtrar por funnel
        </label>
        <select
          id="orders-funnel-filter"
          value={selectedFunnelId}
          onChange={(event) => setSelectedFunnelId(event.target.value)}
          className="h-11 w-full max-w-sm rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Todos</option>
          {funnels.map((funnel) => (
            <option key={funnel.id} value={funnel.id}>
              {funnel.name}
            </option>
          ))}
        </select>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/90">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">customer_name</th>
                <th className="px-4 py-3 font-medium">phone</th>
                <th className="px-4 py-3 font-medium">product</th>
                <th className="px-4 py-3 font-medium">payment_type</th>
                <th className="px-4 py-3 font-medium">order_status</th>
                <th className="px-4 py-3 font-medium">created_at</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length ? (
                visibleOrders.map((order) => {
                  const productName = getFunnelProduct(order.funnel_id)?.name ?? "Producto";

                  return (
                    <tr key={order.id} className="border-t border-border/70">
                      <td className="px-4 py-3 font-medium text-foreground">{order.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{productName}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-border bg-secondary/30 px-2 py-1 text-xs">
                          {order.payment_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <label className="sr-only" htmlFor={`status-${order.id}`}>
                          Estado del pedido
                        </label>
                        <select
                          id={`status-${order.id}`}
                          value={order.status}
                          onChange={(event) =>
                            setOrders(
                              updateOrderStatus(order.id, event.target.value as OrderStatus).filter(
                                (candidate) =>
                                  selectedFunnelId === "all"
                                    ? Boolean(findFunnelById(candidate.funnel_id))
                                    : candidate.funnel_id === selectedFunnelId,
                              ),
                            )
                          }
                          className="h-9 rounded-lg border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("es-PE")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Aun no hay pedidos para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </MainContent>
  );
}
