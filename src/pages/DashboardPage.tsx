import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BarChart3,
  ExternalLink,
  MoreHorizontal,
  Zap,
  Store,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

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
  {
    id: "store-1",
    name: "Gadget Pro X",
    product: "Auriculares Bluetooth",
    orders: 234,
    revenue: 11683400,
    status: "activa",
    created: "2026-02-15",
  },
  {
    id: "store-2",
    name: "FitBand Ultra",
    product: "Smartband Deportiva",
    orders: 87,
    revenue: 3491300,
    status: "activa",
    created: "2026-02-20",
  },
  {
    id: "store-3",
    name: "SkinGlow Set",
    product: "Kit de Skincare",
    orders: 0,
    revenue: 0,
    status: "borrador",
    created: "2026-03-01",
  },
];

const statusStyles: Record<StoreItem["status"], string> = {
  activa: "border-success/30 bg-success/20 text-green-400",
  borrador: "border-border bg-secondary text-muted-foreground",
  pausada: "border-warning/30 bg-warning/20 text-yellow-400",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const totalOrders = mockStores.reduce((sum, store) => sum + store.orders, 0);
  const totalRevenue = mockStores.reduce((sum, store) => sum + store.revenue, 0);

  const handleLogout = async () => {
    await logout();
    toast.success("Sesion cerrada.");
    navigate("/", { replace: true });
  };

  const handleSettings = () => {
    toast("Configuracion lista para el siguiente paso.", {
      description: "Todavia no hay backend de dominios o billing conectado.",
    });
  };

  const handleMoreActions = (store: StoreItem) => {
    toast("Acciones rapidas habilitadas.", {
      description: `Usa Preview o Orders para gestionar ${store.name}.`,
    });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-card p-6 lg:flex">
        <div className="mb-10 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold">ShopCOD</span>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex w-full items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground"
          >
            <Store className="h-4 w-4" /> Mis Tiendas
          </button>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <BarChart3 className="h-4 w-4" /> Pedidos
          </button>
          <button
            type="button"
            onClick={handleSettings}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-4 w-4" /> Configuracion
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
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">ShopCOD</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Salir
          </Button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {user ? `Sesion: ${user.name}` : "Panel principal"}
              </p>
              <h1 className="text-2xl font-bold">Mis Tiendas</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona tus funnels de venta y publica cambios rapido.
              </p>
            </div>

            <Button variant="cta" onClick={() => navigate("/editor/new")}>
              <Plus className="h-4 w-4" /> Nueva Tienda
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Tiendas activas</p>
              <p className="text-2xl font-bold">
                {mockStores.filter((store) => store.status === "activa").length}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Pedidos totales</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Ingresos totales</p>
              <p className="text-2xl font-bold text-gradient-gold">
                ${(totalRevenue / 100).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockStores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30"
              >
                <div className="flex h-32 items-center justify-center border-b border-border bg-gradient-card">
                  <span className="text-3xl">SHOP</span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{store.name}</h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {store.product}
                      </p>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyles[store.status]}`}
                    >
                      {store.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Pedidos:</span>{" "}
                      <span className="font-semibold">{store.orders}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ingresos:</span>{" "}
                      <span className="font-semibold">
                        ${(store.revenue / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/editor/${store.id}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/preview/${store.id}`)}
                      aria-label={`Abrir preview de ${store.name}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoreActions(store)}
                      aria-label={`Abrir mas acciones de ${store.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate("/editor/new")}
              className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-semibold text-muted-foreground">
                Crear nueva tienda
              </span>
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
