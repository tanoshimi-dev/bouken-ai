import { useEffect, useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { setUser, clearUser } from '@/store/authSlice';
import { apiClient } from '@/config/api';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    async function fetchUser() {
      // First try to load saved tokens
      const tokens = await authService.loadTokens();
      if (!tokens) {
        dispatch(clearUser());
        return;
      }

      try {
        const res = await apiClient.getMe();
        dispatch(setUser(res.data));
      } catch {
        // Token may be expired, try refresh
        const refreshed = await authService.refreshAccessToken();
        if (refreshed) {
          try {
            const res = await apiClient.getMe();
            dispatch(setUser(res.data));
            return;
          } catch {
            // refresh also failed
          }
        }
        await authService.clearTokens();
        dispatch(clearUser());
      }
    }
    fetchUser();
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      // ignore errors
    }
    await authService.clearTokens();
    dispatch(clearUser());
  }, [dispatch]);

  return { user, isAuthenticated, isLoading, logout };
}
