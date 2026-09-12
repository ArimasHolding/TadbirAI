import { create } from "zustand";

export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_identifier?: string;
  ice?: string;
  currency?: string;
  is_active?: boolean;
}

interface TenantState {
  organizations: Organization[];
  currentOrganizationId: string | null;
  currentOrganization: Organization | null;
  isLoading: boolean;
  setCurrentOrganization: (orgId: string) => void;
  fetchOrganizations: () => Promise<void>;
  createOrganization: (data: Partial<Organization>) => Promise<Organization | null>;
  hydrate: () => void;
}

const DEFAULT_ORGANIZATION: Organization = {
  id: "comp-1787081124495-1-cd1q",
  name: "Tadbir AI Demo",
  email: "demo@tadbir.ai",
  country: "Maroc",
  currency: "MAD",
  is_active: true,
};

export const useTenantStore = create<TenantState>((set, get) => ({
  organizations: [DEFAULT_ORGANIZATION],
  currentOrganizationId: DEFAULT_ORGANIZATION.id,
  currentOrganization: DEFAULT_ORGANIZATION,
  isLoading: false,

  setCurrentOrganization: (orgId: string) => {
    const orgs = get().organizations;
    const selected = orgs.find((o) => o.id === orgId) || orgs[0] || DEFAULT_ORGANIZATION;

    if (typeof window !== "undefined") {
      localStorage.setItem("active_organization_id", selected.id);
      document.cookie = `x-organization-id=${encodeURIComponent(selected.id)}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(
        new CustomEvent("tenantChanged", { detail: { organizationId: selected.id, organization: selected } })
      );
    }

    set({
      currentOrganizationId: selected.id,
      currentOrganization: selected,
    });
  },

  fetchOrganizations: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const data = await res.json();
        const list: Organization[] = Array.isArray(data) && data.length > 0 ? data : [DEFAULT_ORGANIZATION];

        const savedId = typeof window !== "undefined" ? localStorage.getItem("active_organization_id") : null;
        const active = list.find((o) => o.id === savedId) || list[0];

        if (typeof window !== "undefined") {
          localStorage.setItem("active_organization_id", active.id);
          document.cookie = `x-organization-id=${encodeURIComponent(active.id)}; path=/; max-age=31536000; SameSite=Lax`;
        }

        set({
          organizations: list,
          currentOrganizationId: active.id,
          currentOrganization: active,
          isLoading: false,
        });
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch companies list, using fallback:", err);
    }

    set({
      organizations: [DEFAULT_ORGANIZATION],
      currentOrganizationId: DEFAULT_ORGANIZATION.id,
      currentOrganization: DEFAULT_ORGANIZATION,
      isLoading: false,
    });
  },

  createOrganization: async (data: Partial<Organization>) => {
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created: Organization = await res.json();
        const updatedOrgs = [...get().organizations, created];
        set({ organizations: updatedOrgs });
        // Automatically switch to newly created organization
        get().setCurrentOrganization(created.id);
        return created;
      }
    } catch (err) {
      console.error("Failed to create organization:", err);
    }
    return null;
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const savedId = localStorage.getItem("active_organization_id");
    const orgs = get().organizations;
    if (savedId) {
      const matched = orgs.find((o) => o.id === savedId);
      if (matched) {
        set({
          currentOrganizationId: matched.id,
          currentOrganization: matched,
        });
      }
    }
  },
}));
