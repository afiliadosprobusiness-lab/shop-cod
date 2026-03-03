import { useState } from "react";
import { motion } from "framer-motion";
import { Package, DollarSign, TrendingUp, CheckCircle2, Clock, Truck, XCircle, Eye, BarChart3, ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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
  { id: "ORD-001", name: "María García", phone: "300 123 4567", address: "Cra 15 #45-23, Chapinero", city: "Bogotá", department: "Bogotá D.C.", quantity: 2, total: 99800, status: "nuevo", date: "2026-03-03" },
  { id: "ORD-002", name: "Carlos Rodríguez", phone: "311 456 7890", address: "Av. Reforma 222", city: "CDMX", department: "México D.F.", quantity: 1, total: 49900, status: "confirmado", date: "2026-03-02" },
  { id: "ORD-003", name: "Ana López", phone: "999 876 5432", address: "Jr. Libertad 456", city: "Lima", department: "Lima", quantity: 1, total: 49900, status: "enviado", date: "2026-03-01" },
  { id: "ORD-004", name: "José Martínez", phone: "569 1234 5678", address: "Av. Providencia 1234", city: "Santiago", department: "Santiago", quantity: 3, total: 149700, status: "entregado", date: "2026-02-28" },
  { id: "ORD-005", name: "Laura Torres", phone: "315 222 3333", address: "Calle 50 #20-15", city: "Medellín", department: "Antioquia", quantity: 1, total: 49900, status: "cancelado", date: "2026-02-27" },
  { id: "ORD-006", name: "Pedro Sánchez", phone: "318 444 5555", address: "Cra 7 #72-41", city: "Bogotá", department: "Bogotá D.C.", quantity: 2, total: 99800, status: "nuevo", date: "2026-03-03" },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  nuevo: { label: "Nuevo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Clock className="w-3 h-3" /> },
  confirmado: { label: "Confirmado", color: "bg-primary/20 text-primary border-primary/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  enviado: { label: "Enviado", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: <Truck className="w-3 h-3" /> },
  entregado: { label: "Entregado", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelado: { label: "Cancelado", color: "bg-destructive/20 text-red-400 border-destructive/30", icon: <XCircle className="w-3 h-3" /> },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");

  const filtered = filterStatus === "todos" ? mockOrders : mockOrders.filter(o => o.status === filterStatus);

  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.filter(o => o.status !== "cancelado").reduce((s, o) => s + o.total, 0);
  const avgTicket = totalRevenue / mockOrders.filter(o => o.status !== "cancelado").length;
  const confirmed = mockOrders.filter(o => o.status === "confirmado" || o.status === "enviado" || o.status === "entregado").length;

  const metrics = [
    { label: "Pedidos Totales", value: totalOrders, icon: <Package className="w-5 h-5" />, color: "text-blue-400" },
    { label: "Ingresos", value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "text-primary" },
    { label: "Ticket Promedio", value: `$${Math.round(avgTicket).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-400" },
    { label: "Confirmados", value: confirmed, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border p-6">
        <div className="flex items-center gap-2 mb-10">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg">Admin Panel</span>
        </div>
        <nav className="space-y-1 flex-1">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium">
            <BarChart3 className="w-4 h-4" /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors text-sm">
            <Package className="w-4 h-4" /> Pedidos
          </button>
        </nav>
        <button onClick={() => navigate("/")} className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Ver tienda
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Ver tienda</Button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Resumen de tu tienda</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className={m.color}>{m.icon}</span>
                </div>
                <p className="text-xl lg:text-2xl font-bold">{m.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(["todos", "nuevo", "confirmado", "enviado", "entregado", "cancelado"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}
              >
                {s === "todos" ? "Todos" : statusConfig[s].label}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Ciudad</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                      <td className="px-4 py-3">
                        <div>{order.name}</div>
                        <div className="text-xs text-muted-foreground">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{order.city}</td>
                      <td className="px-4 py-3 font-semibold">${order.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${statusConfig[order.status].color}`}>
                          {statusConfig[order.status].icon}
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Pedido {selectedOrder.id}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${statusConfig[selectedOrder.status].color}`}>
                  {statusConfig[selectedOrder.status].icon}
                  {statusConfig[selectedOrder.status].label}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Cliente:</span> <span className="font-medium">{selectedOrder.name}</span></div>
                <div><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium">{selectedOrder.phone}</span></div>
                <div><span className="text-muted-foreground">Dirección:</span> <span className="font-medium">{selectedOrder.address}</span></div>
                <div><span className="text-muted-foreground">Ciudad:</span> <span className="font-medium">{selectedOrder.city}, {selectedOrder.department}</span></div>
                <div><span className="text-muted-foreground">Cantidad:</span> <span className="font-medium">{selectedOrder.quantity}</span></div>
                <div><span className="text-muted-foreground">Total:</span> <span className="font-bold text-primary">${selectedOrder.total.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Fecha:</span> <span className="font-medium">{selectedOrder.date}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="cta" size="sm" className="flex-1" onClick={() => { setSelectedOrder(null); }}>
                  Confirmar por WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
