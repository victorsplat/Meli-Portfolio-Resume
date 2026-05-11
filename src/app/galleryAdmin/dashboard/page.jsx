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
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
    ],
  },
  {
    id: 'aboutMe',
    title: 'About Me Section',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'text', label: 'Body Text', type: 'textarea' },
    ],
  },
  {
    id: 'footer',
    title: 'Footer Section',
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
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [translating, setTranslating] = useState({});
  const passwordRef = useCallback(el => el?.focus(), []);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token) {
      setAuthenticated(true);
      fetchSettings();
    }
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/gallery/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
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
          <p className="text-muted mb-6">Edit gallery page content in all 3 languages</p>
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
              <h2 className="text-xl font-bold text-accent dark:text-[#FFE600] mb-6">
                {section.title}
              </h2>

              {section.fields.map((field) => (
                <div key={field.key} className="mb-6 last:mb-0">
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

                  {field.key !== 'text' && (
                    <button
                      onClick={() => handleTranslate(section.id, field.key)}
                      disabled={translating[`${section.id}.${field.key}`] || !settings[section.id]?.[field.key]?.en?.trim()}
                      className="mt-2 text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30 disabled:no-underline"
                    >
                      {translating[`${section.id}.${field.key}`] ? '🔄 Translating...' : '🤖 Auto-translate EN → ES, PT'}
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
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
