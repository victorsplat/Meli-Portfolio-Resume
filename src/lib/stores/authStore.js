'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_KEY = 'gallery_admin_token';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,

      login: async (password) => {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${password}`,
          },
          body: JSON.stringify({ image: '', title: '', description: '' }),
        });

        if (res.status === 401 || res.status === 403) {
          return false;
        }

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
