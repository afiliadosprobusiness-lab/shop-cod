import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, ExternalLink, MoreHorizontal, Zap, Store, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StoreItem {
  id: string;
  name: string;
  product: string;
  orders: number;
  revenue: number;
  status: "activa" | "borrador" | "pausada";
  created: string;
}

const mockStores: StoreItem[] = [
  { id: "store-1", name: "Gadget Pro X", product: "Auriculares Bluetooth", orders: 234, revenue: 11683400, status: "activa", created: "2026-02-15" },
  { id: "store-2", name: "FitBand Ultra", product: "Smartband Deportiva", orders: 87, revenue: 3491300, status: "activa", created: "2026-02-20" },
  { id: "store-3", name: "SkinGlow Set", product: "Kit de Skincare", orders: 0, revenue: 0, status: "borrador", created: "2026-03-01" },
];

const statusStyles: Record<string, string> = {
  activa: "bg-success/20 text-green-400 border-success/30",
  borrador: "bg-secondary text-muted-foreground border-border",
  pausada: "bg-warning/20 text-yellow-400 border-warning/30",
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const totalOrders = mockStores.reduce((s, st) => s + st.orders, 0);
  const totalRevenue = mockStores.reduce((s, st) => s + st.revenue, 0);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border p-6">
        <div className="flex items-center gap-2 mb-10">
          <Zap className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg">FunnelCOD</span>
        </div>
        <nav className="space-y-1 flex-1">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium">
            <Store className="w-4 h-4" /> Mis Tiendas
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors text-sm">
            <BarChart3 className="w-4 h-4" /> Analytics
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors text-sm">
            <Settings className="w-4 h-4" /> Configuración
          </button>
        </nav>
        <button onClick={() => navigate("/")} className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">FunnelCOD</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Salir</Button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Mis Tiendas</h1>
              <p className="text-muted-foreground text-sm">Gestiona tus funnels de venta</p>
            </div>
            <Button variant="cta" onClick={() => navigate("/editor/new")}>
              <Plus className="w-4 h-4" /> Nueva Tienda
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Tiendas activas</p>
              <p className="text-2xl font-bold">{mockStores.filter(s => s.status === "activa").length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Pedidos totales</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Ingresos totales</p>
              <p className="text-2xl font-bold text-gradient-gold">${(totalRevenue / 100).toLocaleString()}</p>
            </div>
          </div>

          {/* Store Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStores.map((store, i) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group"
              >
                {/* Preview bar */}
                <div className="h-32 bg-gradient-card border-b border-border flex items-center justify-center">
                  <span className="text-3xl">🛍️</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">{store.product}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${statusStyles[store.status]}`}>
                      {store.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div><span className="text-muted-foreground">Pedidos:</span> <span className="font-semibold">{store.orders}</span></div>
                    <div><span className="text-muted-foreground">Ingresos:</span> <span className="font-semibold">${(store.revenue / 100).toLocaleString()}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1" onClick={() => navigate(`/editor/${store.id}`)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* New Store Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate("/editor/new")}
              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[280px]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-semibold text-muted-foreground">Crear nueva tienda</span>
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
