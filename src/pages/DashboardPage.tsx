import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  BarChart3,
  ExternalLink,
  MoreHorizontal,
  Zap,
  Store,
  Settings,
  LogOut,
  Copy,
  PackageOpen,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  deleteStoreDraft,
  loadEditorState,
  loadStoreCatalog,
  saveEditorState,
  setStoreCatalogStatus,
  type FunnelBlock,
  type StoreCatalogItem,
  type StoreProfile,
} from "@/lib/editor";
import { defaultBlockData } from "@/components/editor/block-config";
import { toast } from "sonner";

interface StoreItem {
  id: string;
  name: string;
  product: string;
  category?: string;
  orders: number;
  revenue: number;
  status: "activa" | "borrador" | "pausada";
  created: string;
  isLocal?: boolean;
}

const mockStores: StoreItem[] = [
  {
    id: "store-1",
    name: "Gadget Pro X",
    product: "Auriculares Bluetooth",
    category: "Tecnologia",
    orders: 234,
    revenue: 11683400,
    status: "activa",
    created: "2026-02-15",
  },
  {
    id: "store-2",
    name: "FitBand Ultra",
    product: "Smartband Deportiva",
    category: "Fitness",
    orders: 87,
    revenue: 3491300,
    status: "activa",
    created: "2026-02-20",
  },
  {
    id: "store-3",
    name: "SkinGlow Set",
    product: "Kit de Skincare",
    category: "Belleza",
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

function buildStoreId() {
  return `store-${Date.now()}`;
}

function createStoreProfileDraft(): StoreProfile {
  return {
    storeName: "Nueva tienda",
    productName: "Producto principal",
    headline: "Tu producto estrella para vender mas",
    subheadline: "Oferta lista para lanzar en minutos con checkout COD.",
    price: "$49.900",
    originalPrice: "$89.900",
    ctaText: "Comprar ahora",
    category: "General",
  };
}

function createStarterBlocks(profile: StoreProfile): FunnelBlock[] {
  return [
    {
      id: "b1",
      type: "hero",
      data: {
        ...defaultBlockData.hero,
        title: profile.headline,
        subtitle: profile.subheadline,
        price: profile.price,
        originalPrice: profile.originalPrice,
        ctaText: profile.ctaText,
      },
    },
    {
      id: "b2",
      type: "problem",
      data: {
        ...defaultBlockData.problem,
        title: `Lo que ${profile.productName} resuelve en segundos`,
      },
    },
    {
      id: "b3",
      type: "benefits",
      data: {
        ...defaultBlockData.benefits,
        title: `Por que elegir ${profile.productName}?`,
      },
    },
    {
      id: "b4",
      type: "reviews",
      data: {
        ...defaultBlockData.reviews,
        title: `Clientes que ya compraron ${profile.productName}`,
      },
    },
    {
      id: "b5",
      type: "faq",
      data: {
        ...defaultBlockData.faq,
        title: `Preguntas sobre ${profile.productName}`,
      },
    },
    {
      id: "b6",
      type: "checkout",
      data: {
        ...defaultBlockData.checkout,
        title: `Pide ${profile.productName} ahora`,
      },
    },
    {
      id: "b7",
      type: "cta",
      data: {
        ...defaultBlockData.cta,
        title: `Lanza ${profile.storeName} hoy`,
        subtitle: "Tu siguiente venta puede llegar hoy mismo.",
        ctaText: profile.ctaText,
      },
    },
  ];
}

function convertCatalogItem(item: StoreCatalogItem): StoreItem {
  return {
    id: item.id,
    name: item.name,
    product: item.product,
    category: item.category,
    orders: item.orders,
    revenue: item.revenue,
    status: item.status,
    created: item.createdAt.slice(0, 10),
    isLocal: true,
  };
}

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [catalogStores, setCatalogStores] = useState<StoreItem[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeActionStore, setActiveActionStore] = useState<StoreItem | null>(null);
  const [storeDraft, setStoreDraft] = useState<StoreProfile>(createStoreProfileDraft);
  const [settingsDraft, setSettingsDraft] = useState({
    businessName: user?.name || "ShopCOD Team",
    supportEmail: user?.email || "",
    currency: "COP",
    timezone: "America/Bogota",
  });

  useEffect(() => {
    setCatalogStores(loadStoreCatalog().map(convertCatalogItem));
  }, []);

  const stores = useMemo(() => {
    const takenIds = new Set(catalogStores.map((store) => store.id));
    const fallbackStores = mockStores.filter((store) => !takenIds.has(store.id));
    return [...catalogStores, ...fallbackStores];
  }, [catalogStores]);

  const totalOrders = stores.reduce((sum, store) => sum + store.orders, 0);
  const totalRevenue = stores.reduce((sum, store) => sum + store.revenue, 0);
  const canCreateStore =
    storeDraft.storeName.trim().length > 0 &&
    storeDraft.productName.trim().length > 0 &&
    storeDraft.headline.trim().length > 0;

  const refreshCatalog = () => {
    setCatalogStores(loadStoreCatalog().map(convertCatalogItem));
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Sesion cerrada.");
    navigate("/", { replace: true });
  };

  const handleCreateStore = () => {
    const storeId = buildStoreId();
    const normalizedProfile: StoreProfile = {
      ...storeDraft,
      storeName: storeDraft.storeName.trim() || "Nueva tienda",
      productName: storeDraft.productName.trim() || "Producto principal",
      headline: storeDraft.headline.trim() || "Tu producto estrella para vender mas",
      subheadline:
        storeDraft.subheadline.trim() ||
        "Oferta lista para lanzar en minutos con checkout COD.",
      price: storeDraft.price.trim() || "$49.900",
      originalPrice: storeDraft.originalPrice.trim() || "$89.900",
      ctaText: storeDraft.ctaText.trim() || "Comprar ahora",
      category: storeDraft.category.trim() || "General",
    };

    const blocks = createStarterBlocks(normalizedProfile);
    saveEditorState(storeId, blocks, normalizedProfile);
    refreshCatalog();
    setShowCreator(false);
    setStoreDraft(createStoreProfileDraft());
    toast.success("Tienda creada.", {
      description: `${normalizedProfile.storeName} ya tiene una landing inicial lista.`,
    });
    navigate(`/editor/${storeId}`);
  };

  const handleDuplicateStore = (store: StoreItem) => {
    const existingState = loadEditorState(store.id);
    const storeId = buildStoreId();
    const sourceProfile =
      existingState?.profile || {
        storeName: `${store.name} copia`,
        productName: store.product,
        headline: `Lanza ${store.product} con una oferta mejorada`,
        subheadline: "Duplicado listo para testear una nueva variacion.",
        price: "$49.900",
        originalPrice: "$89.900",
        ctaText: "Comprar ahora",
        category: store.category || "General",
      };

    const duplicateProfile: StoreProfile = {
      ...sourceProfile,
      storeName: `${sourceProfile.storeName} copia`,
    };

    saveEditorState(
      storeId,
      existingState?.blocks || createStarterBlocks(duplicateProfile),
      duplicateProfile,
    );

    refreshCatalog();
    setActiveActionStore(null);
    toast.success("Tienda duplicada.", {
      description: `${duplicateProfile.storeName} se creo como nuevo borrador.`,
    });
    navigate(`/editor/${storeId}`);
  };

  const handlePauseStore = (store: StoreItem) => {
    if (!store.isLocal) {
      toast("Solo las tiendas creadas en este panel pueden pausarse por ahora.");
      setActiveActionStore(null);
      return;
    }

    const editorState = loadEditorState(store.id);
    saveEditorState(store.id, editorState?.blocks || [], editorState?.profile || null);
    setStoreCatalogStatus(store.id, "pausada");
    refreshCatalog();
    setActiveActionStore(null);
    toast.success(`${store.name} quedo en pausa.`);
  };

  const handleDeleteStore = (store: StoreItem) => {
    if (!store.isLocal) {
      toast("Solo las tiendas creadas en este panel pueden eliminarse por ahora.");
      setActiveActionStore(null);
      return;
    }

    deleteStoreDraft(store.id);
    refreshCatalog();
    setActiveActionStore(null);
    toast.success("Tienda eliminada.", {
      description: `${store.name} se elimino del panel y del borrador local.`,
    });
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    toast.success("Configuracion guardada.", {
      description: "Tus preferencias base quedan listas para las siguientes tiendas.",
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
            onClick={() => setShowSettings(true)}
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
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {user ? `Sesion: ${user.name}` : "Panel principal"}
              </p>
              <h1 className="text-2xl font-bold">Mis Tiendas</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Crea borradores listos para lanzar, edita ofertas y lleva cada tienda a
                preview sin salir del panel.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button variant="outline" onClick={() => navigate("/orders")}>
                <PackageOpen className="h-4 w-4" /> Ver pedidos
              </Button>
              <Button variant="cta" onClick={() => setShowCreator(true)}>
                <Plus className="h-4 w-4" /> Nueva Tienda
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Tiendas activas</p>
              <p className="text-2xl font-bold">
                {stores.filter((store) => store.status === "activa").length}
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

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {stores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30"
              >
                <div className="border-b border-border bg-gradient-card p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {store.category || "General"}
                      </p>
                      <p className="mt-3 text-2xl font-semibold">{store.name}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{store.product}</h3>
                      <p className="truncate text-sm text-muted-foreground">
                        Creada el {store.created}
                      </p>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyles[store.status]}`}
                    >
                      {store.status}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-secondary/50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Pedidos
                      </p>
                      <p className="mt-2 text-lg font-semibold">{store.orders}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Ingresos
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        ${(store.revenue / 100).toLocaleString()}
                      </p>
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
                      onClick={() => setActiveActionStore(store)}
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
              transition={{ delay: 0.25 }}
              onClick={() => setShowCreator(true)}
              className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Plus className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Crear nueva tienda</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Arranca con nombre, producto, precio y oferta base en un solo paso.
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </main>

      {showCreator ? (
        <ModalShell
          title="Creador de Tiendas"
          description="Define la base comercial y entra al editor con una estructura lista para publicar."
          onClose={() => setShowCreator(false)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nombre de la tienda</Label>
              <Input
                id="store-name"
                value={storeDraft.storeName}
                onChange={(event) =>
                  setStoreDraft((previous) => ({
                    ...previous,
                    storeName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-category">Categoria</Label>
              <Input
                id="store-category"
                value={storeDraft.category}
                onChange={(event) =>
                  setStoreDraft((previous) => ({
                    ...previous,
                    category: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-name">Producto principal</Label>
              <Input
                id="product-name"
                value={storeDraft.productName}
                onChange={(event) =>
                  setStoreDraft((previous) => ({
                    ...previous,
                    productName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta-text">CTA principal</Label>
              <Input
                id="cta-text"
                value={storeDraft.ctaText}
                onChange={(event) =>
                  setStoreDraft((previous) => ({
                    ...previous,
                    ctaText: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="headline">Headline comercial</Label>
              <Input
                id="headline"
                value={storeDraft.headline}
                onChange={(event) =>
                  setStoreDraft((previous) => ({
                    ...previous,
                    headline: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="subheadline">Subheadline</Label>
              <Input
                id="subheadline"
                value={storeDraft.subheadline}
                onChange={(event) =>
                  setStoreDraft((previous) => ({
                    ...previous,
                    subheadline: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                value={storeDraft.price}
                onChange={(event) =>
                  setStoreDraft((previous) => ({
                    ...previous,
                    price: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original-price">Precio anterior</Label>
              <Input
                id="original-price"
                value={storeDraft.originalPrice}
                onChange={(event) =>
                  setStoreDraft((previous) => ({
                    ...previous,
                    originalPrice: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-secondary/20 p-4 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Lo que se crea automaticamente
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Hero principal con precio, oferta y CTA.</p>
                <p>Bloque de problema para abrir la conversacion.</p>
                <p>Beneficios, reviews, FAQ, checkout y cierre final.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Vista base
              </p>
              <p className="mt-3 text-lg font-bold">
                {storeDraft.storeName.trim() || "Nueva tienda"}
              </p>
              <p className="text-sm text-muted-foreground">
                {storeDraft.productName.trim() || "Producto principal"}
              </p>
              <p className="mt-4 text-xl font-bold text-gradient-gold">
                {storeDraft.price.trim() || "$49.900"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {storeDraft.headline.trim() || "Tu producto estrella para vender mas"}
              </p>
              <p className="mt-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {storeDraft.ctaText.trim() || "Comprar ahora"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowCreator(false)}>
              Cancelar
            </Button>
            <Button variant="cta" onClick={handleCreateStore} disabled={!canCreateStore}>
              <Sparkles className="h-4 w-4" /> Crear y abrir editor
            </Button>
          </div>
        </ModalShell>
      ) : null}

      {showSettings ? (
        <ModalShell
          title="Configuracion del panel"
          description="Guarda tus datos base para que el equipo tenga una referencia operativa."
          onClose={() => setShowSettings(false)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business-name">Nombre comercial</Label>
              <Input
                id="business-name"
                value={settingsDraft.businessName}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    businessName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Correo de soporte</Label>
              <Input
                id="support-email"
                type="email"
                value={settingsDraft.supportEmail}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    supportEmail: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                value={settingsDraft.currency}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    currency: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Input
                id="timezone"
                value={settingsDraft.timezone}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    timezone: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button variant="cta" onClick={handleSaveSettings}>
              Guardar configuracion
            </Button>
          </div>
        </ModalShell>
      ) : null}

      {activeActionStore ? (
        <ModalShell
          title={`Acciones para ${activeActionStore.name}`}
          description="Gestiona esta tienda sin perder el contexto del dashboard."
          onClose={() => setActiveActionStore(null)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                navigate(`/editor/${activeActionStore.id}`);
                setActiveActionStore(null);
              }}
            >
              <Sparkles className="h-4 w-4" /> Abrir editor
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                navigate(`/preview/${activeActionStore.id}`);
                setActiveActionStore(null);
              }}
            >
              <ExternalLink className="h-4 w-4" /> Abrir preview
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                navigate("/orders");
                setActiveActionStore(null);
              }}
            >
              <PackageOpen className="h-4 w-4" /> Ver pedidos
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleDuplicateStore(activeActionStore)}
            >
              <Copy className="h-4 w-4" /> Duplicar borrador
            </Button>
            <Button
              variant="outline"
              className="justify-start sm:col-span-2"
              onClick={() => handlePauseStore(activeActionStore)}
            >
              <Settings className="h-4 w-4" /> Pausar tienda
            </Button>
            <Button
              variant="outline"
              className="justify-start border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:col-span-2"
              onClick={() => handleDeleteStore(activeActionStore)}
            >
              <Trash2 className="h-4 w-4" /> Eliminar tienda
            </Button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
