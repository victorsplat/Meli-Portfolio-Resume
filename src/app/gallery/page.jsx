'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import GalleryLightbox from '@/components/GalleryLightbox';

const aspectCycle = ['aspect-square', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[16/9]', 'aspect-square', 'aspect-[4/3]'];

const categoryMeta = {
  design: { emoji: '🎨', en: 'Design', es: 'Diseño', pt: 'Design' },
  aboutMe: { emoji: '👤', en: 'About Me', es: 'Sobre Mí', pt: 'Sobre Mim' },
  skate: { emoji: '🛹', en: 'Skate', es: 'Skate', pt: 'Skate' },
  drinks: { emoji: '🍹', en: 'Drinks', es: 'Bebidas', pt: 'Bebidas' },
  food: { emoji: '🍕', en: 'Food', es: 'Comida', pt: 'Comida' },
  others: { emoji: '✨', en: 'Others', es: 'Otros', pt: 'Outros' },
};

export default function GalleryPage() {
  const { t, lang } = useI18n();
  usePageTitle('gallery.title');
  const [images, setImages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [heroLoaded, setHeroLoaded] = useState(false);

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

  useEffect(() => {
    async function fetchData() {
      try {
        const [imgRes, setRes] = await Promise.all([
          fetch('/api/gallery'),
          fetch('/api/gallery/settings'),
        ]);
        const imgData = await imgRes.json();
        if (!imgData.error) setImages(imgData);
        const setData = await setRes.json();
        if (!setData.error) setSettings(setData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const featuredImage = useMemo(() => {
    return images.find(img => img.featured) || images[0] || null;
  }, [images]);

  const categories = useMemo(() => {
    return [...new Set(images.map(img => img.category))].sort();
  }, [images]);

  const stats = useMemo(() => ({
    total: images.length,
    categories: categories.length,
    featured: images.filter(img => img.featured).length,
  }), [images, categories]);

  const grouped = useMemo(() => {
    const source = activeCategory === 'all' ? images : images.filter(img => img.category === activeCategory);
    const groups = {};
    for (const img of source) {
      if (!groups[img.category]) groups[img.category] = [];
      groups[img.category].push(img);
    }
    return groups;
  }, [images, activeCategory]);

  function getCategoryLabel(cat) {
    const meta = categoryMeta[cat];
    if (!meta) return cat;
    if (lang === 'es') return meta.es;
    if (lang === 'pt') return meta.pt;
    return meta.en;
  }

  function getGridClass(index) {
    return aspectCycle[index % aspectCycle.length];
  }

  return (
    <div className="min-h-screen bg-bg-app">
      {/* MELI Hero */}
      <section className="relative overflow-hidden bg-[#121b29]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#121b29] via-[#1a2744] to-[#0f1624]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #FFE600 1px, transparent 1px), radial-gradient(circle at 75% 75%, #FFE600 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {!loading && featuredImage && (
          <div className="relative">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={featuredImage.url}
                alt=""
                className={`w-full h-full object-cover transition-all duration-1000 ${heroLoaded ? 'opacity-20 scale-100' : 'opacity-0 scale-110'}`}
                onLoad={() => setHeroLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121b29] via-[#121b29]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121b29] via-transparent to-transparent" />
            </div>

            <div className="relative container py-20 md:py-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                {featuredImage.featured && (
                  <span className="inline-block bg-[#FFE600] text-[#111827] text-xs font-bold px-3 py-1 rounded-full mb-4">
                    ★ {t('gallery.featuredLabel')}
                  </span>
                )}
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {featuredImage.title || getSetting('hero.title') || t('gallery.title')}
                </h1>
                {(featuredImage.description || getSetting('hero.subtitle')) && (
                  <p className="text-gray-300 text-lg md:text-xl max-w-xl leading-relaxed">
                    {featuredImage.description || getSetting('hero.subtitle')}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-6">
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    {categoryMeta[featuredImage.category]?.emoji} {getCategoryLabel(featuredImage.category)}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {!loading && !featuredImage && (
          <div className="container py-20 md:py-32 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              {t('gallery.title')}
            </motion.h1>
            <p className="text-gray-400 text-lg">{t('gallery.subtitle')}</p>
          </div>
        )}

        {loading && (
          <div className="container py-20 md:py-32">
            <div className="max-w-xl">
              <div className="h-12 w-3/4 skeleton bg-white/10 mb-4 rounded-lg" />
              <div className="h-6 w-1/2 skeleton bg-white/10 rounded-lg" />
            </div>
          </div>
        )}
      </section>

      <div className="container pb-12">
        {/* Stats Bar */}
        {!loading && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center gap-8 md:gap-16 -mt-8 relative z-10 mb-12"
          >
            {[
              { label: t('gallery.statsImages'), value: stats.total },
              { label: t('gallery.statsCategories'), value: stats.categories },
              { label: t('gallery.statsFeatured'), value: stats.featured },
            ].map((stat) => (
              <div key={stat.label} className="card text-center min-w-[120px] py-4">
                <div className="text-3xl font-bold text-accent dark:text-[#FFE600]">{stat.value}</div>
                <div className="text-xs text-muted mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* About Me Section */}
        {!loading && (getSetting('aboutMe.title') || getSetting('aboutMe.text')) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card-glass max-w-3xl mx-auto mb-12 text-center"
          >
            <h2 className="text-2xl font-bold text-accent dark:text-[#FFE600] mb-4">
              {getSetting('aboutMe.title') || t('gallery.aboutTitle')}
            </h2>
            <p className="text-muted leading-relaxed whitespace-pre-line">
              {getSetting('aboutMe.text') || t('gallery.aboutText')}
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-4"
        >
          <Link href="/" className="btn btn-sm">
            {t('gallery.backToHome')}
          </Link>
        </motion.div>

        {/* Category Filter */}
        {!loading && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === 'all'
                  ? 'bg-[#FFE600] text-[#111827] shadow-lg shadow-[#FFE600]/20'
                  : 'bg-white/50 dark:bg-white/5 text-muted hover:bg-white/80 dark:hover:bg-white/10 border border-panel-border'
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
                    : 'bg-white/50 dark:bg-white/5 text-muted hover:bg-white/80 dark:hover:bg-white/10 border border-panel-border'
                }`}
              >
                <span>{categoryMeta[cat]?.emoji}</span>
                <span>{getCategoryLabel(cat)}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden p-0">
                <div className={`${getGridClass(i)} skeleton`} />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-2/3 skeleton rounded" />
                  <div className="h-3 w-full skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">🖼️</div>
            <p className="text-muted text-lg">{t('gallery.noImages')}</p>
            <p className="text-sm text-muted mt-2">{t('gallery.addImages')}</p>
          </motion.div>
        )}

        {/* Gallery Grid - by Category */}
        {!loading && images.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {Object.entries(grouped).map(([cat, catImages]) => (
                <div key={cat} className="mb-12 last:mb-0">
                  {/* Section Header */}
                  {activeCategory === 'all' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 mb-6"
                    >
                      <div className="w-1 h-8 bg-[#FFE600] rounded-full" />
                      <h2 className="text-2xl font-bold text-accent dark:text-white flex items-center gap-2">
                        <span>{categoryMeta[cat]?.emoji}</span>
                        <span>{getCategoryLabel(cat)}</span>
                      </h2>
                      <span className="text-sm text-muted ml-2">({catImages.length})</span>
                    </motion.div>
                  )}

                  {/* Image Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                      {catImages.map((img, index) => (
                        <motion.div
                          key={img._id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="group cursor-pointer"
                          onClick={() => setSelectedImage(img)}
                        >
                          <div className={`card overflow-hidden p-0 h-full card-hover`}>
                            <div className={`relative overflow-hidden ${getGridClass(index)}`}>
                              <img
                                src={img.url}
                                alt={img.title || 'Gallery image'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              {img.featured && (
                                <span className="absolute top-2 right-2 bg-[#FFE600] text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  ★
                                </span>
                              )}
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <div className="text-white">
                                  {img.title && (
                                    <h3 className="text-sm font-semibold leading-tight">{img.title}</h3>
                                  )}
                                  <span className="text-xs text-gray-300 mt-1 block">
                                    {categoryMeta[img.category]?.emoji} {getCategoryLabel(img.category)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {(img.title || img.description) && (
                              <div className="p-3">
                                {img.title && (
                                  <h3 className="text-sm font-semibold text-accent dark:text-white truncate">
                                    {img.title}
                                  </h3>
                                )}
                                {img.description && (
                                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{img.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {!loading && getSetting('footer.text') && (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="container pb-8 text-center"
        >
          <p className="text-muted text-sm">{getSetting('footer.text')}</p>
        </motion.footer>
      )}

      <GalleryLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        categoryLabel={selectedImage ? getCategoryLabel(selectedImage.category) : ''}
        categoryEmoji={selectedImage ? categoryMeta[selectedImage.category]?.emoji : ''}
      />
    </div>
  );
}
