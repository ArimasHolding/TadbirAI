import toast from "react-hot-toast";

const DEFAULT_API_URL = "";

/**
 * Returns the resolved backend API base URL from env variables or fallback.
 */
export const getAPIUrl = (): string => {
  if (typeof window !== "undefined") {
    // Allows dynamic overriding in local dev storage if needed
    const overridden = window.localStorage.getItem("API_URL");
    if (overridden) return overridden;
  }
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
};

// Global flag to prevent infinite refresh loops
let isRefreshing = false;

/**
 * Centralized fetch helper for Tadbir AI API calls.
 * Automatically prepends the base API URL and default headers.
 *
 * @param path Endpoint path (e.g. "api/products/")
 * @param options Request options
 */
export const fetchAPI = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const baseUrl = getAPIUrl();
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  const url = cleanBase ? `${cleanBase}/${cleanPath}` : `/${cleanPath}`;
  
  const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
  const authHeader: Record<string, string> = {};
  if (token && token !== "demo_access_token" && token !== "session_token") {
    authHeader["Authorization"] = `Bearer ${token}`;
  }

  const orgId = typeof window !== "undefined" ? window.localStorage.getItem("active_organization_id") : null;
  const orgHeader: Record<string, string> = {};
  if (orgId) {
    orgHeader["x-organization-id"] = orgId;
  }
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeader,
    ...orgHeader,
    ...(options.headers as Record<string, string> || {}),
  };
  
  try {
    let res = await fetch(url, {
      ...options,
      headers,
    });

    // Handle Token Refresh Interception
    if (res.status === 401 && token && !isRefreshing && !path.includes("token/refresh")) {
      const refreshToken = typeof window !== "undefined" ? window.localStorage.getItem("refresh_token") : null;
      if (refreshToken) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${cleanBase}/api/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (typeof window !== "undefined") {
              window.localStorage.setItem("access_token", data.access);
              document.cookie = `access_token=${data.access}; path=/; max-age=86400; SameSite=Lax`;
            }
            
            // Retry the original request with the new token
            headers["Authorization"] = `Bearer ${data.access}`;
            res = await fetch(url, {
              ...options,
              headers,
            });
          } else {
            // Refresh failed, clear session
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("access_token");
              window.localStorage.removeItem("refresh_token");
              window.localStorage.removeItem("user");
              window.location.href = "/login?expired=1";
            }
          }
        } catch (refreshErr) {
          console.error("Token refresh failed", refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Optional: Alert on 500 errors so silent catch() blocks don't hide backend crashes
    if (res.status >= 500) {
      toast.error("Erreur du serveur (5xx). Veuillez réessayer plus tard.");
    }

    return res;
  } catch (error) {
    console.error(`[fetchAPI] Network request failed for ${url}`, error);
    toast.error("Erreur réseau: Impossible de joindre le serveur.");
    
    // Return safe fallback Response to prevent unhandled React runtime errors, 
    // but clearly indicate that the external backend failed rather than masking it.
    return new Response(
      JSON.stringify({ 
        error: "Network error: Le serveur backend (Django) est injoignable. Vérifiez qu'il est bien démarré ou configuré.", 
        details: error instanceof Error ? error.message : "Unknown error",
        results: [] 
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
