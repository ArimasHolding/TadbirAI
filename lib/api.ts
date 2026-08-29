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
  const url = `${cleanBase}/${cleanPath}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
};
