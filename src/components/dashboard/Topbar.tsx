import { Bell, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AuthUser } from "@/lib/auth";

interface TopbarProps {
  sectionLabel: string;
  workspace: string;
  onWorkspaceChange: (value: string) => void;
  onOpenSidebar: () => void;
  user: AuthUser | null;
}

const workspaceOptions = ["Workspace principal", "Operacion LATAM", "Growth Lab"];

export default function Topbar({
  sectionLabel,
  workspace,
  onWorkspaceChange,
  onOpenSidebar,
  user,
}: TopbarProps) {
  const avatarLetter = (user?.name || "S").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Panel ShopCOD
              </p>
              <p className="truncate text-sm font-medium text-foreground">{sectionLabel}</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <label className="relative block min-w-[11rem] flex-1 sm:min-w-[14rem] lg:w-80 lg:flex-none">
              <span className="sr-only">Buscar en el panel</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar modulos, tiendas o tareas"
                className="h-11 rounded-2xl border-border bg-card pl-10"
              />
            </label>

            <label className="sr-only" htmlFor="workspace-selector">
              Seleccionar workspace
            </label>
            <div className="relative min-w-[11rem]">
              <select
                id="workspace-selector"
                value={workspace}
                onChange={(event) => onWorkspaceChange(event.target.value)}
                className="h-11 w-full appearance-none rounded-2xl border border-border bg-card px-4 pr-9 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {workspaceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                v
              </span>
            </div>

            <button
              type="button"
              className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Abrir notificaciones"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Abrir perfil de usuario"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-sm font-semibold text-primary-foreground">
                {avatarLetter}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-medium text-foreground">
                  {user?.name || "Workspace Admin"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user?.email || "team@shopcod.app"}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
