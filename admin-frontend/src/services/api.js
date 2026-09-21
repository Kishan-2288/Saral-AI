const API_URL =
  `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'}/api/v1`;

export async function api(path, options = {}) {
  const token = localStorage.getItem('saral_admin_token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let detail = 'Request failed';

    try {
      const payload = await response.json();
      detail = payload.detail || detail;
    } catch {
      // Keep generic error
    }

    throw new Error(detail);
  }

  if (response.status === 204) return null;

  return response.json();
}