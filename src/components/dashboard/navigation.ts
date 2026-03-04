import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  TicketPercent,
  Users,
  Workflow,
} from "lucide-react";

export interface DashboardNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  eyebrow: string;
  description: string;
  highlights: [string, string, string];
  hasNestedRoutes?: boolean;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Inicio",
    path: "/dashboard",
    icon: LayoutDashboard,
    eyebrow: "Vista general",
    description:
      "Centro de control para arrancar nuevas iniciativas y moverte rapido entre modulos.",
    highlights: ["Resumen ejecutivo", "Accesos rapidos", "Estado del workspace"],
  },
  {
    label: "Productos",
    path: "/products",
    icon: Package,
    eyebrow: "Catalogo",
    description:
      "Gestiona el inventario comercial, define SKUs y estructura la base del catalogo.",
    highlights: ["SKU listos", "Bundles", "Visibilidad por modulo"],
    hasNestedRoutes: true,
  },
  {
    label: "Funnels",
    path: "/funnels",
    icon: Workflow,
    eyebrow: "Conversion",
    description:
      "Organiza secuencias de venta, pruebas de oferta y rutas de conversion del embudo.",
    highlights: ["Flujos", "A/B ideas", "Secuencias activas"],
  },
  {
    label: "Tiendas",
    path: "/stores",
    icon: Store,
    eyebrow: "Storefronts",
    description:
      "Centraliza la estructura de tiendas, dominios y la operacion comercial del panel.",
    highlights: ["Storefronts", "Dominios", "Control operacional"],
    hasNestedRoutes: true,
  },
  {
    label: "Pedidos",
    path: "/orders",
    icon: ShoppingCart,
    eyebrow: "Operacion",
    description:
      "Da seguimiento a pedidos, fulfillment y puntos criticos de conversion post-checkout.",
    highlights: ["Pipeline", "Estados", "Seguimiento"],
  },
  {
    label: "Analiticas",
    path: "/analytics",
    icon: BarChart3,
    eyebrow: "Insights",
    description:
      "Consolida metricas de ventas, rendimiento por modulo y decisiones basadas en datos.",
    highlights: ["KPIs", "Rendimiento", "Tendencias"],
  },
  {
    label: "Contactos",
    path: "/contacts",
    icon: Users,
    eyebrow: "CRM",
    description:
      "Agrupa clientes, prospectos y segmentos para acciones comerciales mas precisas.",
    highlights: ["Segmentos", "Base de leads", "Relacion con clientes"],
  },
  {
    label: "Ofertas",
    path: "/offers",
    icon: TicketPercent,
    eyebrow: "Promociones",
    description:
      "Diseña campañas, promociones y combos para acelerar activacion y recompra.",
    highlights: ["Promos", "Upsells", "Paquetes"],
  },
  {
    label: "Aplicaciones",
    path: "/apps",
    icon: AppWindow,
    eyebrow: "Ecosistema",
    description:
      "Extiende el panel con integraciones y herramientas auxiliares del stack SaaS.",
    highlights: ["Integraciones", "Add-ons", "Herramientas"],
  },
  {
    label: "Configuracion",
    path: "/settings",
    icon: Settings,
    eyebrow: "Preferencias",
    description:
      "Administra parametros globales, permisos operativos y ajustes del workspace.",
    highlights: ["Equipo", "Preferencias", "Control global"],
  },
];

export function getDashboardNavItem(pathname: string) {
  return (
    dashboardNavItems.find(
      (item) => pathname === item.path || (item.hasNestedRoutes && pathname.startsWith(`${item.path}/`)),
    ) ?? dashboardNavItems[0]
  );
}
