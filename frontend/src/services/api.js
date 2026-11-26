const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new ApiError(payload.message || `Request failed (${response.status})`, response.status, payload.errors);
  }
  return payload.data;
}

export const applicationsApi = {
  list: ({ search = '', status = '', sort = 'newest' } = {}, signal) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (status) params.set('status', status);
    if (sort) params.set('sort', sort);
    const query = params.toString();
    return request(`/applications${query ? `?${query}` : ''}`, { signal });
  },
  stats: (signal) => request('/applications/stats', { signal }),
  get: (id) => request(`/applications/${id}`),
  create: (data) => request('/applications', { method: 'POST', body: data }),
  update: (id, data) => request(`/applications/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/applications/${id}`, { method: 'DELETE' }),
};
