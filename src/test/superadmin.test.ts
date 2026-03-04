import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteSuperAdminClient,
  isSuperAdminEmail,
  loadSuperAdminClients,
  toggleSuperAdminClientStatus,
  updateSuperAdminClientPlan,
} from "@/lib/superadmin";
import { loadPlatformSettings } from "@/lib/platform-data";

describe("superadmin data", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("only keeps the protected root client when no real accounts exist", () => {
    const clients = loadSuperAdminClients();
    const rootClient = clients[0];

    expect(clients).toHaveLength(1);
    expect(rootClient?.ownerEmail).toBe("afiliadosprobusiness@gmail.com");
    expect(rootClient?.isProtected).toBe(true);
    expect(isSuperAdminEmail(rootClient?.ownerEmail)).toBe(true);
  });

  it("does not delete the protected root client", () => {
    const clients = loadSuperAdminClients();
    const rootClient = clients.find((client) => client.isProtected);

    const nextClients = deleteSuperAdminClient(rootClient?.id || "");

    expect(nextClients.some((client) => client.id === rootClient?.id)).toBe(true);
  });

  it("removes legacy demo clients and keeps only real stored ones", () => {
    window.localStorage.setItem(
      "shopcod-superadmin-clients-v1",
      JSON.stringify([
        {
          id: "legacy-demo",
          workspaceName: "COD Growth Lab",
          companyName: "COD Growth Lab",
          ownerName: "Mariana Ortiz",
          ownerEmail: "mariana@codgrowthlab.com",
          planName: "Growth",
          status: "active",
          storesCount: 4,
          funnelsCount: 7,
          ordersCount: 94,
          revenue: 18430,
          createdAt: "2026-03-04T00:00:00.000Z",
          updatedAt: "2026-03-04T00:00:00.000Z",
          isProtected: false,
        },
      ]),
    );

    const clients = loadSuperAdminClients();

    expect(clients).toHaveLength(1);
    expect(clients[0]?.isProtected).toBe(true);
  });

  it("toggles, changes plan, and deletes regular clients", () => {
    window.localStorage.setItem("shopcod-settings-v1", JSON.stringify(loadPlatformSettings()));

    const clients = loadSuperAdminClients();
    const regularClient = clients.find((client) => !client.isProtected);

    expect(regularClient).toBeTruthy();

    const toggled = toggleSuperAdminClientStatus(regularClient!.id);
    const updatedClient = toggled.find((client) => client.id === regularClient!.id);

    expect(updatedClient?.status).not.toBe(regularClient?.status);

    const afterPlanChange = updateSuperAdminClientPlan(regularClient!.id, "scale");
    const repricedClient = afterPlanChange.find((client) => client.id === regularClient!.id);

    expect(repricedClient?.planName).toBe("Scale");
    expect(loadPlatformSettings().billing.planName).toBe("Scale");

    const afterDelete = deleteSuperAdminClient(regularClient!.id);

    expect(afterDelete.some((client) => client.id === regularClient!.id)).toBe(false);
  });
});
