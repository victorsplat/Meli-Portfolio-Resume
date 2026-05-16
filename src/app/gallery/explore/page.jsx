'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import CircularGallery from '@/components/ui/circular-gallery';
import GalleryFooter from '@/components/GalleryFooter';

const categoryMeta = {
  design: { emoji: '🎨', en: 'Design', es: 'Diseño', pt: 'Design' },
  aboutMe: { emoji: '👤', en: 'About Me', es: 'Sobre Mí', pt: 'Sobre Mim' },
  skate: { emoji: '🛹', en: 'Skate', es: 'Skate', pt: 'Skate' },
  drinks: { emoji: '🍹', en: 'Drinks', es: 'Bebidas', pt: 'Bebidas' },
  food: { emoji: '🍕', en: 'Food', es: 'Comida', pt: 'Comida' },
  others: { emoji: '✨', en: 'Others', es: 'Otros', pt: 'Outros' },
};

function getCategoryLabel(cat, lang) {
  const meta = categoryMeta[cat];
  if (!meta) return cat;
  return meta[lang] || meta.en;
}

function mapToGalleryItem(img, lang) {
  return {
    common: img.title || 'Untitled',
    binomial: getCategoryLabel(img.category, lang),
    photo: {
      url: img.url,
      text: img.description || '',
      pos: 'center',
      by: 'Victor do Prado',
    },
  };
}

export default function ExplorePage() {
  const { t, lang } = useI18n();
  usePageTitle('gallery.explore');
  const [activeCategory, setActiveCategory] = useState('all');
  const [radius, setRadius] = useState(600);

  useEffect(() => {
    window.scrollTo(0, 0);
    setRadius(Math.min(600, window.innerWidth * 0.4));
  }, []);

  useEffect(() => {
    function handleResize() {
      setRadius(Math.min(600, window.innerWidth * 0.4));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const res = await axios.get('/api/gallery');
      return res.data;
    },
    staleTime: 60000,
  });

  const categories = useMemo(() => {
    return [...new Set(images.map(img => img.category))].sort();
  }, [images]);

  const galleryItems = useMemo(() => {
    const filtered = activeCategory === 'all'
      ? images
      : images.filter(img => img.category === activeCategory);
    return filtered.map(img => mapToGalleryItem(img, lang));
  }, [images, activeCategory, lang]);

  return (
    <div className="min-h-screen bg-bg-app">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-app"
          >
            <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-6" />
            <p className="text-muted text-lg">{t('gallery.loading')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && images.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="text-6xl mb-6">🖼️</div>
          <p className="text-muted text-lg">{t('gallery.noImages')}</p>
          <p className="text-sm text-muted mt-2">{t('gallery.addImages')}</p>
        </div>
      )}

      {/* Gallery 3D + Categories */}
      {!isLoading && images.length > 0 && (
        <div style={{ height: '500vh' }}>
          <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
            {/* Sticky Category Header */}
            <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-20 w-full px-4">
              <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === 'all'
                      ? 'bg-[#FFE600] text-[#111827] shadow-lg shadow-[#FFE600]/20'
                      : 'bg-white/50 dark:bg-white/5 text-muted hover:bg-white/80 dark:hover:bg-white/10 border border-panel-border backdrop-blur-sm'
                  }`}
                >
                  {t('gallery.allCategories')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                      activeCategory === cat
                        ? 'bg-[#FFE600] text-[#111827] shadow-lg shadow-[#FFE600]/20'
                        : 'bg-white/50 dark:bg-white/5 text-muted hover:bg-white/80 dark:hover:bg-white/10 border border-panel-border backdrop-blur-sm'
                    }`}
                  >
                    <span>{categoryMeta[cat]?.emoji}</span>
                    <span>{getCategoryLabel(cat, lang)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Circular Gallery */}
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <CircularGallery items={galleryItems} radius={radius} />
            </motion.div>
          </div>
        </div>
      )}

      {/* Footer */}
      {!isLoading && images.length > 0 && <GalleryFooter t={t} />}
    </div>
  );
}
