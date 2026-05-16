'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export default function GalleryPage() {
  const { t, lang } = useI18n();
  usePageTitle('gallery.title');
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [heroImages, setHeroImages] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [imgRes, setRes] = await Promise.all([
          fetch('/api/gallery'),
          fetch('/api/gallery/settings'),
        ]);
        const imgData = await imgRes.json();
        const setData = await setRes.json();
        if (!setData.error) setSettings(setData);

        if (!imgData.error && imgData.length > 0) {
          const featured = imgData.filter(img => img.featured);
          setHeroImages(featured.length > 0 ? featured : imgData.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching gallery data:', err);
      }
    }
    fetchData();
  }, []);

  function getSetting(path) {
    if (!settings) return '';
    const keys = path.split('.');
    let val = settings;
    for (const key of keys) {
      if (!val) return '';
      val = val[key];
    }
    if (typeof val === 'object' && val !== null) return val[lang] || val.en || '';
    return val || '';
  }

  const currentHero = heroImages[0];
  const heroTitle = getSetting('hero.title') || t('gallery.title');
  const heroSubtitle = getSetting('hero.subtitle') || t('gallery.subtitle');

  return (
    <div className="min-h-screen bg-bg-app">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={currentHero?.url || ''}
        bgImageSrc={currentHero?.url || ''}
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
            className="flex flex-col items-center justify-center gap-6 py-12"
          >
            <p className="text-lg text-muted max-w-xl text-center">
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
