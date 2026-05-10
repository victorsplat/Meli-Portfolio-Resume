'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function GalleryLightbox({ image, onClose, onDelete, deleteLabel }) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-[#FFE600] transition-colors"
            >
              ✕
            </button>
            <img
              src={image.url || image.src}
              alt={image.title || 'Gallery image'}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
            {(image.title || image.description || onDelete) && (
              <div className="mt-4 flex justify-between items-start gap-4">
                <div className="text-center flex-1">
                  {image.title && (
                    <h3 className="text-xl text-white font-semibold">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-gray-300 mt-1">{image.description}</p>
                  )}
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(image._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex-shrink-0"
                  >
                    {deleteLabel || 'Delete'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
