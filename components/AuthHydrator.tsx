"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useTenantStore } from "@/lib/store/tenantStore";

export default function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  useEffect(() => { 
    hydrate(); 
    useTenantStore.getState().hydrate();

    const publicAuthPage = ["/login", "/register", "/forgot-password"].some(
      (path) => window.location.pathname.startsWith(path)
    );
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    const hasStoredSession = Boolean(
      isAuthenticated &&
      !publicAuthPage &&
      storedUser &&
      storedToken &&
      storedToken !== "demo_access_token" &&
      storedToken !== "session_token" &&
      storedToken !== "session_token_app"
    );
    let restoreFetch: (() => void) | undefined;

    // Tenant endpoints require authentication. Calling them from public auth
    // pages creates expected 401 responses and must never trigger a login loop.
    if (hasStoredSession) {
      useTenantStore.getState().fetchOrganizations();
    }

    // Global fetch interceptor to inject x-organization-id and catch 401s
    if (typeof window !== "undefined") {
      try {
        const originalFetch = window.fetch;
        if (typeof originalFetch === "function") {
          const interceptedFetch = async function (this: any, ...args: any[]) {
            // Auto inject active organization header for /api/ calls
            try {
              const activeOrg = localStorage.getItem("active_organization_id");
              if (activeOrg && args.length > 0) {
                const firstArg = args[0];
                const rawUrl = typeof firstArg === "string" ? firstArg : (firstArg && firstArg.url ? firstArg.url : "");
                if (typeof rawUrl === "string" && (rawUrl.startsWith("/api/") || rawUrl.includes("/api/"))) {
                  const options = args[1] ? { ...args[1] } : {};
                  const existingHeaders = options.headers;
                  if (existingHeaders instanceof Headers) {
                    if (!existingHeaders.has("x-organization-id")) {
                      existingHeaders.set("x-organization-id", activeOrg);
                    }
                  } else if (Array.isArray(existingHeaders)) {
                    const hasOrg = existingHeaders.some(([k]) => k.toLowerCase() === "x-organization-id");
                    if (!hasOrg) {
                      existingHeaders.push(["x-organization-id", activeOrg]);
                    }
                  } else if (typeof existingHeaders === "object" && existingHeaders !== null) {
                    if (!existingHeaders["x-organization-id"]) {
                      options.headers = { ...existingHeaders, "x-organization-id": activeOrg };
                    }
                  } else {
                    options.headers = { "x-organization-id": activeOrg };
                  }
                  args[1] = options;
                }
              }
            } catch (err) {
              // Ignore header injection error
            }

            const response = await originalFetch(...(args as [RequestInfo, RequestInit?]));
            if (response && response.status === 401) {
              const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url ? args[0].url : "");
              const publicAuthPage = ["/login", "/register", "/forgot-password"].some(
                (path) => window.location.pathname.startsWith(path)
              );
              const sessionToken = localStorage.getItem("access_token");
              const hasSession = Boolean(
                localStorage.getItem("user") &&
                sessionToken &&
                sessionToken !== "demo_access_token" &&
                sessionToken !== "session_token" &&
                sessionToken !== "session_token_app"
              );
              const publicAuthRequest = [
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/check-user",
                "/api/auth/reset-password",
                "/api/token/refresh/",
              ].some((path) => url.includes(path));

              if (hasSession && !publicAuthPage && !publicAuthRequest) {
                useAuthStore.getState().logout();
                window.location.replace('/login?expired=1');
              }
            }
            return response;
          };

          try {
            window.fetch = interceptedFetch;
          } catch {
            try {
              Object.defineProperty(window, "fetch", {
                value: interceptedFetch,
                writable: true,
                configurable: true,
              });
            } catch {
              // Environment strictly protects window.fetch as getter-only, ignore
            }
          }

          if (window.fetch === interceptedFetch) {
            restoreFetch = () => {
              if (window.fetch === interceptedFetch) {
                window.fetch = originalFetch;
              }
            };
          }
        }
      } catch (err) {
        console.warn("Could not attach fetch interceptor:", err);
      }
    }
    
    // Hydrate theme mode on app load
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "dark";
      if (savedTheme === "light") {
        document.documentElement.classList.add("light-mode");
      } else if (savedTheme === "system" && window.matchMedia("(prefers-color-scheme: light)").matches) {
        document.documentElement.classList.add("light-mode");
      } else {
        document.documentElement.classList.remove("light-mode");
      }
      
      // Fetch and sync global settings from backend to local cache
      const token = storedToken;
      const activeOrg = typeof window !== "undefined" ? localStorage.getItem("active_organization_id") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (activeOrg) headers["x-organization-id"] = activeOrg;

      if (hasStoredSession) {
        fetch("/api/settings", { headers, cache: "no-store" })
          .then(async (res) => {
          if (!res.ok) return null;
          const text = await res.text();
          if (!text) return null;
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
        })
          .then((data) => {
          if (!data || typeof data !== "object") return;
          let updated = false;
          if (data.devise && data.devise !== localStorage.getItem("devise")) {
            localStorage.setItem("devise", data.devise);
            updated = true;
          }
          if (data.formatDate && data.formatDate !== localStorage.getItem("formatDate")) {
            localStorage.setItem("formatDate", data.formatDate);
            updated = true;
          }
          if (updated) {
            window.dispatchEvent(new CustomEvent("settingsUpdated"));
          }
        })
          .catch((err) => {
          // Non-blocking warning for offline or unauthenticated startup
          console.warn("Could not sync settings on startup", err);
          });
      }
    }

    return () => restoreFetch?.();
  }, [hydrate, isAuthenticated]);

  return null;
}
