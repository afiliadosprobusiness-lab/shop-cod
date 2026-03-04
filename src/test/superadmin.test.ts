import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteSuperAdminClient,
  isSuperAdminEmail,
  loadSuperAdminClients,
  toggleSuperAdminClientStatus,
} from "@/lib/superadmin";

describe("superadmin data", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("always seeds a protected superadmin root client", () => {
    const clients = loadSuperAdminClients();
    const rootClient = clients[0];

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

  it("toggles and deletes regular clients", () => {
    const clients = loadSuperAdminClients();
    const regularClient = clients.find((client) => !client.isProtected);

    expect(regularClient).toBeTruthy();

    const toggled = toggleSuperAdminClientStatus(regularClient!.id);
    const updatedClient = toggled.find((client) => client.id === regularClient!.id);

    expect(updatedClient?.status).not.toBe(regularClient?.status);

    const afterDelete = deleteSuperAdminClient(regularClient!.id);

    expect(afterDelete.some((client) => client.id === regularClient!.id)).toBe(false);
  });
});
