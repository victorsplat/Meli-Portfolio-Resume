'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import GalleryLightbox from '@/components/GalleryLightbox';

const categoryMeta = {
  design: { emoji: '🎨', en: 'Design', es: 'Diseño', pt: 'Design' },
  aboutMe: { emoji: '👤', en: 'About Me', es: 'Sobre Mí', pt: 'Sobre Mim' },
  skate: { emoji: '🛹', en: 'Skate', es: 'Skate', pt: 'Skate' },
  drinks: { emoji: '🍹', en: 'Drinks', es: 'Bebidas', pt: 'Bebidas' },
  food: { emoji: '🍕', en: 'Food', es: 'Comida', pt: 'Comida' },
  others: { emoji: '✨', en: 'Others', es: 'Otros', pt: 'Outros' },
};

const HERO_INTERVAL = 5000;

export default function GalleryPage() {
  const { t, lang } = useI18n();
  usePageTitle('gallery.title');
  const [images, setImages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [heroIndex, setHeroIndex] = useState(0);
  const heroIntervalRef = useRef(null);

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

  const heroImageIds = useMemo(() => settings?.hero?.imageIds || [], [settings]);

  const heroImages = useMemo(() => {
    if (heroImageIds.length > 0) {
      const mapped = heroImageIds.map(id => images.find(img => img._id === id)).filter(Boolean);
      if (mapped.length > 0) return mapped;
    }
    const featured = images.filter(img => img.featured);
    return featured.length > 0 ? featured : images.slice(0, 5);
  }, [images, heroImageIds]);

  const aboutImages = useMemo(() => {
    const ids = settings?.aboutMe?.imageIds || [];
    return ids.map(id => images.find(img => img._id === id)).filter(Boolean);
  }, [images, settings]);

  const footerImages = useMemo(() => {
    const ids = settings?.footer?.imageIds || [];
    return ids.map(id => images.find(img => img._id === id)).filter(Boolean);
  }, [images, settings]);

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

  useEffect(() => {
    if (heroImages.length <= 1) return;
    heroIntervalRef.current = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, HERO_INTERVAL);
    return () => clearInterval(heroIntervalRef.current);
  }, [heroImages.length]);

  const heroNext = useCallback(() => {
    clearInterval(heroIntervalRef.current);
    setHeroIndex(prev => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  const heroPrev = useCallback(() => {
    clearInterval(heroIntervalRef.current);
    setHeroIndex(prev => (prev - 1 + heroImages.length) % heroImages.length);
  }, [heroImages.length]);

  const categories = useMemo(() => {
    return [...new Set(images.map(img => img.category))].sort();
  }, [images]);

  const stats = useMemo(() => ({
    total: images.length,
    categories: categories.length,
    featured: images.filter(img => img.featured).length,
  }), [images, categories]);

  const filteredImages = useMemo(() => {
    return activeCategory === 'all' ? images : images.filter(img => img.category === activeCategory);
  }, [images, activeCategory]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const img of filteredImages) {
      if (!groups[img.category]) groups[img.category] = [];
      groups[img.category].push(img);
    }
    return groups;
  }, [filteredImages]);

  function getCategoryLabel(cat) {
    const meta = categoryMeta[cat];
    if (!meta) return cat;
    if (lang === 'es') return meta.es;
    if (lang === 'pt') return meta.pt;
    return meta.en;
  }

  const currentHero = heroImages[heroIndex];

  return (
    <div className="min-h-screen bg-bg-app">
      {/* ======================== HERO CAROUSEL ======================== */}
      <section className="relative h-[60vh] md:h-[80vh] min-h-[400px] md:min-h-[500px] overflow-hidden bg-[#121b29]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#121b29] via-[#1a2744] to-[#0f1624] z-0" />

        {!loading && heroImages.length > 0 && (
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={heroIndex}
                src={currentHero.url}
                alt=""
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            {/* Overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#121b29] via-[#121b29]/70 to-[#121b29]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121b29] via-transparent to-black/30" />
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container w-full">
            {!loading && heroImages.length > 0 && (
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl"
              >
                {currentHero.featured && (
                  <span className="inline-block bg-[#FFE600] text-[#111827] text-xs font-bold px-3 py-1 rounded-full mb-4">
                    ★ {t('gallery.featuredLabel')}
                  </span>
                )}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                  {getSetting('hero.title') || currentHero.title || t('gallery.title')}
                </h1>
                {(getSetting('hero.subtitle') || currentHero.description) && (
                  <p className="text-gray-300 text-lg md:text-xl max-w-xl leading-relaxed">
                    {getSetting('hero.subtitle') || currentHero.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-6">
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    {categoryMeta[currentHero.category]?.emoji} {getCategoryLabel(currentHero.category)}
                  </span>
                </div>
              </motion.div>
            )}

            {!loading && heroImages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{t('gallery.title')}</h1>
                <p className="text-gray-400 text-lg">{t('gallery.subtitle')}</p>
              </motion.div>
            )}

            {loading && (
              <div className="max-w-xl">
                <div className="h-12 w-3/4 skeleton bg-white/10 mb-4 rounded-lg" />
                <div className="h-6 w-1/2 skeleton bg-white/10 rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Hero Nav Arrows */}
        {!loading && heroImages.length > 1 && (
          <>
            <button
              onClick={heroPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all text-xl"
            >
              ←
            </button>
            <button
              onClick={heroNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all text-xl"
            >
              →
            </button>
          </>
        )}

        {/* Hero Dots */}
        {!loading && heroImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(heroIntervalRef.current); setHeroIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === heroIndex ? 'bg-[#FFE600] w-6' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="container pb-12">
        {/* ======================== STATS BAR ======================== */}
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

        {/* ======================== ABOUT ME ======================== */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card-glass max-w-4xl mx-auto mb-12 overflow-hidden"
          >
            {aboutImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 mb-4 scrollbar-thin">
                {aboutImages.map(img => (
                  <img
                    key={img._id}
                    src={img.url}
                    alt={img.title || ''}
                    className="h-32 md:h-40 rounded-xl object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            )}
            <div className={aboutImages.length > 0 ? '' : ''}>
              <h2 className="text-2xl font-bold text-accent dark:text-[#FFE600] mb-4 text-center">
                {getSetting('aboutMe.title') || t('gallery.aboutTitle')}
              </h2>
              <p className="text-muted leading-relaxed whitespace-pre-line text-center">
                {getSetting('aboutMe.text') || t('gallery.aboutText')}
              </p>
            </div>
          </motion.div>
        )}

        {/* ======================== NAVIGATION ======================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-4"
        >
          <Link href="/" className="btn btn-sm">{t('gallery.backToHome')}</Link>
        </motion.div>

        {/* ======================== CATEGORY FILTER ======================== */}
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

        {/* ======================== LOADING ======================== */}
        {loading && (
          <div className="space-y-8">
            {[1, 2, 3].map((s) => (
              <div key={s}>
                <div className="h-8 w-48 skeleton rounded-lg mb-4" />
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((c) => (
                    <div key={c} className="w-[280px] h-[200px] skeleton rounded-xl flex-shrink-0" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================== EMPTY ======================== */}
        {!loading && images.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="text-6xl mb-6">🖼️</div>
            <p className="text-muted text-lg">{t('gallery.noImages')}</p>
            <p className="text-sm text-muted mt-2">{t('gallery.addImages')}</p>
          </motion.div>
        )}

        {/* ======================== CATEGORY CAROUSELS ======================== */}
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
                <div key={cat} className="mb-14 last:mb-0">
                  {/* Category Header Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="section-pill mb-6 inline-flex"
                  >
                    <span className="text-xl">{categoryMeta[cat]?.emoji}</span>
                    <span className="text-lg font-bold text-accent dark:text-white">{getCategoryLabel(cat)}</span>
                    <span className="text-sm text-muted">({catImages.length})</span>
                  </motion.div>

                  {/* Carousel Track */}
                  <div className="relative">
                    <div className="carousel-track">
                      {catImages.map((img, index) => (
                        <motion.div
                          key={img._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="carousel-card"
                          onClick={() => setSelectedImage(img)}
                        >
                          <div className="relative overflow-hidden rounded-xl">
                            <div className="w-[280px] h-[200px] md:h-[240px]">
                              <img
                                src={img.url}
                                alt={img.title || 'Gallery image'}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                loading="lazy"
                              />
                            </div>
                            {img.featured && (
                              <span className="absolute top-2 right-2 bg-[#FFE600] text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                ★
                              </span>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                              {img.title && (
                                <h3 className="text-white text-sm font-semibold">{img.title}</h3>
                              )}
                              <span className="text-gray-300 text-xs mt-1">
                                {categoryMeta[img.category]?.emoji} {getCategoryLabel(img.category)}
                              </span>
                            </div>
                          </div>
                          {(img.title || img.description) && (
                            <div className="p-2">
                              {img.title && (
                                <h3 className="text-sm font-semibold text-accent dark:text-white truncate">{img.title}</h3>
                              )}
                              {img.description && (
                                <p className="text-xs text-muted mt-0.5 line-clamp-2">{img.description}</p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="carousel-fade-right" />
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ======================== FOOTER ======================== */}
      {!loading && (getSetting('footer.text') || footerImages.length > 0) && (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="container pb-8 text-center"
        >
          {footerImages.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 mb-4 justify-center">
              {footerImages.map(img => (
                <img
                  key={img._id}
                  src={img.url}
                  alt={img.title || ''}
                  className="h-20 md:h-24 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
          {getSetting('footer.text') && (
            <p className="text-muted text-sm">{getSetting('footer.text')}</p>
          )}
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
