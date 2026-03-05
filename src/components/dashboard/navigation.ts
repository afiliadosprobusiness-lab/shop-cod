import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings, ShoppingCart, Workflow } from "lucide-react";

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
    description: "Resumen del flujo de funnel de producto unico.",
    highlights: ["Workflow simple", "Accion rapida", "Panel claro"],
  },
  {
    label: "Funnels",
    path: "/funnels",
    icon: Workflow,
    eyebrow: "Builder",
    description: "Crea funnel, agrega producto unico, edita landing y publica.",
    highlights: ["Landing", "Checkout", "Thank you"],
    hasNestedRoutes: true,
  },
  {
    label: "Pedidos",
    path: "/orders",
    icon: ShoppingCart,
    eyebrow: "Operacion",
    description: "Gestiona ordenes por funnel y estado logisitico.",
    highlights: ["Nuevos", "Procesando", "Completados"],
  },
  {
    label: "Configuracion",
    path: "/settings",
    icon: Settings,
    eyebrow: "Workspace",
    description: "Ajustes generales de la cuenta y el workspace.",
    highlights: ["Cuenta", "Pagos", "Seguridad"],
  },
];

export function getDashboardNavItem(pathname: string) {
  return (
    dashboardNavItems.find(
      (item) => pathname === item.path || (item.hasNestedRoutes && pathname.startsWith(`${item.path}/`)),
    ) ?? dashboardNavItems[0]
  );
}
