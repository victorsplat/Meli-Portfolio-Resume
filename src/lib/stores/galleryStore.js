'use client';

import { create } from 'zustand';

export const useGalleryStore = create((set, get) => ({
  selectedImage: null,
  uploadFiles: [],
  uploadProgress: { current: 0, total: 0 },
  isUploading: false,

  setSelectedImage: (img) => set({ selectedImage: img }),

  setUploadFiles: (files) => set({ uploadFiles: files }),

  addUploadFiles: (files) =>
    set((state) => ({
      uploadFiles: [...state.uploadFiles, ...files].slice(0, 20),
    })),

  removeUploadFile: (id) =>
    set((state) => ({
      uploadFiles: state.uploadFiles.filter((f) => f.id !== id),
    })),

  setUploadProgress: (current, total) =>
    set({ uploadProgress: { current, total } }),

  setIsUploading: (v) => set({ isUploading: v }),

  resetUpload: () =>
    set({
      uploadFiles: [],
      uploadProgress: { current: 0, total: 0 },
      isUploading: false,
    }),
}));
