'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LightboxImage {
  _id?: string;
  url?: string;
  src?: string;
  title?: string;
  description?: string;
  category?: string;
  featured?: boolean;
}

interface GalleryLightboxProps {
  image: LightboxImage | null;
  onClose?: () => void;
  onDelete?: (id: string) => void;
  deleteLabel?: string;
  categoryLabel?: string;
  categoryEmoji?: string;
  images?: LightboxImage[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

export default function GalleryLightbox({
  image, onClose, onDelete, deleteLabel, categoryLabel, categoryEmoji,
  images, currentIndex = 0, onNavigate,
}: GalleryLightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose?.();
    if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) {
      e.preventDefault();
      onNavigate(currentIndex - 1);
    }
    if (e.key === 'ArrowRight' && onNavigate && images && currentIndex < images.length - 1) {
      e.preventDefault();
      onNavigate(currentIndex + 1);
    }
  }, [onClose, onNavigate, currentIndex, images]);

  useEffect(() => {
    if (!image) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [image, handleKeyDown]);

  const hasPrev = onNavigate && currentIndex > 0;
  const hasNext = onNavigate && images && currentIndex < images.length - 1;

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-4">
              {hasPrev && (
                <button
                  onClick={() => onNavigate(currentIndex - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              <div className="relative rounded-lg overflow-hidden max-w-full">
                <button
                  onClick={onClose}
                  className="absolute -top-12 right-0 text-white/70 text-2xl hover:text-[#FFE600] transition-colors z-10"
                  aria-label="Close lightbox"
                >
                  ✕
                </button>
                <img
                  src={image.url || image.src}
                  alt={image.title || 'Gallery image'}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                {(image.title || image.description || categoryLabel || onDelete) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12">
                    <div className="flex justify-between items-end gap-4">
                      <div className="flex-1">
                        {image.featured && (
                          <span className="inline-block bg-[#FFE600] text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                            ★ Featured
                          </span>
                        )}
                        {image.title && (
                          <h3 id="lightbox-title" className="text-xl text-white font-semibold">{image.title}</h3>
                        )}
                        {image.description && (
                          <p className="text-gray-300 mt-1 text-sm">{image.description}</p>
                        )}
                        {(categoryLabel || image.category) && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-2">
                            {categoryEmoji} {categoryLabel || image.category}
                          </span>
                        )}
                      </div>
                      {onDelete && (
                        <button
                          onClick={() => image._id && onDelete(image._id)}
                          className="bg-red-500/90 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex-shrink-0 text-sm"
                        >
                          {deleteLabel || 'Delete'}
                        </button>
                      )}
                    </div>
                    {images && images.length > 1 && (
                      <div className="mt-3 text-center text-xs text-gray-500">
                        {currentIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {hasNext && (
                <button
                  onClick={() => onNavigate(currentIndex + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
