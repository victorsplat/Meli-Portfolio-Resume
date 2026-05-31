'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import { useGalleryImages, useGallerySettings } from '@/hooks/useGallery';
import CircularGallery from '@/components/ui/circular-gallery';
import GalleryFooter from '@/components/GalleryFooter';
import GalleryLightbox from '@/components/GalleryLightbox';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { GalleryImage, Category } from '@/lib/schemas/gallery';

interface GalleryItem {
  _id?: string;
  common?: string;
  binomial?: string;
  photo: {
    url: string;
    text?: string;
    pos?: string;
    by?: string;
  };
  [key: string]: unknown;
}

function mapToGalleryItem(img: GalleryImage, catLabel: string, lang: string): GalleryItem {
  const titleText = (img.title as Record<string, string>)?.[lang] || (img.title as Record<string, string>)?.en || 'Untitled';
  const descText = (img.description as Record<string, string>)?.[lang] || (img.description as Record<string, string>)?.en || '';
  return {
    _id: img._id,
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const resizeTickRef = useRef<number | null>(null);

  const { data: images = [], isLoading } = useGalleryImages();
  const { data: settings } = useGallerySettings();

  const categories: Category[] = useMemo(() => {
    return settings?.categories?.items || [];
  }, [settings]);

  useEffect(() => {
    setRadius(Math.min(500, window.innerWidth * 0.35));
  }, []);

  useEffect(() => {
    function handleResize() {
      if (resizeTickRef.current) cancelAnimationFrame(resizeTickRef.current);
      resizeTickRef.current = requestAnimationFrame(() => {
        setRadius(Math.min(500, window.innerWidth * 0.35));
      });
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTickRef.current) cancelAnimationFrame(resizeTickRef.current);
    };
  }, []);

  function getCategoryLabel(catId: string): string {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return catId;
    const name = cat.name as Record<string, string>;
    return name?.[lang] || name?.en || catId;
  }

  function getCategoryEmoji(catId: string): string {
    const cat = categories.find((c) => c.id === catId);
    return cat?.emoji || '📁';
  }

  const availableCategories: string[] = useMemo(() => {
    return [...new Set(images.map((img: GalleryImage) => img.category))].sort();
  }, [images]);

  const galleryItems: GalleryItem[] = useMemo(() => {
    const filtered = activeCategory === 'all'
      ? images
      : images.filter((img: GalleryImage) => img.category === activeCategory);
    return filtered.map((img: GalleryImage) => mapToGalleryItem(img, getCategoryLabel(img.category), lang));
  }, [images, activeCategory, lang, categories]);

  const handleLightboxOpen = useCallback((item: GalleryItem) => {
    const idx = galleryItems.findIndex((gi) => gi._id === item._id);
    setLightboxIndex(idx >= 0 ? idx : 0);
  }, [galleryItems]);

  const handleLightboxNavigate = useCallback((idx: number) => {
    setLightboxIndex(idx);
  }, []);

  const currentLightboxImage = lightboxIndex !== null ? galleryItems[lightboxIndex] : null;

  return (
    <div className="relative w-full overflow-x-hidden overflow-y-auto">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(88,95,217,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 80%, rgba(65,70,139,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 20% 80%, rgba(45,50,119,0.15) 0%, transparent 50%)
          `
        }}
      />
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

          <div className="relative w-full min-h-screen flex items-center justify-center overflow-visible">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <CircularGallery
                items={galleryItems}
                radius={radius}
                onImageClick={handleLightboxOpen}
              />
            </motion.div>

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

          <AnimatePresence>
            {showFooter && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-40 overflow-y-auto"
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFooter(false)} />
                <div className="relative z-10 min-h-screen flex items-end">
                  <div className="w-full relative" onClick={(e) => e.stopPropagation()}>
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

          <GalleryLightbox
            image={currentLightboxImage}
            images={galleryItems}
            currentIndex={lightboxIndex || 0}
            onNavigate={handleLightboxNavigate}
            onClose={() => setLightboxIndex(null)}
          />
        </>
      )}
    </div>
  );
}
