import type { Article, Profile, Project } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD ? 'https://goffart-dev-1.onrender.com' : '');
const ADMIN_TOKEN_KEY = 'goffart-admin-token';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function authenticateAdmin(token: string): Promise<void> {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  try {
    await request<{ authenticated: boolean }>('/api/admin/verify');
  } catch (error) {
    clearAdminToken();
    throw error;
  }
}

export async function verifyAdminToken(): Promise<void> {
  if (!getAdminToken()) {
    throw new Error('Enter the admin token to continue.');
  }
  try {
    await request<{ authenticated: boolean }>('/api/admin/verify');
  } catch (error) {
    clearAdminToken();
    throw error;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = method !== 'GET' || path === '/api/admin/verify'
    ? getAdminToken()
    : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = payload && typeof payload.detail === 'string' ? payload.detail : 'Request failed';
    throw new Error(detail);
  }

  return payload as T;
}

export const listProfiles = () => request<Profile[]>('/api/profiles');
export const getProfile = (id: string) => request<Profile>(`/api/profiles/${id}`);
export const createProfile = (formData: FormData) => request<Profile>('/api/profiles', { method: 'POST', body: formData });
export const updateProfile = (id: string, formData: FormData) => request<Profile>(`/api/profiles/${id}`, { method: 'PATCH', body: formData });
export const deleteProfile = (id: string) => request<void>(`/api/profiles/${id}`, { method: 'DELETE' });

export const listArticles = () => request<Article[]>('/api/articles');
export const getArticle = (id: string) => request<Article>(`/api/articles/${id}`);
export const createArticle = (formData: FormData) => request<Article>('/api/articles', { method: 'POST', body: formData });
export const updateArticle = (id: string, formData: FormData) => request<Article>(`/api/articles/${id}`, { method: 'PATCH', body: formData });
export const deleteArticle = (id: string) => request<void>(`/api/articles/${id}`, { method: 'DELETE' });

export const listProjects = () => request<Project[]>('/api/projects');
export const getProject = (id: string) => request<Project>(`/api/projects/${id}`);
export const createProject = (formData: FormData) => request<Project>('/api/projects', { method: 'POST', body: formData });
export const updateProject = (id: string, formData: FormData) => request<Project>(`/api/projects/${id}`, { method: 'PATCH', body: formData });
export const deleteProject = (id: string) => request<void>(`/api/projects/${id}`, { method: 'DELETE' });
