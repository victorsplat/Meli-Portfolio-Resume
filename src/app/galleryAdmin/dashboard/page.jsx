'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AUTH_KEY = 'gallery_admin_token';
const LANGUAGES = [
  { key: 'en', label: 'EN', flag: '🇺🇸' },
  { key: 'es', label: 'ES', flag: '🇦🇷' },
  { key: 'pt', label: 'PT', flag: '🇧🇷' },
];

const SECTIONS = [
  {
    id: 'hero',
    title: 'Hero Section',
    description: 'Large carousel at the top of the gallery page',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
    ],
  },
  {
    id: 'aboutMe',
    title: 'About Me Section',
    description: 'Story card below the hero',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'text', label: 'Body Text', type: 'textarea' },
    ],
  },
  {
    id: 'footer',
    title: 'Footer Section',
    description: 'Footer text at the bottom of the gallery',
    fields: [
      { key: 'text', label: 'Footer Text', type: 'text' },
    ],
  },
];

async function translateText(text, source, target) {
  if (!text.trim()) return '';
  try {
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' }),
    });
    if (!res.ok) throw new Error('Translation failed');
    const data = await res.json();
    return data.translatedText;
  } catch {
    return '';
  }
}

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [settings, setSettings] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [settingsError, setSettingsError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [translating, setTranslating] = useState({});
  const passwordRef = useCallback(el => el?.focus(), []);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token) {
      setAuthenticated(true);
      fetchSettings();
      fetchImages();
    }
  }, []);

  async function fetchSettings() {
    setSettingsError('');
    try {
      const res = await fetch('/api/gallery/settings');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettingsError('Failed to load settings.');
    }
  }

  async function fetchImages() {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (!data.error) setAllImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    if (!passwordInput.trim()) {
      setAuthError('Password is required');
      return;
    }
    const testRes = await fetch('/api/gallery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${passwordInput.trim()}`,
      },
      body: JSON.stringify({ image: '', title: '', description: '' }),
    });
    if (testRes.status === 401 || testRes.status === 403) {
      setAuthError('Invalid password');
      return;
    }
    localStorage.setItem(AUTH_KEY, passwordInput.trim());
    setAuthenticated(true);
    setPasswordInput('');
    fetchSettings();
    fetchImages();
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setSettings(null);
  }

  function updateField(section, field, lang, value) {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: {
          ...(prev?.[section]?.[field] || { en: '', es: '', pt: '' }),
          [lang]: value,
        },
      },
    }));
  }

  function toggleSectionImage(sectionId, imageId) {
    setSettings(prev => {
      const ids = prev?.[sectionId]?.imageIds || [];
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          imageIds: ids.includes(imageId)
            ? ids.filter(id => id !== imageId)
            : [...ids, imageId],
        },
      };
    });
  }

  async function handleTranslate(sectionId, fieldKey) {
    const enText = settings?.[sectionId]?.[fieldKey]?.en || '';
    if (!enText.trim()) return;
    setTranslating(prev => ({ ...prev, [`${sectionId}.${fieldKey}`]: true }));
    const [esText, ptText] = await Promise.all([
      translateText(enText, 'en', 'es'),
      translateText(enText, 'en', 'pt'),
    ]);
    setSettings(prev => ({
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
    setTranslating(prev => ({ ...prev, [`${sectionId}.${fieldKey}`]: false }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/gallery/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(AUTH_KEY)}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveMsg('Settings saved successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('Failed to save settings');
      }
    } catch {
      setSaveMsg('Error saving settings');
    } finally {
      setSaving(false);
    }
  }

  function getSelectedImages(sectionId) {
    const ids = settings?.[sectionId]?.imageIds || [];
    return allImages.filter(img => ids.includes(img._id));
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-md w-full mx-4 p-8"
        >
          <h1 className="title text-2xl text-center mb-2">Gallery Dashboard</h1>
          <p className="text-muted text-center mb-6 text-sm">Enter admin password to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              ref={passwordRef}
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Admin password"
              className="input text-center text-lg"
              autoFocus
            />
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            <button type="submit" className="btn w-full">Authenticate</button>
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
          <p className="text-muted mb-4">{settingsError}</p>
          <button onClick={fetchSettings} className="btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app">
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="title text-4xl md:text-5xl">📋 Gallery Dashboard</h1>
          <p className="text-muted mb-6">Edit gallery page content and organize images in all 3 languages</p>
          <div className="flex justify-center gap-4">
            <Link href="/galleryAdmin" className="btn btn-sm">← Image Manager</Link>
            <Link href="/gallery" className="btn btn-sm btn-secondary">View Gallery</Link>
            <button onClick={handleLogout} className="btn btn-sm !bg-red-500 hover:!bg-red-600">Logout</button>
          </div>
        </motion.div>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-accent dark:text-[#FFE600]">{section.title}</h2>
                {section.description && (
                  <span className="text-xs text-muted hidden sm:block">{section.description}</span>
                )}
              </div>

              {/* Text Fields */}
              {section.fields.map((field) => (
                <div key={field.key} className="mb-5 last:mb-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {LANGUAGES.map((lang) => {
                      const value = settings[section.id]?.[field.key]?.[lang.key] || '';
                      return (
                        <div key={lang.key}>
                          <label className="block text-xs font-medium text-muted mb-1">
                            {lang.flag} {lang.label}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={value}
                              onChange={(e) => updateField(section.id, field.key, lang.key, e.target.value)}
                              className="input min-h-[100px] resize-y text-sm"
                              rows={4}
                            />
                          ) : (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateField(section.id, field.key, lang.key, e.target.value)}
                              className="input text-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleTranslate(section.id, field.key)}
                    disabled={translating[`${section.id}.${field.key}`] || !settings[section.id]?.[field.key]?.en?.trim()}
                    className="mt-2 text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30 disabled:no-underline"
                  >
                    {translating[`${section.id}.${field.key}`] ? '🔄 Translating...' : '🤖 Auto-translate EN → ES, PT'}
                  </button>
                </div>
              ))}

              {/* Image Selector */}
              <div className="mt-6 pt-4 border-t border-panel-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-accent dark:text-white">Section Images</h3>
                  <span className="text-xs text-muted">
                    {getSelectedImages(section.id).length} selected
                  </span>
                </div>

                {allImages.length === 0 ? (
                  <p className="text-xs text-muted">No images available. Upload images in the Image Manager first.</p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {allImages.map((img) => {
                      const selected = (settings[section.id]?.imageIds || []).includes(img._id);
                      return (
                        <button
                          key={img._id}
                          onClick={() => toggleSectionImage(section.id, img._id)}
                          className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden ring-2 transition-all duration-200 ${
                            selected
                              ? 'ring-[#FFE600] ring-offset-2 ring-offset-[var(--bg-app)] scale-105'
                              : 'ring-panel-border hover:ring-accent/50 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.title || ''}
                            className="w-full h-full object-cover"
                          />
                          {selected && (
                            <div className="absolute inset-0 bg-[#FFE600]/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-[#111827]">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Images Preview */}
                {getSelectedImages(section.id).length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {getSelectedImages(section.id).map((img) => (
                      <div key={img._id} className="flex items-center gap-1.5 bg-accent/5 dark:bg-white/5 px-2 py-1 rounded-lg text-xs text-muted">
                        <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="truncate max-w-[120px]">{img.title || 'Untitled'}</span>
                        <button
                          onClick={() => toggleSectionImage(section.id, img._id)}
                          className="ml-0.5 text-red-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn text-lg px-10 disabled:opacity-50"
          >
            {saving ? '💾 Saving...' : '💾 Save All Settings'}
          </button>
          {saveMsg && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 text-sm ${saveMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}
            >
              {saveMsg}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
