import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  BarChart3,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type OrderStatus = "nuevo" | "confirmado" | "enviado" | "entregado" | "cancelado";

interface Order {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  date: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    name: "Maria Garcia",
    phone: "300 123 4567",
    address: "Cra 15 #45-23, Chapinero",
    city: "Bogota",
    department: "Bogota D.C.",
    quantity: 2,
    total: 99800,
    status: "nuevo",
    date: "2026-03-03",
  },
  {
    id: "ORD-002",
    name: "Carlos Rodriguez",
    phone: "311 456 7890",
    address: "Av. Reforma 222",
    city: "CDMX",
    department: "Mexico D.F.",
    quantity: 1,
    total: 49900,
    status: "confirmado",
    date: "2026-03-02",
  },
  {
    id: "ORD-003",
    name: "Ana Lopez",
    phone: "999 876 5432",
    address: "Jr. Libertad 456",
    city: "Lima",
    department: "Lima",
    quantity: 1,
    total: 49900,
    status: "enviado",
    date: "2026-03-01",
  },
  {
    id: "ORD-004",
    name: "Jose Martinez",
    phone: "569 1234 5678",
    address: "Av. Providencia 1234",
    city: "Santiago",
    department: "Santiago",
    quantity: 3,
    total: 149700,
    status: "entregado",
    date: "2026-02-28",
  },
  {
    id: "ORD-005",
    name: "Laura Torres",
    phone: "315 222 3333",
    address: "Calle 50 #20-15",
    city: "Medellin",
    department: "Antioquia",
    quantity: 1,
    total: 49900,
    status: "cancelado",
    date: "2026-02-27",
  },
  {
    id: "ORD-006",
    name: "Pedro Sanchez",
    phone: "318 444 5555",
    address: "Cra 7 #72-41",
    city: "Bogota",
    department: "Bogota D.C.",
    quantity: 2,
    total: 99800,
    status: "nuevo",
    date: "2026-03-03",
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  nuevo: {
    label: "Nuevo",
    color: "border-blue-500/30 bg-blue-500/20 text-blue-400",
    icon: <Clock className="h-3 w-3" />,
  },
  confirmado: {
    label: "Confirmado",
    color: "border-primary/30 bg-primary/20 text-primary",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  enviado: {
    label: "Enviado",
    color: "border-violet-500/30 bg-violet-500/20 text-violet-400",
    icon: <Truck className="h-3 w-3" />,
  },
  entregado: {
    label: "Entregado",
    color: "border-green-500/30 bg-green-500/20 text-green-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  cancelado: {
    label: "Cancelado",
    color: "border-destructive/30 bg-destructive/20 text-red-400",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");

  const filteredOrders =
    filterStatus === "todos"
      ? mockOrders
      : mockOrders.filter((order) => order.status === filterStatus);

  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders
    .filter((order) => order.status !== "cancelado")
    .reduce((sum, order) => sum + order.total, 0);
  const avgTicket =
    totalRevenue / mockOrders.filter((order) => order.status !== "cancelado").length;
  const confirmedOrders = mockOrders.filter((order) =>
    ["confirmado", "enviado", "entregado"].includes(order.status),
  ).length;

  const metrics = [
    {
      label: "Pedidos Totales",
      value: totalOrders,
      icon: <Package className="h-5 w-5" />,
      color: "text-blue-400",
    },
    {
      label: "Ingresos",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-primary",
    },
    {
      label: "Ticket Promedio",
      value: `$${Math.round(avgTicket).toLocaleString()}`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-violet-400",
    },
    {
      label: "Confirmados",
      value: confirmedOrders,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-green-400",
    },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Sesion cerrada.");
    navigate("/", { replace: true });
  };

  const handleWhatsAppConfirm = (order: Order) => {
    const cleanPhone = order.phone.replace(/\s+/g, "");
    const message = encodeURIComponent(
      `Hola ${order.name}, tu pedido ${order.id} fue confirmado en ShopCOD.`,
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank", "noopener,noreferrer");
    toast.success(`Abriendo confirmacion para ${order.name}.`);
    setSelectedOrder(null);
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-card p-6 lg:flex">
        <div className="mb-10 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold">ShopCOD Orders</span>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex w-full items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground"
          >
            <BarChart3 className="h-4 w-4" /> Dashboard
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("todos")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Package className="h-4 w-4" /> Pedidos
          </button>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </aside>

      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">Orders</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Salir
          </Button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Pedidos</h1>
              <p className="text-sm text-muted-foreground">
                Revisa estado, ticket promedio y confirma por WhatsApp.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Volver a tiendas
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                  <span className={metric.color}>{metric.icon}</span>
                </div>
                <p className="text-xl font-bold lg:text-2xl">{metric.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["todos", "nuevo", "confirmado", "enviado", "entregado", "cancelado"] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterStatus === status
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status === "todos" ? "Todos" : statusConfig[status].label}
                </button>
              ),
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Ciudad</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                      <td className="px-4 py-3">
                        <div>{order.name}</div>
                        <div className="text-xs text-muted-foreground">{order.phone}</div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {order.city}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ${order.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${statusConfig[order.status].color}`}
                        >
                          {statusConfig[order.status].icon}
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          aria-label={`Ver detalle de ${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {selectedOrder ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Pedido {selectedOrder.id}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${statusConfig[selectedOrder.status].color}`}
                >
                  {statusConfig[selectedOrder.status].icon}
                  {statusConfig[selectedOrder.status].label}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>{" "}
                  <span className="font-medium">{selectedOrder.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefono:</span>{" "}
                  <span className="font-medium">{selectedOrder.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Direccion:</span>{" "}
                  <span className="font-medium">{selectedOrder.address}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ciudad:</span>{" "}
                  <span className="font-medium">
                    {selectedOrder.city}, {selectedOrder.department}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cantidad:</span>{" "}
                  <span className="font-medium">{selectedOrder.quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-bold text-primary">
                    ${selectedOrder.total.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  <span className="font-medium">{selectedOrder.date}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="cta"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleWhatsAppConfirm(selectedOrder)}
                >
                  Confirmar por WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
