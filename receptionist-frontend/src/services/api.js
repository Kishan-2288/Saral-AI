const API_URL = `${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001').replace(/\/$/, '')}/api/v1`;

const TOKEN_KEY = 'saral_receptionist_token';

console.log("=================================");
console.log("SARAL RECEPTIONIST API");
console.log("API_URL:", API_URL);
console.log("=================================");

export async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const requestUrl = `${API_URL}${path}`;

  console.log("REQUEST URL:", requestUrl);
  console.log("METHOD:", options.method || "GET");

  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || 'Request failed');
  }

  return response.json();
}