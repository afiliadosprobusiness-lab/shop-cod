export type FunnelWorkspaceStatus = "draft" | "published";

export interface FunnelWorkspaceConfig {
  headerScripts: string;
  faviconUrl: string;
  autocompleteAddress: boolean;
  fireLeadEvent: boolean;
  languages: string[];
  status: FunnelWorkspaceStatus;
  updatedAt: string;
}

const FUNNEL_WORKSPACE_STORAGE_KEY = "shopcod-funnel-workspace-v1";

const defaultWorkspaceConfig: FunnelWorkspaceConfig = {
  headerScripts: "",
  faviconUrl: "",
  autocompleteAddress: false,
  fireLeadEvent: false,
  languages: ["es"],
  status: "draft",
  updatedAt: new Date().toISOString(),
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeConfig(candidate: unknown): FunnelWorkspaceConfig {
  if (!candidate || typeof candidate !== "object") {
    return { ...defaultWorkspaceConfig };
  }

  const raw = candidate as Partial<FunnelWorkspaceConfig>;

  return {
    headerScripts: typeof raw.headerScripts === "string" ? raw.headerScripts : "",
    faviconUrl: typeof raw.faviconUrl === "string" ? raw.faviconUrl : "",
    autocompleteAddress: Boolean(raw.autocompleteAddress),
    fireLeadEvent: Boolean(raw.fireLeadEvent),
    languages: Array.isArray(raw.languages)
      ? raw.languages.filter((language): language is string => typeof language === "string")
      : ["es"],
    status: raw.status === "published" ? "published" : "draft",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

function readAllConfigs() {
  if (!canUseStorage()) {
    return {} as Record<string, FunnelWorkspaceConfig>;
  }

  const rawValue = window.localStorage.getItem(FUNNEL_WORKSPACE_STORAGE_KEY);

  if (!rawValue) {
    return {} as Record<string, FunnelWorkspaceConfig>;
  }

  try {
    const parsed = JSON.parse(rawValue) as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(parsed).map(([funnelId, config]) => [funnelId, normalizeConfig(config)]),
    );
  } catch {
    return {} as Record<string, FunnelWorkspaceConfig>;
  }
}

function writeAllConfigs(value: Record<string, FunnelWorkspaceConfig>) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(FUNNEL_WORKSPACE_STORAGE_KEY, JSON.stringify(value));
}

export function loadFunnelWorkspaceConfig(funnelId: string) {
  const configs = readAllConfigs();
  return configs[funnelId] ?? { ...defaultWorkspaceConfig };
}

export function saveFunnelWorkspaceConfig(
  funnelId: string,
  input: Partial<FunnelWorkspaceConfig>,
) {
  const configs = readAllConfigs();
  const current = configs[funnelId] ?? { ...defaultWorkspaceConfig };
  const next: FunnelWorkspaceConfig = {
    ...current,
    ...input,
    languages: Array.isArray(input.languages)
      ? input.languages.filter((language): language is string => typeof language === "string")
      : current.languages,
    status: input.status === "published" ? "published" : input.status === "draft" ? "draft" : current.status,
    updatedAt: new Date().toISOString(),
  };

  writeAllConfigs({
    ...configs,
    [funnelId]: next,
  });

  return next;
}
