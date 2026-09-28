import { API_URL } from '../config';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export const fetchHistory = (limit = 100) => request(`/api/messages?limit=${limit}`);

export const sendMessage = (username, text) =>
  request('/api/messages', { method: 'POST', body: JSON.stringify({ username, text }) });
