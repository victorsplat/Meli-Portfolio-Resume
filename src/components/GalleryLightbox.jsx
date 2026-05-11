'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function GalleryLightbox({ image, onClose, onDelete, deleteLabel, categoryLabel, categoryEmoji }) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white/70 text-2xl hover:text-[#FFE600] transition-colors z-10"
            >
              ✕
            </button>
            <div className="relative rounded-lg overflow-hidden">
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
                        <h3 className="text-xl text-white font-semibold">{image.title}</h3>
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
                        onClick={() => onDelete(image._id)}
                        className="bg-red-500/90 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex-shrink-0 text-sm"
                      >
                        {deleteLabel || 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
