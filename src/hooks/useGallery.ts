'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/lib/stores/authStore';
import { gallerySettingsSchema, contactFormSchema } from '@/lib/schemas/gallery';
import type { ContactFormData, GalleryImage, GallerySettings } from '@/lib/schemas/gallery';

export function useGalleryImages() {
  return useQuery<GalleryImage[]>({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data } = await axios.get('/api/gallery');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60000,
  });
}

export function useGallerySettings() {
  return useQuery<GallerySettings>({
    queryKey: ['gallery-settings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/gallery/settings');
      try {
        return gallerySettingsSchema.parse(data);
      } catch {
        return data;
      }
    },
    staleTime: 60000,
  });
}

interface UploadPayload {
  image?: string;
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  category?: string;
  featured?: boolean;
}

interface UpdatePayload {
  id: string;
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  category?: string;
  featured?: boolean;
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async ({ image, title, description, category, featured }: UploadPayload) => {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ image, title, description, category, featured }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    },
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async ({ id, title, description, category, featured }: UpdatePayload) => {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, description, category, featured }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async (settings: Record<string, unknown>) => {
      const res = await fetch('/api/gallery/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-settings'] });
    },
  });
}

export function useMigrateImage() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async (imageId: string) => {
      const res = await fetch('/api/gallery/migrate', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Migration failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    },
  });
}

export function useBatchUpdate() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async ({ ids, title, description, category, featured }: { ids: string[] } & Record<string, unknown>) => {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids, title, description, category, featured }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Batch update failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    },
  });
}

export function useBatchDelete() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('Batch delete failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    },
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (form: ContactFormData) => {
      const parsed = contactFormSchema.parse(form);
      const res = await fetch('/api/gallery/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error('Failed to send');
      return res.json();
    },
  });
}
