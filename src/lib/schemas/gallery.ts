import { z } from 'zod';

const languageMap = z.object({
  en: z.string().default(''),
  es: z.string().default(''),
  pt: z.string().default(''),
});

export const galleryImageSchema = z.object({
  _id: z.string(),
  url: z.string(),
  title: languageMap,
  description: languageMap,
  category: z.string().default('others'),
  featured: z.boolean().default(false),
  createdAt: z.string().optional(),
});

export const categorySchema = z.object({
  id: z.string().min(1).max(50),
  name: languageMap,
  emoji: z.string().default('📁'),
  sortOrder: z.number().int().min(0).default(0),
});

export const gallerySettingsSchema = z.object({
  hero: z.object({
    title: languageMap,
    subtitle: languageMap,
    imageIds: z.array(z.string()).default([]),
  }),
  categories: z.object({
    items: z.array(categorySchema).default([]),
  }).default({ items: [] }),
  aboutMe: z.object({
    title: languageMap,
    text: languageMap,
    imageIds: z.array(z.string()).default([]),
  }),
  footer: z.object({
    text: languageMap,
    imageIds: z.array(z.string()).default([]),
  }),
});

export const uploadFormSchema = z.object({
  title: z.string().max(200).default(''),
  description: z.string().max(1000).default(''),
  category: z.string().min(1, 'Category is required'),
  featured: z.boolean().default(false),
});

export const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
});

export const DEFAULT_CATEGORIES = [
  { id: 'design', name: { en: 'Design', es: 'Diseño', pt: 'Design' }, emoji: '🎨', sortOrder: 0 },
  { id: 'aboutMe', name: { en: 'About Me', es: 'Sobre Mí', pt: 'Sobre Mim' }, emoji: '👤', sortOrder: 1 },
  { id: 'skate', name: { en: 'Skate', es: 'Skate', pt: 'Skate' }, emoji: '🛹', sortOrder: 2 },
  { id: 'drinks', name: { en: 'Drinks', es: 'Bebidas', pt: 'Bebidas' }, emoji: '🍹', sortOrder: 3 },
  { id: 'food', name: { en: 'Food', es: 'Comida', pt: 'Comida' }, emoji: '🍕', sortOrder: 4 },
  { id: 'others', name: { en: 'Others', es: 'Otros', pt: 'Outros' }, emoji: '✨', sortOrder: 5 },
] as const;

// Inferred types for use in other parts of the application
export type GalleryImage = z.infer<typeof galleryImageSchema>;
export type Category = z.infer<typeof categorySchema>;
export type GallerySettings = z.infer<typeof gallerySettingsSchema>;
export type UploadFormData = z.infer<typeof uploadFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
