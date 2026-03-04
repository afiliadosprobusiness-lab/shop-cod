import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHomePage from "@/pages/dashboard/DashboardHomePage";

describe("dashboard shell", () => {
  it("renders all sidebar modules", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Sidebar isMobileOpen={false} onCloseMobile={() => undefined} onLogout={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /inicio/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /productos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /funnels/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tiendas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pedidos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /analiticas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contactos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ofertas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /aplicaciones/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /configuracion/i })).toBeInTheDocument();
  });

  it("shows the two dashboard home creation cards", () => {
    render(
      <MemoryRouter>
        <DashboardHomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Crear tienda online")).toBeInTheDocument();
    expect(screen.getByText("Crear funnel")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /comenzar/i })).toHaveLength(2);
  });
});
