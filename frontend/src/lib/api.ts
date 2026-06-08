import { isMockApiEnabled, mockApiRequest } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || '/api/v1';
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 12000);

class ApiClient {
  private baseUrl: string;
  private initData: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setInitData(initData: string) {
    this.initData = initData;
  }

  getInitData(): string {
    if (!this.initData && import.meta.env.DEV) {
      this.initData = 'mock';
    }

    return this.initData || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (isMockApiEnabled()) {
      return mockApiRequest<T>(endpoint, options);
    }

    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string> | undefined),
    };

    const initData = this.getInitData();
    if (initData) {
      headers['x-init-data'] = initData;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const detail = error?.detail;
        const message = response.status === 401
          ? 'Сессия Telegram недействительна. Откройте приложение заново.'
          : Array.isArray(detail)
            ? detail.map((item) => item.msg).join(', ')
            : detail || `HTTP ${response.status}`;
        throw new Error(message);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Сервер долго не отвечает. Проверьте подключение и повторите попытку.');
      }
      if (error instanceof TypeError) {
        throw new Error('Не удалось подключиться к API. Проверьте адрес сервера и его доступность.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
