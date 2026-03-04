import { beforeEach, describe, expect, it } from "vitest";
import {
  applyPlanToSettings,
  getAdvancedAnalyticsAccess,
  getMultiUserAccess,
  getStoreCreationAccess,
} from "@/lib/plans";
import { loadPlatformSettings } from "@/lib/platform-data";

describe("plan access", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("blocks second store on starter", () => {
    const access = getStoreCreationAccess(1);

    expect(access.allowed).toBe(false);
    expect(access.requiredPlan.id).toBe("pro");
  });

  it("unlocks advanced analytics on pro", () => {
    applyPlanToSettings(loadPlatformSettings(), "pro");

    const access = getAdvancedAnalyticsAccess();

    expect(access.allowed).toBe(true);
  });

  it("only unlocks multi-user on scale", () => {
    applyPlanToSettings(loadPlatformSettings(), "pro");
    expect(getMultiUserAccess().allowed).toBe(false);

    applyPlanToSettings(loadPlatformSettings(), "scale");
    expect(getMultiUserAccess().allowed).toBe(true);
  });
});
