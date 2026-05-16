'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/lib/stores/authStore';
import { galleryImageSchema, gallerySettingsSchema, contactFormSchema } from '@/lib/schemas/gallery';

export function useGalleryImages() {
  return useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data } = await axios.get('/api/gallery');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60000,
  });
}

export function useGallerySettings() {
  return useQuery({
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

export function useUploadImage() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async ({ image, title, description, category, featured }) => {
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

export function useDeleteImage() {
  const queryClient = useQueryClient();
  const getAuthHeaders = useAuthStore((s) => s.getAuthHeaders);

  return useMutation({
    mutationFn: async (id) => {
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
    mutationFn: async (settings) => {
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

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (form) => {
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
