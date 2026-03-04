import { Link, NavLink } from "react-router-dom";
import { LogOut, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "@/components/dashboard/navigation";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void | Promise<void>;
}

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1.5" aria-label="Modulos del panel">
      {dashboardNavItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={!item.hasNestedRoutes}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "bg-primary text-primary-foreground shadow-gold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-current/10 bg-background/10">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  onCloseMobile,
  onLogout,
}: {
  onCloseMobile?: () => void;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/dashboard"
          className="flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={onCloseMobile}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-gold text-primary-foreground shadow-gold">
            <Zap className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold text-foreground">
              ShopCOD
            </span>
            <span className="block truncate text-xs text-muted-foreground">SaaS Control Hub</span>
          </span>
        </Link>

        {onCloseMobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onCloseMobile}
            aria-label="Cerrar menu lateral"
          >
            <X className="h-5 w-5" />
          </Button>
        ) : null}
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-6">
        <div className="rounded-3xl border border-border bg-secondary/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Control comercial
          </p>
          <p className="mt-3 text-sm text-secondary-foreground">
            Gestiona ventas, pedidos, clientes y ofertas desde un solo lugar.
          </p>
        </div>

        <SidebarLinks onNavigate={onCloseMobile} />
      </div>

      <div className="mt-8 border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-2xl px-3 text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </>
  );
}

export default function Sidebar({ isMobileOpen, onCloseMobile, onLogout }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-80 shrink-0 border-r border-border/80 bg-card/90 px-6 py-6 backdrop-blur lg:flex lg:flex-col">
        <SidebarContent onLogout={onLogout} />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="flex-1 bg-background/80 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-label="Cerrar menu lateral"
          />
          <aside className="flex w-[min(20rem,88vw)] flex-col border-l border-border bg-card px-5 py-5 shadow-2xl">
            <SidebarContent onCloseMobile={onCloseMobile} onLogout={onLogout} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
