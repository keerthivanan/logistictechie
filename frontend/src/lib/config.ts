export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(process.env.NODE_ENV === 'development' ? { 'ngrok-skip-browser-warning': 'true' } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  return fetch(`${API_URL}${path}`, { ...options, headers });
}
