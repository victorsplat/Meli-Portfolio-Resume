'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function UploadOverlay({ uploading, progress }) {
  return (
    <AnimatePresence>
      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-bg-app rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center"
          >
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-lg font-bold mb-2">Uploading images</h3>
            <p className="text-sm text-muted mb-6">
              {progress.current} of {progress.total} complete
            </p>
            <div className="w-full h-2 rounded-full bg-accent/10 dark:bg-white/10 overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full bg-[#FFE600]"
                initial={{ width: 0 }}
                animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {progress.errors.length > 0 && (
              <p className="text-xs text-red-400 mb-4">
                {progress.errors.length} error{progress.errors.length > 1 ? 's' : ''}
              </p>
            )}
            <p className="text-xs text-muted">Please don't close this page</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
