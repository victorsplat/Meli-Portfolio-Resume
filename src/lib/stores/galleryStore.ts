'use client';

import { create } from 'zustand';

export interface UploadFile {
  id: string;
  originalName: string;
  preview?: string;
  _isObjectUrl?: boolean;
  [key: string]: unknown;
}

interface UploadProgress {
  current: number;
  total: number;
  errors: string[];
}

interface GalleryState {
  selectedImage: unknown | null;
  uploadFiles: UploadFile[];
  uploadProgress: UploadProgress;
  isUploading: boolean;
  setSelectedImage: (img: unknown | null) => void;
  setUploadFiles: (files: UploadFile[]) => void;
  addUploadFiles: (files: UploadFile[]) => void;
  removeUploadFile: (id: string) => void;
  replaceUploadFile: (id: string, data: Partial<UploadFile>) => void;
  setUploadProgress: (current: number, total: number, errors?: string[]) => void;
  setIsUploading: (v: boolean) => void;
  resetUpload: () => void;
}

export const useGalleryStore = create<GalleryState>((set, _get) => ({
  selectedImage: null,
  uploadFiles: [],
  uploadProgress: { current: 0, total: 0, errors: [] },
  isUploading: false,

  setSelectedImage: (img) => set({ selectedImage: img }),

  setUploadFiles: (files) => set({ uploadFiles: files }),

  addUploadFiles: (files) =>
    set((state) => {
      const existing = new Set(state.uploadFiles.map((f) => f.originalName));
      const unique = files.filter((f) => !existing.has(f.originalName));
      return {
        uploadFiles: [...state.uploadFiles, ...unique].slice(0, 20),
      };
    }),

  removeUploadFile: (id) =>
    set((state) => {
      const hit = state.uploadFiles.find((f) => f.id === id);
      if (hit && hit._isObjectUrl) URL.revokeObjectURL(hit.preview!);
      return { uploadFiles: state.uploadFiles.filter((f) => f.id !== id) };
    }),

  replaceUploadFile: (id, data) =>
    set((state) => ({
      uploadFiles: state.uploadFiles.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),

  setUploadProgress: (current, total, errors) =>
    set({ uploadProgress: { current, total, errors: errors || [] } }),

  setIsUploading: (v) => set({ isUploading: v }),

  resetUpload: () =>
    set({
      uploadFiles: [],
      uploadProgress: { current: 0, total: 0, errors: [] },
      isUploading: false,
    }),
}));
