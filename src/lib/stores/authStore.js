'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_KEY = 'gallery_admin_token';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,

      login: async (password) => {
        const res = await fetch('/api/gallery/auth', {
          method: 'POST',
          headers: { Authorization: `Bearer ${password}` },
        });

        if (res.status === 401 || res.status === 403) return false;
        if (!res.ok) throw new Error('Auth service unavailable');

        set({ token: password });
        return true;
      },

      logout: () => {
        set({ token: null });
      },

      getAuthHeaders: () => {
        const token = get().token;
        if (!token) return { 'Content-Type': 'application/json' };
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };
      },
    }),
    {
      name: AUTH_KEY,
      partialize: (state) => ({ token: state.token }),
    }
  )
);
