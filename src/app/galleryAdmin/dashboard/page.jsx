'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuthStore } from '@/lib/stores/authStore';
import { useGallerySettings, useGalleryImages, useUpdateSettings } from '@/hooks/useGallery';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { key: 'en', label: 'EN', flag: '🇺🇸' },
  { key: 'es', label: 'ES', flag: '🇦🇷' },
  { key: 'pt', label: 'PT', flag: '🇧🇷' },
];

const TABS = [
  { id: 'heroTexts', label: 'Hero Texts', icon: '📝' },
  { id: 'heroImages', label: 'Hero Images', icon: '🎬' },
  { id: 'categories', label: 'Categories', icon: '🏷️' },
  { id: 'aboutMe', label: 'About', icon: '👤' },
  { id: 'footer', label: 'Footer', icon: '📝' },
];

const HERO_POSITIONS = [
  { index: 0, label: 'Main Media', desc: 'Expands on scroll — primary image' },
  { index: 1, label: 'Background', desc: 'Fades out during scroll' },
  { index: 2, label: 'Post-Scroll BG', desc: 'Shows after full expansion' },
];

async function translateText(text, source, target) {
  if (!text?.trim()) return '';
  try {
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.translatedText || '';
  } catch {
    return '';
  }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-/g, '');
}

export default function DashboardPage() {
  const { token, login, logout } = useAuthStore();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const isAuthed = ready && !!token;
  const { data: settings, isLoading: settingsLoading, error: settingsError, refetch } = useGallerySettings();
  const { data: images } = useGalleryImages();
  const updateSettings = useUpdateSettings();

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [localSettings, setLocalSettings] = useState(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [tab, setTab] = useState('heroTexts');
  const [translating, setTranslating] = useState({});
  const [newCategory, setNewCategory] = useState({ id: '', name: { en: '', es: '', pt: '' }, emoji: '📁' });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const passwordRef = useCallback((el) => el?.focus(), []);

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  const categoryList = localSettings?.categories?.items || [];

  const imageCountByCategory = useMemo(() => {
    const counts = {};
    if (images) {
      for (const img of images) {
        const cat = img.category || 'others';
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    return counts;
  }, [images]);

  function getSelectedImages(sectionId) {
    const ids = localSettings?.[sectionId]?.imageIds || [];
    return (images || []).filter((img) => ids.includes(img._id));
  }

  function getOrderedHeroImages() {
    const ids = localSettings?.hero?.imageIds || [];
    return ids.map((id) => images?.find((i) => i._id === id)).filter(Boolean);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    if (!passwordInput.trim()) {
      setAuthError('Password is required');
      return;
    }
    const ok = await login(passwordInput.trim());
    if (!ok) { setAuthError('Invalid password'); return; }
    setPasswordInput('');
    refetch();
  }

  function updateField(section, field, lang, value) {
    setLocalSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: { ...(prev?.[section]?.[field] || { en: '', es: '', pt: '' }), [lang]: value },
      },
    }));
  }

  function toggleHeroImage(imageId) {
    setLocalSettings((prev) => {
      const ids = prev?.hero?.imageIds || [];
      const exists = ids.includes(imageId);
      if (!exists && ids.length >= 3) return prev;
      return {
        ...prev,
        hero: {
          ...prev.hero,
          imageIds: exists ? ids.filter((id) => id !== imageId) : [...ids, imageId],
        },
      };
    });
  }

  function setHeroSlot(slotIndex, imageId) {
    setLocalSettings((prev) => {
      const ids = [...(prev?.hero?.imageIds || []), null, null, null].slice(0, 3);
      const existsIdx = ids.indexOf(imageId);
      if (existsIdx !== -1) ids[existsIdx] = null;
      ids[slotIndex] = imageId;
      const cleaned = ids.filter(Boolean);
      return { ...prev, hero: { ...prev.hero, imageIds: cleaned } };
    });
  }

  function toggleSectionImage(sectionId, imageId) {
    setLocalSettings((prev) => {
      const ids = prev?.[sectionId]?.imageIds || [];
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          imageIds: ids.includes(imageId) ? ids.filter((id) => id !== imageId) : [...ids, imageId],
        },
      };
    });
  }

  async function handleTranslate(sectionId, fieldKey) {
    const enText = localSettings?.[sectionId]?.[fieldKey]?.en || '';
    if (!enText.trim()) return;
    setTranslating((prev) => ({ ...prev, [`${sectionId}.${fieldKey}`]: true }));
    const [esText, ptText] = await Promise.all([translateText(enText, 'en', 'es'), translateText(enText, 'en', 'pt')]);
    setLocalSettings((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldKey]: {
          en: enText,
          es: esText || prev?.[sectionId]?.[fieldKey]?.es || '',
          pt: ptText || prev?.[sectionId]?.[fieldKey]?.pt || '',
        },
      },
    }));
    setTranslating((prev) => ({ ...prev, [`${sectionId}.${fieldKey}`]: false }));
  }

  async function handleSave() {
    setSaveMsg('');
    try {
      await updateSettings.mutateAsync(localSettings);
      setSaveMsg('saved');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('error');
    }
  }

  function addCategory() {
    const id = newCategory.id.trim() || slugify(newCategory.name.en || '');
    if (!id) return;
    const name = {
      en: newCategory.name.en || id,
      es: newCategory.name.es || newCategory.name.en || id,
      pt: newCategory.name.pt || newCategory.name.en || id,
    };
    const items = [...categoryList];
    const maxOrder = items.reduce((m, c) => Math.max(m, c.sortOrder || 0), -1);
    items.push({ id, name, emoji: newCategory.emoji || '📁', sortOrder: maxOrder + 1 });
    setLocalSettings((prev) => ({ ...prev, categories: { ...prev.categories, items } }));
    setNewCategory({ id: '', name: { en: '', es: '', pt: '' }, emoji: '📁' });
    setShowCategoryForm(false);
  }

  function removeCategory(catId) {
    if (!confirm(`Delete "${catId}"? Existing images in this category won't be affected.`)) return;
    setLocalSettings((prev) => ({
      ...prev,
      categories: { ...prev.categories, items: prev.categories.items.filter((c) => c.id !== catId) },
    }));
  }

  function updateCategoryName(id, lang, value) {
    setLocalSettings((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        items: prev.categories.items.map((c) => (c.id === id ? { ...c, name: { ...c.name, [lang]: value } } : c)),
      },
    }));
  }

  function updateCategoryField(id, field, value) {
    setLocalSettings((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        items: prev.categories.items.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      },
    }));
  }

  function moveCategory(id, direction) {
    setLocalSettings((prev) => {
      const items = [...prev.categories.items];
      const idx = items.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const to = idx + direction;
      if (to < 0 || to >= items.length) return prev;
      [items[idx], items[to]] = [items[to], items[idx]];
      return { ...prev, categories: { ...prev.categories, items: items.map((c, i) => ({ ...c, sortOrder: i })) } };
    });
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card max-w-md w-full mx-4 p-8">
          <h1 className="title text-2xl text-center mb-2">Gallery Dashboard</h1>
          <p className="text-muted text-center mb-6 text-sm">Enter admin password to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input ref={passwordRef} type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Admin password" className="input text-center text-lg" autoFocus />
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            <Button type="submit" className="w-full">Authenticate</Button>
          </form>
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-accent hover:underline">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-muted mb-4">Failed to load settings.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (settingsLoading || !localSettings) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  const orderedHero = getOrderedHeroImages();

  return (
    <div className="min-h-screen bg-bg-app pb-32">
      <div className="container py-8 md:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="title text-3xl md:text-4xl">📋 Dashboard</h1>
              <p className="text-muted text-sm mt-1">Manage gallery content, images, and categories</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageSwitcher />
              <Link href="/galleryAdmin" className="btn btn-sm">← Image Manager</Link>
              <Link href="/gallery" className="btn btn-sm btn-secondary">View Gallery</Link>
              <Button variant="destructive" size="sm" onClick={logout}>Logout</Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-2xl bg-white/50 dark:bg-white/5 border border-panel-border backdrop-blur-sm w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                tab === t.id
                  ? 'bg-[#FFE600] text-[#111827] shadow-sm'
                  : 'text-muted hover:text-accent dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
              )}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* === TAB: HERO TEXTS === */}
        {tab === 'heroTexts' && (
          <motion.div key="heroTexts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FFE600]/20 flex items-center justify-center text-lg">📝</div>
                <div>
                  <h2 className="text-lg font-bold">Hero Texts</h2>
                  <p className="text-xs text-muted">Title and subtitle shown on the scroll-to-expand hero</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-muted mb-2">Title</label>
                  <div className="space-y-2">
                    {LANGUAGES.map((lang) => (
                      <div key={lang.key} className="flex items-center gap-2">
                        <span className="text-xs w-8 flex-shrink-0">{lang.flag}</span>
                        <input
                          type="text"
                          value={localSettings.hero?.title?.[lang.key] || ''}
                          onChange={(e) => updateField('hero', 'title', lang.key, e.target.value)}
                          className="input text-sm flex-1"
                          placeholder={`Title in ${lang.key}`}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => handleTranslate('hero', 'title')}
                      disabled={translating['hero.title'] || !localSettings.hero?.title?.en?.trim()}
                      className="text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30"
                    >
                      {translating['hero.title'] ? '🔄 ...' : '🤖 EN → ES, PT'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-2">Subtitle (CTA text)</label>
                  <div className="space-y-2">
                    {LANGUAGES.map((lang) => (
                      <div key={lang.key} className="flex items-center gap-2">
                        <span className="text-xs w-8 flex-shrink-0">{lang.flag}</span>
                        <input
                          type="text"
                          value={localSettings.hero?.subtitle?.[lang.key] || ''}
                          onChange={(e) => updateField('hero', 'subtitle', lang.key, e.target.value)}
                          className="input text-sm flex-1"
                          placeholder={`Subtitle in ${lang.key}`}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => handleTranslate('hero', 'subtitle')}
                      disabled={translating['hero.subtitle'] || !localSettings.hero?.subtitle?.en?.trim()}
                      className="text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30"
                    >
                      {translating['hero.subtitle'] ? '🔄 ...' : '🤖 EN → ES, PT'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* === TAB: HERO IMAGES === */}
        {tab === 'heroImages' && (
          <motion.div key="heroImages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FFE600]/20 flex items-center justify-center text-lg">🎬</div>
                <div>
                  <h2 className="text-lg font-bold">Hero Images</h2>
                  <p className="text-xs text-muted">Select up to 3 images for the scroll-to-expand hero — no duplicates</p>
                </div>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-panel-border mb-4">
                <div>
                  <p className="text-sm font-semibold">Slots</p>
                  <p className="text-xs text-muted">Assign images to each role</p>
                </div>
                <span className="text-xs font-medium text-accent dark:text-[#FFE600]">{orderedHero.length}/3</span>
              </div>

              {(!images || images.length === 0) ? (
                <p className="text-sm text-muted py-6 text-center bg-accent/5 dark:bg-white/5 rounded-xl border border-dashed border-panel-border">
                  No images available. Upload in Image Manager first.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {HERO_POSITIONS.map((pos) => {
                      const img = orderedHero[pos.index];
                      return (
                        <div key={pos.index} className={cn(
                          "p-3 rounded-xl border text-center text-xs transition-all",
                          img
                            ? 'bg-accent/5 dark:bg-white/10 border-accent/20 dark:border-white/20'
                            : 'bg-accent/5 dark:bg-white/5 border-dashed border-panel-border'
                        )}>
                          <div className="font-semibold text-accent dark:text-[#FFE600] mb-0.5">
                            #{pos.index + 1} — {pos.label}
                          </div>
                          <div className="text-muted mb-2">{pos.desc}</div>
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-white/30 dark:bg-white/5">
                            {img ? (
                              <>
                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => setHeroSlot(pos.index, null)}
                                  className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70 rounded-full w-5 h-5"
                                >
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted">
                                <span className="text-lg">+</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-muted mb-2">Click an image to assign to the first empty slot:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {images.map((img) => {
                      const slotIdx = (localSettings?.hero?.imageIds || []).indexOf(img._id);
                      const selected = slotIdx !== -1;
                      return (
                        <div key={img._id} className="relative group">
                          <button
                            onClick={() => {
                              if (selected) {
                                setHeroSlot(slotIdx, null);
                              } else {
                                const firstEmpty = orderedHero.length;
                                if (firstEmpty < 3) setHeroSlot(firstEmpty, img._id);
                              }
                            }}
                            className={cn(
                              "relative w-14 h-14 rounded-lg overflow-hidden ring-2 transition-all",
                              selected
                                ? 'ring-[#FFE600] ring-offset-1 ring-offset-[var(--bg-app)] scale-105'
                                : 'ring-panel-border hover:ring-accent/50 opacity-60 hover:opacity-100'
                            )}
                          >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            {selected && (
                              <div className="absolute inset-0 bg-[#FFE600]/15 flex items-center justify-center">
                                <span className="w-5 h-5 rounded-full bg-[#FFE600] text-[#111827] text-[10px] font-bold flex items-center justify-center shadow-lg">
                                  {slotIdx + 1}
                                </span>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* === TAB: CATEGORIES === */}
        {tab === 'categories' && (
          <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FFE600]/20 flex items-center justify-center text-lg">🏷️</div>
                <div>
                  <h2 className="text-lg font-bold">Categories</h2>
                  <p className="text-xs text-muted">Gallery filtering categories — changes reflect instantly on all pages</p>
                </div>
              </div>

              {/* Header stats */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-panel-border">
                <div className="flex items-center gap-4">
                  <div className="text-sm"><span className="font-semibold text-accent dark:text-[#FFE600]">{categoryList.length}</span> <span className="text-muted">categories</span></div>
                  <div className="text-sm"><span className="font-semibold">{Object.values(imageCountByCategory).reduce((a, b) => a + b, 0)}</span> <span className="text-muted">total images</span></div>
                </div>
                <Button variant="default" size="sm" onClick={() => setShowCategoryForm(true)}>
                  + Add Category
                </Button>
              </div>

              {/* Add form */}
              <AnimatePresence>
                {showCategoryForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-accent/5 dark:bg-white/5 border border-panel-border space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Slug (unique ID)</label>
                          <input
                            type="text"
                            value={newCategory.id}
                            onChange={(e) => setNewCategory((p) => ({ ...p, id: e.target.value }))}
                            placeholder={slugify(newCategory.name.en || '') || 'unique-id'}
                            className="input text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Emoji</label>
                          <input
                            type="text"
                            value={newCategory.emoji}
                            onChange={(e) => setNewCategory((p) => ({ ...p, emoji: e.target.value }))}
                            placeholder="🎨"
                            className="input text-sm text-center"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">Names (EN, ES, PT)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {LANGUAGES.map((lang) => (
                            <div key={lang.key} className="flex items-center gap-1.5">
                              <span className="text-xs flex-shrink-0">{lang.flag}</span>
                              <input
                                type="text"
                                value={newCategory.name[lang.key]}
                                onChange={(e) => setNewCategory((p) => ({ ...p, name: { ...p.name, [lang.key]: e.target.value } }))}
                                placeholder={lang.key}
                                className="input text-xs py-1.5"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={addCategory}>Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowCategoryForm(false); setNewCategory({ id: '', name: { en: '', es: '', pt: '' }, emoji: '📁' }); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {categoryList.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center bg-accent/5 dark:bg-white/5 rounded-xl border border-dashed border-panel-border">
                  No categories yet. Create your first one.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoryList.map((cat, idx) => {
                    const count = imageCountByCategory[cat.id] || 0;
                    const isExpanded = editingCat === cat.id;
                    return (
                      <motion.div
                        key={cat.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "rounded-xl border transition-all duration-200",
                          isExpanded
                            ? "border-accent/30 dark:border-white/20 bg-accent/5 dark:bg-white/5"
                            : "border-panel-border bg-white/40 dark:bg-white/[0.03] hover:border-accent/20 dark:hover:border-white/15"
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2 p-3">
                          <div className="flex gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => moveCategory(cat.id, -1)}
                              disabled={idx === 0}
                              className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-accent disabled:opacity-20 text-xs"
                            >↑</button>
                            <button
                              onClick={() => moveCategory(cat.id, 1)}
                              disabled={idx === categoryList.length - 1}
                              className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-accent disabled:opacity-20 text-xs"
                            >↓</button>
                          </div>
                          <span className="text-xl flex-shrink-0 w-8 text-center">{cat.emoji || '📁'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {cat.name?.en || cat.id}
                            </p>
                            <p className="text-[10px] text-muted truncate">slug: {cat.id}</p>
                          </div>
                          {/* Image count badge */}
                          <div className={cn(
                            "flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full",
                            count > 0
                              ? 'bg-accent/10 dark:bg-white/10 text-accent dark:text-white'
                              : 'text-muted bg-transparent'
                          )}>
                            {count} img
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setEditingCat(isExpanded ? null : cat.id)}
                            className="flex-shrink-0"
                          >
                            {isExpanded ? '▲' : '▼'}
                          </Button>
                          <button
                            onClick={() => removeCategory(cat.id)}
                            className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0 text-xs"
                          >✕</button>
                        </div>

                        {/* Expanded edit area */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-0 space-y-2 border-t border-panel-border/50 mt-1">
                                <div className="pt-2">
                                  <label className="block text-[10px] font-medium text-muted mb-1">Slug</label>
                                  <input
                                    type="text"
                                    value={cat.id}
                                    onChange={(e) => updateCategoryField(cat.id, 'id', slugify(e.target.value))}
                                    className="input text-xs py-1.5 w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium text-muted mb-1">Emoji</label>
                                  <input
                                    type="text"
                                    value={cat.emoji || ''}
                                    onChange={(e) => updateCategoryField(cat.id, 'emoji', e.target.value)}
                                    className="input text-xs py-1.5 text-center w-16"
                                    maxLength={4}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium text-muted mb-1">Names</label>
                                  {LANGUAGES.map((lang) => (
                                    <div key={lang.key} className="flex items-center gap-1.5 mb-1 last:mb-0">
                                      <span className="text-[10px] w-6 flex-shrink-0">{lang.flag}</span>
                                      <input
                                        type="text"
                                        value={cat.name?.[lang.key] || ''}
                                        onChange={(e) => updateCategoryName(cat.id, lang.key, e.target.value)}
                                        className="input text-xs py-1 flex-1"
                                        placeholder={lang.key}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* === TAB: ABOUT ME === */}
        {tab === 'aboutMe' && (
          <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FFE600]/20 flex items-center justify-center text-lg">👤</div>
                <div>
                  <h2 className="text-lg font-bold">About Me</h2>
                  <p className="text-xs text-muted">Story card shown below the hero</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-muted mb-2">Title</label>
                  {LANGUAGES.map((lang) => (
                    <div key={lang.key} className="flex items-center gap-2 mb-1.5 last:mb-0">
                      <span className="text-xs w-8 flex-shrink-0">{lang.flag}</span>
                      <input
                        type="text"
                        value={localSettings.aboutMe?.title?.[lang.key] || ''}
                        onChange={(e) => updateField('aboutMe', 'title', lang.key, e.target.value)}
                        className="input text-sm flex-1"
                      />
                    </div>
                  ))}
                  <button onClick={() => handleTranslate('aboutMe', 'title')} disabled={translating['aboutMe.title'] || !localSettings.aboutMe?.title?.en?.trim()} className="mt-1 text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30">
                    {translating['aboutMe.title'] ? '🔄 ...' : '🤖 EN → ES, PT'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-2">Body Text</label>
                  {LANGUAGES.map((lang) => (
                    <div key={lang.key} className="flex items-start gap-2 mb-1.5 last:mb-0">
                      <span className="text-xs w-8 flex-shrink-0 mt-2">{lang.flag}</span>
                      <textarea
                        value={localSettings.aboutMe?.text?.[lang.key] || ''}
                        onChange={(e) => updateField('aboutMe', 'text', lang.key, e.target.value)}
                        className="input text-sm flex-1 min-h-[100px] resize-y"
                        rows={4}
                      />
                    </div>
                  ))}
                  <button onClick={() => handleTranslate('aboutMe', 'text')} disabled={translating['aboutMe.text'] || !localSettings.aboutMe?.text?.en?.trim()} className="mt-1 text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30">
                    {translating['aboutMe.text'] ? '🔄 ...' : '🤖 EN → ES, PT'}
                  </button>
                </div>

                <div className="border-t border-panel-border pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Section Images</h3>
                    <span className="text-xs text-muted">{getSelectedImages('aboutMe').length} selected</span>
                  </div>
                  {(!images || images.length === 0) ? (
                    <p className="text-xs text-muted">No images available.</p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img) => {
                        const selected = (localSettings.aboutMe?.imageIds || []).includes(img._id);
                        return (
                          <button key={img._id} onClick={() => toggleSectionImage('aboutMe', img._id)} className={cn(
                            "flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden ring-2 transition-all",
                            selected
                              ? 'ring-[#FFE600] ring-offset-1 ring-offset-[var(--bg-app)] scale-105'
                              : 'ring-panel-border hover:ring-accent/50 opacity-60 hover:opacity-100'
                          )}>
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            {selected && <div className="absolute inset-0 bg-[#FFE600]/20 flex items-center justify-center"><span className="text-xs font-bold text-[#111827]">✓</span></div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* === TAB: FOOTER === */}
        {tab === 'footer' && (
          <motion.div key="footer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FFE600]/20 flex items-center justify-center text-lg">📝</div>
                <div>
                  <h2 className="text-lg font-bold">Footer</h2>
                  <p className="text-xs text-muted">Bottom section text</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-2">Footer Text</label>
                {LANGUAGES.map((lang) => (
                  <div key={lang.key} className="flex items-center gap-2 mb-1.5 last:mb-0">
                    <span className="text-xs w-8 flex-shrink-0">{lang.flag}</span>
                    <input
                      type="text"
                      value={localSettings.footer?.text?.[lang.key] || ''}
                      onChange={(e) => updateField('footer', 'text', lang.key, e.target.value)}
                      className="input text-sm flex-1"
                    />
                  </div>
                ))}
                <button onClick={() => handleTranslate('footer', 'text')} disabled={translating['footer.text'] || !localSettings.footer?.text?.en?.trim()} className="mt-1 text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30">
                  {translating['footer.text'] ? '🔄 ...' : '🤖 EN → ES, PT'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Save Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#1a1f2e]/80 backdrop-blur-xl border-t border-panel-border"
      >
        <div className="container py-3 flex items-center justify-between">
          <div>
            {saveMsg === 'saved' && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 flex items-center gap-1.5">
                <span>✓</span> Settings saved
              </motion.span>
            )}
            {saveMsg === 'error' && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 flex items-center gap-1.5">
                <span>✕</span> Failed to save
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted hidden sm:block">
              {tab === 'heroTexts' && 'hero text fields'}
              {tab === 'heroImages' && `${orderedHero.length} images selected`}
              {tab === 'categories' && `${categoryList.length} categories`}
            </span>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              size="lg"
              className="px-8"
            >
              {updateSettings.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : '💾 Save Changes'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
