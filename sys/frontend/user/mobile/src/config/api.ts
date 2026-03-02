import { createApiClient, ApiError } from '@learn-claude-code/api-client';
import { ENV } from './env';
import { authService } from '@/services/auth.service';

const baseClient = createApiClient({
  baseUrl: ENV.API_URL,
  getAccessToken: () => authService.getAccessToken(),
});

// Proxy wrapper that retries on 401 with automatic token refresh
export const apiClient = new Proxy(baseClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value !== 'function') return value;

    return async (...args: unknown[]) => {
      try {
        return await (value as Function).apply(target, args);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            return await (value as Function).apply(target, args);
          }
        }
        throw error;
      }
    };
  },
});
