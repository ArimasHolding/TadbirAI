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
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    return res;
  } catch (error) {
    console.warn(`[fetchAPI] Network request failed for ${url}, trying local fallback`, error);
    
    // If an external backend URL was configured and failed, attempt local Next.js API fallback
    if (cleanBase && typeof window !== "undefined") {
      try {
        const fallbackRes = await fetch(`/${cleanPath}`, {
          ...options,
          headers,
        });
        return fallbackRes;
      } catch (fbErr) {
        console.error(`[fetchAPI] Local fallback failed for /${cleanPath}`, fbErr);
      }
    }
    
    // Return safe fallback Response to prevent unhandled React runtime errors
    return new Response(
      JSON.stringify({ error: "Network error: backend endpoint unavailable", results: [] }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
