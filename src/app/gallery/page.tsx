'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import { useGalleryImages, useGallerySettings } from '@/hooks/useGallery';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { GalleryImage } from '@/lib/schemas/gallery';

export default function GalleryPage() {
  const { t, lang } = useI18n();
  usePageTitle('gallery.title');
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const { data: images = [], isLoading } = useGalleryImages();
  const { data: settings } = useGallerySettings();

  const heroImageIds = settings?.hero?.imageIds || [];
  const heroSettingsImages = heroImageIds
    .map((id: string) => images.find((i: GalleryImage) => i._id === id))
    .filter(Boolean);
  const featuredImages = images.filter((img: GalleryImage) => img.featured);

  const usedIds = useRef(new Set<string>()).current;
  function pickHeroImage(idx: number): GalleryImage | undefined {
    const img = heroSettingsImages[idx] || featuredImages.find((f: GalleryImage) => !usedIds.has(f._id)) || images.find((i: GalleryImage) => !usedIds.has(i._id));
    if (img) usedIds.add(img._id);
    return img;
  }
  const mediaImage = pickHeroImage(0);
  const bgImage = pickHeroImage(1);
  const postScrollBg = pickHeroImage(2);

  function getSetting(path: string): string {
    if (!settings) return '';
    const keys = path.split('.');
    let val: unknown = settings;
    for (const key of keys) {
      if (!val) return '';
      val = (val as Record<string, unknown>)[key];
    }
    if (typeof val === 'object' && val !== null) return ((val as Record<string, string>)[lang] || (val as Record<string, string>).en || '');
    return String(val || '');
  }

  const heroTitle = getSetting('hero.title') || t('gallery.title');
  const heroSubtitle = getSetting('hero.subtitle') || t('gallery.subtitle');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-6" />
        <p className="text-muted text-lg">{t('gallery.loading')}</p>
      </div>
    );
  }

  if (!mediaImage?.url) {
    return (
      <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">🖼️</div>
        <p className="text-muted text-lg">{t('gallery.noImages')}</p>
        <p className="text-sm text-muted mt-2">{t('gallery.addImages')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app">
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={mediaImage.url}
        bgImageSrc={bgImage?.url}
        postBgSrc={postScrollBg?.url !== mediaImage?.url ? postScrollBg?.url : undefined}
        title={heroTitle}
        date={heroSubtitle}
        scrollToExpand={t('gallery.scrollToExpand')}
        textBlend
        onExpandComplete={() => setExpanded(true)}
      >
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            <p className="text-lg text-white max-w-xl text-center">
              {t('gallery.exploreDesc')}
            </p>
            <button
              onClick={() => router.push('/gallery/explore')}
              className="btn text-lg px-10 py-4"
            >
              {t('gallery.enterGallery')}
            </button>
          </motion.div>
        )}
      </ScrollExpandMedia>
    </div>
  );
}
