const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function fetchAPI(endpoint: string, options: RequestOptions = {}) {
  const { token, headers = {}, ...rest } = options;
  
  const mergedHeaders = new Headers(headers);
  mergedHeaders.set('Content-Type', 'application/json');
  
  if (token) {
    mergedHeaders.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...rest,
      headers: mergedHeaders,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    // Handles 204 No Content or empty bodies gracefully
    if (res.status === 204) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`[API Error] Fetch to ${url} failed:`, error);
    throw error;
  }
}
