'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import { useGalleryImages, useGallerySettings } from '@/hooks/useGallery';
import CircularGallery from '@/components/ui/circular-gallery';
import GalleryFooter from '@/components/GalleryFooter';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';

function mapToGalleryItem(img, catLabel, lang) {
  const titleText = img.title?.[lang] || img.title?.en || 'Untitled';
  const descText = img.description?.[lang] || img.description?.en || '';
  return {
    common: titleText,
    binomial: catLabel,
    photo: {
      url: img.url,
      text: descText,
      pos: 'center',
      by: 'Victor do Prado',
    },
  };
}

export default function ExplorePage() {
  const { t, lang } = useI18n();
  usePageTitle('gallery.explore');
  const [activeCategory, setActiveCategory] = useState('all');
  const [radius, setRadius] = useState(500);
  const [showFooter, setShowFooter] = useState(false);

  const { data: images = [], isLoading } = useGalleryImages();
  const { data: settings } = useGallerySettings();

  const categories = useMemo(() => {
    return settings?.categories?.items || [];
  }, [settings]);

  useEffect(() => {
    setRadius(Math.min(500, window.innerWidth * 0.35));
  }, []);

  useEffect(() => {
    function handleResize() {
      setRadius(Math.min(500, window.innerWidth * 0.35));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function getCategoryLabel(catId) {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return catId;
    return cat.name?.[lang] || cat.name?.en || catId;
  }

  function getCategoryEmoji(catId) {
    const cat = categories.find((c) => c.id === catId);
    return cat?.emoji || '📁';
  }

  const availableCategories = useMemo(() => {
    return [...new Set(images.map((img) => img.category))].sort();
  }, [images]);

  const galleryItems = useMemo(() => {
    const filtered = activeCategory === 'all'
      ? images
      : images.filter((img) => img.category === activeCategory);
    return filtered.map((img) => mapToGalleryItem(img, getCategoryLabel(img.category), lang));
  }, [images, activeCategory, lang, categories]);

  return (
    <div className="h-screen bg-bg-app overflow-hidden">
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

      {!isLoading && images.length === 0 && (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
          <div className="text-6xl mb-6">🖼️</div>
          <p className="text-muted text-lg">{t('gallery.noImages')}</p>
          <p className="text-sm text-muted mt-2">{t('gallery.addImages')}</p>
        </div>
      )}

      {!isLoading && images.length > 0 && (
        <>
          {/* Category pills - fixed at top */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-full px-4 pointer-events-none">
            <div className="flex flex-wrap justify-center gap-1.5 max-w-3xl mx-auto pointer-events-auto">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setActiveCategory('all')}
                className={activeCategory === 'all'
                  ? 'bg-[#FFE600] text-[#111827] hover:bg-[#FFE600]/90 shadow-lg shadow-[#FFE600]/20'
                  : 'bg-white/60 dark:bg-white/10 text-muted hover:text-foreground backdrop-blur-md border border-border/50'
                }
              >
                {t('gallery.allCategories')}
              </Button>
              {availableCategories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'ghost'}
                  size="xs"
                  onClick={() => setActiveCategory(cat)}
                  className={activeCategory === cat
                    ? 'bg-[#FFE600] text-[#111827] hover:bg-[#FFE600]/90 shadow-lg shadow-[#FFE600]/20'
                    : 'bg-white/60 dark:bg-white/10 text-muted hover:text-foreground backdrop-blur-md border border-border/50'
                  }
                >
                  <span className="mr-1">{getCategoryEmoji(cat)}</span>
                  <span>{getCategoryLabel(cat)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Carousel */}
          <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <CircularGallery items={galleryItems} radius={radius} />
            </motion.div>

            {/* Footer toggle button */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
              {!showFooter && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFooter(true)}
                    className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-border/50 text-muted hover:text-foreground shadow-sm"
                  >
                    {t('gallery.footerDesc')}
                    <span className="ml-1 opacity-60">↓</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer overlay */}
          <AnimatePresence>
            {showFooter && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed inset-0 z-40 overflow-y-auto"
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFooter(false)} />
                <div className="relative z-10 min-h-screen flex items-end">
                  <div className="w-full relative" onClick={(e) => e.stopPropagation()}>
                    {/* Return button */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFooter(false)}
                        className="bg-white/80 dark:bg-white/20 backdrop-blur-md border border-border/50 shadow-lg rounded-full w-12 h-12 hover:bg-white dark:hover:bg-white/30"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                    </div>
                    <GalleryFooter t={t} onClose={() => setShowFooter(false)} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
