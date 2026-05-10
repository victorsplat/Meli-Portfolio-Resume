'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import PageHeader from '@/components/PageHeader';
import GalleryLightbox from '@/components/GalleryLightbox';

export default function GalleryPage() {
  const { t } = useI18n();
  usePageTitle('gallery.title');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-bg-app">
      <div className="container py-12">
        <PageHeader />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="title text-4xl md:text-5xl">{t('gallery.title')}</h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
          <Link href="/" className="btn btn-sm mt-6 inline-block">
            {t('gallery.backToHome')}
          </Link>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-xl text-muted animate-pulse">{t('gallery.loading')}</div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">{t('gallery.noImages')}</p>
            <p className="text-sm text-muted mt-2">{t('gallery.addImages')}</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {images.map((img, index) => (
              <motion.div
                key={img._id || index}
                variants={itemVariants}
                className="card card-hover overflow-hidden cursor-pointer group"
                onClick={() => setSelectedImage(img)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <img
                    src={img.url || img.src}
                    alt={img.title || img.alt || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {(img.title || img.description) && (
                  <div className="mt-4">
                    {img.title && (
                      <h3 className="text-lg font-semibold text-accent dark:text-white">
                        {img.title}
                      </h3>
                    )}
                    {img.description && (
                      <p className="text-muted text-sm mt-1">{img.description}</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <GalleryLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}