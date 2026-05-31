'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuthStore } from '@/lib/stores/authStore';
import { useGallerySettings, useGalleryImages, useUpdateSettings, useMigrateImage } from '@/hooks/useGallery';
import { cn } from '@/lib/utils';
import type { GalleryImage, Category } from '@/lib/schemas/gallery';
import type { GallerySettings } from '@/lib/schemas/gallery';

interface LocalSettings {
  hero?: {
    title?: Record<string, string>;
    subtitle?: Record<string, string>;
    imageIds?: string[];
  };
  categories?: {
    items: Category[];
  };
  aboutMe?: {
    title?: Record<string, string>;
    text?: Record<string, string>;
    imageIds?: string[];
  };
  footer?: {
    text?: Record<string, string>;
    imageIds?: string[];
  };
  [key: string]: unknown;
}

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
  { id: 'storage', label: 'Storage', icon: '💾' },
];

const HERO_POSITIONS = [
  { index: 0, label: 'Main Media', desc: 'Expands on scroll — primary image' },
  { index: 1, label: 'Background', desc: 'Fades out during scroll' },
  { index: 2, label: 'Post-Scroll BG', desc: 'Shows after full expansion' },
];

async function translateText(text: string, source: string, target: string): Promise<string> {
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

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-/g, '');
}

export default function DashboardPage() {
  const { token, login, logout } = useAuthStore();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const { data: settings, isLoading: settingsLoading, error: settingsError, refetch } = useGallerySettings();
  const { data: images } = useGalleryImages();
  const updateSettings = useUpdateSettings();

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [localSettings, setLocalSettings] = useState<LocalSettings | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [tab, setTab] = useState('heroTexts');
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [newCategory, setNewCategory] = useState<{ id: string; name: Record<string, string>; emoji: string }>({ id: '', name: { en: '', es: '', pt: '' }, emoji: '📁' });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const migrateImage = useMigrateImage();
  const [migratingMap, setMigratingMap] = useState<Record<string, string>>({});
  const [migratingAll, setMigratingAll] = useState(false);

  const passwordRef = useCallback((el: HTMLInputElement | null) => el?.focus(), []);

  useEffect(() => {
    if (settings) setLocalSettings(settings as unknown as LocalSettings);
  }, [settings]);

  const categoryList: Category[] = (localSettings?.categories?.items as Category[]) || [];

  const imageCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    if (images) {
      for (const img of images) {
        const cat = img.category || 'others';
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    return counts;
  }, [images]);

  function getSelectedImages(sectionId: string): GalleryImage[] {
    const ids = (localSettings?.[sectionId] as Record<string, unknown>)?.imageIds as string[] || [];
    return (images || []).filter((img: GalleryImage) => ids.includes(img._id));
  }

  function getOrderedHeroImages(): GalleryImage[] {
    const ids = localSettings?.hero?.imageIds || [];
    return ids.map((id) => images?.find((i: GalleryImage) => i._id === id)).filter(Boolean) as GalleryImage[];
  }

  async function handleLogin(e: React.FormEvent) {
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

  function updateField(section: string, field: string, lang: string, value: string) {
    setLocalSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev as Record<string, unknown>)?.[section] as Record<string, unknown>,
        [field]: { ...(((prev as Record<string, unknown>)?.[section] as Record<string, unknown>)?.[field] as Record<string, string> || { en: '', es: '', pt: '' }), [lang]: value },
      },
    } as LocalSettings));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function toggleHeroImage(imageId: string) {
    setLocalSettings((prev) => {
      const ids = prev?.hero?.imageIds || [];
      const exists = ids.includes(imageId);
      if (!exists && ids.length >= 3) return prev;
      return {
        ...prev,
        hero: {
          ...prev?.hero,
          imageIds: exists ? ids.filter((id) => id !== imageId) : [...ids, imageId],
        },
      } as LocalSettings;
    });
  }

  function setHeroSlot(slotIndex: number, imageId: string | null) {
    setLocalSettings((prev) => {
      const ids = [...(prev?.hero?.imageIds || []), null, null, null].slice(0, 3) as (string | null)[];
      const existsIdx = ids.indexOf(imageId);
      if (existsIdx !== -1) ids[existsIdx] = null;
      ids[slotIndex] = imageId;
      const cleaned = ids.filter(Boolean) as string[];
      return { ...prev, hero: { ...prev?.hero, imageIds: cleaned } } as LocalSettings;
    });
  }

  function toggleSectionImage(sectionId: string, imageId: string) {
    setLocalSettings((prev) => {
      const section = prev?.[sectionId] as Record<string, unknown> || {};
      const ids = (section.imageIds as string[]) || [];
      return {
        ...prev,
        [sectionId]: {
          ...section,
          imageIds: ids.includes(imageId) ? ids.filter((id) => id !== imageId) : [...ids, imageId],
        },
      } as LocalSettings;
    });
  }

  async function handleTranslate(sectionId: string, fieldKey: string) {
    const enText = ((localSettings?.[sectionId] as Record<string, unknown>)?.[fieldKey] as Record<string, string>)?.en || '';
    if (!enText.trim()) return;
    setTranslating((prev) => ({ ...prev, [`${sectionId}.${fieldKey}`]: true }));
    const [esText, ptText] = await Promise.all([translateText(enText, 'en', 'es'), translateText(enText, 'en', 'pt')]);
    setLocalSettings((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev?.[sectionId] as Record<string, unknown>),
        [fieldKey]: {
          en: enText,
          es: esText || ((prev?.[sectionId] as Record<string, unknown>)?.[fieldKey] as Record<string, string>)?.es || '',
          pt: ptText || ((prev?.[sectionId] as Record<string, unknown>)?.[fieldKey] as Record<string, string>)?.pt || '',
        },
      },
    } as LocalSettings));
    setTranslating((prev) => ({ ...prev, [`${sectionId}.${fieldKey}`]: false }));
  }

  async function handleSave() {
    setSaveMsg('');
    try {
      await updateSettings.mutateAsync(localSettings as GallerySettings);
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
    items.push({ id, name, emoji: newCategory.emoji || '📁', sortOrder: maxOrder + 1 } as Category);
    setLocalSettings((prev) => ({ ...prev, categories: { ...prev?.categories, items } } as LocalSettings));
    setNewCategory({ id: '', name: { en: '', es: '', pt: '' }, emoji: '📁' });
    setShowCategoryForm(false);
  }

  function removeCategory(catId: string) {
    if (!confirm(`Delete "${catId}"? Existing images in this category won't be affected.`)) return;
    setLocalSettings((prev) => ({
      ...prev,
      categories: { ...prev?.categories, items: (prev?.categories?.items || []).filter((c: Category) => c.id !== catId) },
    } as LocalSettings));
  }

  function updateCategoryName(id: string, lang: string, value: string) {
    setLocalSettings((prev) => ({
      ...prev,
      categories: {
        ...prev?.categories,
        items: (prev?.categories?.items || []).map((c: Category) => 
          c.id === id ? { ...c, name: { ...c.name, [lang]: value } } : c
        ),
      },
    } as LocalSettings));
  }

  function updateCategoryField(id: string, field: string, value: string | number) {
    setLocalSettings((prev) => ({
      ...prev,
      categories: {
        ...prev?.categories,
        items: (prev?.categories?.items || []).map((c: Category) => 
          c.id === id ? { ...c, [field]: value } : c
        ),
      },
    } as LocalSettings));
  }

  function moveCategory(id: string, direction: number) {
    setLocalSettings((prev) => {
      const items = [...(prev?.categories?.items || [])];
      const idx = items.findIndex((c: Category) => c.id === id);
      if (idx === -1) return prev;
      const to = idx + direction;
      if (to < 0 || to >= items.length) return prev;
      [items[idx], items[to]] = [items[to], items[idx]];
      return { ...prev, categories: { ...prev?.categories, items: items.map((c: Category, i: number) => ({ ...c, sortOrder: i })) } } as LocalSettings;
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

  const renderLanguageInputs = (
    sectionId: string,
    fieldKey: string,
    label: string,
    inputType: 'input' | 'textarea' = 'input',
    rows = 2
  ) => (
    <div>
      <label className="block text-xs font-medium text-muted mb-2">{label}</label>
      {LANGUAGES.map((lang) => (
        <div key={lang.key} className="flex items-center gap-2 mb-1.5 last:mb-0">
          <span className={`text-xs w-8 flex-shrink-0 ${inputType === 'textarea' ? 'mt-2' : ''}`}>{lang.flag}</span>
          {inputType === 'textarea' ? (
            <textarea
              value={((localSettings[sectionId] as Record<string, unknown>)?.[fieldKey] as Record<string, string>)?.[lang.key] || ''}
              onChange={(e) => updateField(sectionId, fieldKey, lang.key, e.target.value)}
              className="input text-sm flex-1 min-h-[50px] resize-y"
              rows={rows}
            />
          ) : (
            <input
              type="text"
              value={((localSettings[sectionId] as Record<string, unknown>)?.[fieldKey] as Record<string, string>)?.[lang.key] || ''}
              onChange={(e) => updateField(sectionId, fieldKey, lang.key, e.target.value)}
              className="input text-sm flex-1"
              placeholder={`${label} in ${lang.key}`}
            />
          )}
        </div>
      ))}
      <button
        onClick={() => handleTranslate(sectionId, fieldKey)}
        disabled={translating[`${sectionId}.${fieldKey}`] || !((localSettings[sectionId] as Record<string, unknown>)?.[fieldKey] as Record<string, string>)?.en?.trim()}
        className="mt-1 text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30"
      >
        {translating[`${sectionId}.${fieldKey}`] ? '🔄 ...' : '🤖 EN → ES, PT'}
      </button>
    </div>
  );

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
              <Link href="/galleryAdmin" className="btn btn-sm">↑ Image Uploader</Link>
              <Link href="/gallery" className="btn btn-sm btn-secondary">View Gallery</Link>
              <Button variant="secondary" size="sm" onClick={() => setTab('storage')}>
                💾 Storage
              </Button>
              <Button variant="destructive" size="sm" onClick={logout}>Logout</Button>
              <LanguageSwitcher />
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
                {renderLanguageInputs('hero', 'title', 'Title')}
                {renderLanguageInputs('hero', 'subtitle', 'Subtitle (CTA text)')}
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
                      const img: GalleryImage | undefined = orderedHero[pos.index];
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
                    {images.map((img: GalleryImage) => {
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
                  {categoryList.map((cat: Category, idx: number) => {
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
                              {(cat.name as Record<string, string>)?.en || cat.id}
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
                                        value={(cat.name as Record<string, string>)?.[lang.key] || ''}
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
                {renderLanguageInputs('aboutMe', 'title', 'Title')}
                {renderLanguageInputs('aboutMe', 'text', 'Body Text', 'textarea', 4)}

                <div className="border-t border-panel-border pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Section Images</h3>
                    <span className="text-xs text-muted">{getSelectedImages('aboutMe').length} selected</span>
                  </div>
                  {(!images || images.length === 0) ? (
                    <p className="text-xs text-muted">No images available.</p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img: GalleryImage) => {
                        const selected = ((localSettings.aboutMe?.imageIds) || []).includes(img._id);
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

        {/* === TAB: STORAGE === */}
        {tab === 'storage' && (
          <motion.div key="storage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FFE600]/20 flex items-center justify-center text-lg">💾</div>
                <div>
                  <h2 className="text-lg font-bold">Storage</h2>
                  <p className="text-xs text-muted">Manage where your images are stored — migrate base64 images to Vercel Blob</p>
                </div>
              </div>

              {!images ? (
                <p className="text-sm text-muted py-6 text-center">Loading images...</p>
              ) : (
                <>
                  {/* Storage Stats */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-panel-border">
                    <div className="text-sm">
                      <span className="font-semibold text-green-600">{(images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('https://')).length}</span>
                      <span className="text-muted"> on Blob</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-amber-600">{(images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('data:')).length}</span>
                      <span className="text-muted"> on Base64</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{(images as GalleryImage[]).length}</span>
                      <span className="text-muted"> total</span>
                    </div>
                  </div>

                  {/* Base64 images — need migration */}
                  {(images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('data:')).length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
                          <span>⚠️</span> Base64 Images — needs migration
                        </h3>
                        <div className="flex items-center gap-2">
                          {migratingAll && (
                            <span className="text-xs text-muted">
                              {Object.values(migratingMap).filter((s) => s === 'done').length} / {(images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('data:')).length}
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              setMigratingAll(true);
                              const base64Images = (images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('data:'));
                              for (const img of base64Images) {
                                if (migratingMap[img._id] === 'done') continue;
                                setMigratingMap((p) => ({ ...p, [img._id]: 'loading' }));
                                try {
                                  await migrateImage.mutateAsync(img._id);
                                  setMigratingMap((p) => ({ ...p, [img._id]: 'done' }));
                                } catch {
                                  setMigratingMap((p) => ({ ...p, [img._id]: 'error' }));
                                }
                              }
                              setMigratingAll(false);
                            }}
                            disabled={migratingAll}
                          >
                            {migratingAll ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Migrating...
                              </span>
                            ) : (
                              <span>↑ Migrate All ({(images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('data:')).length})</span>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {(images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('data:')).map((img: GalleryImage) => (
                          <div key={img._id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/30">
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {(img.title as Record<string, string>)?.en || (img.title as Record<string, string>)?.pt || 'Untitled'}
                              </p>
                              <p className="text-[10px] text-muted truncate font-mono">
                                {img.url?.slice(0, 60)}...
                              </p>
                              <p className="text-[10px] text-muted">
                                {((img.url?.length || 0) * 0.75 / 1024 / 1024).toFixed(1)}MB estimated — {img.category || 'no category'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={migratingMap[img._id] === 'error' ? 'destructive' : 'default'}
                              onClick={async () => {
                                setMigratingMap((p) => ({ ...p, [img._id]: 'loading' }));
                                try {
                                  await migrateImage.mutateAsync(img._id);
                                  setMigratingMap((p) => ({ ...p, [img._id]: 'done' }));
                                  setTimeout(() => setMigratingMap((p) => {
                                    const next = { ...p };
                                    delete next[img._id];
                                    return next;
                                  }), 3000);
                                } catch {
                                  setMigratingMap((p) => ({ ...p, [img._id]: 'error' }));
                                }
                              }}
                              disabled={migratingMap[img._id] === 'loading' || migrateImage.isPending}
                              className="flex-shrink-0"
                            >
                              {migratingMap[img._id] === 'loading' ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  Migrating...
                                </span>
                              ) : migratingMap[img._id] === 'done' ? (
                                <span className="flex items-center gap-1">✓ Migrated</span>
                              ) : migratingMap[img._id] === 'error' ? (
                                <span className="flex items-center gap-1">✕ Failed</span>
                              ) : (
                                <span className="flex items-center gap-1">↑ Migrate to Blob</span>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blob images — already good */}
                  {(images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('https://')).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                        <span>✓</span> Blob Images — already on Vercel Blob
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(images as GalleryImage[]).filter((i: GalleryImage) => i.url?.startsWith('https://')).map((img: GalleryImage) => (
                          <div key={img._id} className="group relative w-16 h-16 rounded-lg overflow-hidden ring-1 ring-green-500/30">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(images as GalleryImage[]).length === 0 && (
                    <p className="text-sm text-muted py-8 text-center">No images in gallery yet.</p>
                  )}
                </>
              )}
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

              {renderLanguageInputs('footer', 'text', 'Footer Text')}
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
              {tab === 'storage' && `${(images as GalleryImage[])?.length || 0} images`}
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
