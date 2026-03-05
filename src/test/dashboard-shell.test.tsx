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
    expect(screen.getByRole("link", { name: /funnels/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pedidos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /configuracion/i })).toBeInTheDocument();
  });

  it("shows the funnel-only dashboard home flow", () => {
    render(
      <MemoryRouter>
        <DashboardHomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Single Product Funnel Builder")).toBeInTheDocument();
    expect(screen.getByText(/crear funnel/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ir a funnels/i })).toBeInTheDocument();
  });
});
