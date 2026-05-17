'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const LANG_FLAGS = { en: '🇺🇸', es: '🇦🇷', pt: '🇧🇷' };

export default function ImageEditModal({
  image,
  onClose,
  onSave,
  onDelete,
  categories = [],
  imageCountByCategory = {},
}) {
  const [title, setTitle] = useState({ en: '', es: '', pt: '' });
  const [desc, setDesc] = useState({ en: '', es: '', pt: '' });
  const [category, setCategory] = useState('');
  const [featured, setFeatured] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (image) {
      const t = image.title || {};
      const d = image.description || {};
      setTitle({ en: t.en || '', es: t.es || '', pt: t.pt || '' });
      setDesc({ en: d.en || '', es: d.es || '', pt: d.pt || '' });
      setCategory(image.category || '');
      setFeatured(image.featured || false);
    }
  }, [image]);

  async function handleAutoTranslate() {
    const enTitle = title.en?.trim();
    const enDesc = desc.en?.trim();
    if (!enTitle && !enDesc) return;
    setTranslating(true);
    try {
      if (enTitle) {
        const [esRes, ptRes] = await Promise.all([
          fetch('https://libretranslate.com/translate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: enTitle, source: 'en', target: 'es', format: 'text' }),
          }),
          fetch('https://libretranslate.com/translate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: enTitle, source: 'en', target: 'pt', format: 'text' }),
          }),
        ]);
        const [esText, ptText] = await Promise.all([
          esRes.ok ? esRes.json() : { translatedText: '' },
          ptRes.ok ? ptRes.json() : { translatedText: '' },
        ]);
        setTitle(prev => ({
          ...prev,
          es: esText.translatedText || '',
          pt: ptText.translatedText || '',
        }));
      }
      if (enDesc) {
        const [esRes, ptRes] = await Promise.all([
          fetch('https://libretranslate.com/translate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: enDesc, source: 'en', target: 'es', format: 'text' }),
          }),
          fetch('https://libretranslate.com/translate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: enDesc, source: 'en', target: 'pt', format: 'text' }),
          }),
        ]);
        const [esText, ptText] = await Promise.all([
          esRes.ok ? esRes.json() : { translatedText: '' },
          ptRes.ok ? ptRes.json() : { translatedText: '' },
        ]);
        setDesc(prev => ({
          ...prev,
          es: esText.translatedText || '',
          pt: ptText.translatedText || '',
        }));
      }
    } catch {}
    setTranslating(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ title, description: desc, category, featured });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-2xl w-full bg-bg-app rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/50 transition z-10"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 bg-black/20 flex items-center justify-center p-4">
                <img
                  src={image.url}
                  alt={image.title || ''}
                  className="w-full h-auto max-h-[50vh] md:max-h-[60vh] object-contain rounded-lg"
                />
              </div>

              <div className="md:w-1/2 p-5 space-y-4">
                <h2 className="text-lg font-bold text-accent dark:text-white">Edit Image</h2>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Title</label>
                  {['en', 'es', 'pt'].map(l => (
                    <div key={l} className="flex items-center gap-2 mb-1 last:mb-0">
                      <span className="text-xs w-8 flex-shrink-0">{LANG_FLAGS[l]}</span>
                      <input
                        type="text"
                        value={title[l] || ''}
                        onChange={(e) => setTitle(prev => ({ ...prev, [l]: e.target.value }))}
                        placeholder={`Title (${l})`}
                        className="input text-sm flex-1"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Description</label>
                  {['en', 'es', 'pt'].map(l => (
                    <div key={l} className="flex items-start gap-2 mb-1 last:mb-0">
                      <span className="text-xs w-8 flex-shrink-0 mt-2">{LANG_FLAGS[l]}</span>
                      <textarea
                        value={desc[l] || ''}
                        onChange={(e) => setDesc(prev => ({ ...prev, [l]: e.target.value }))}
                        placeholder={`Description (${l})`}
                        className="input text-sm flex-1 min-h-[50px] resize-none"
                        rows={2}
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleAutoTranslate}
                    disabled={translating || !title.en?.trim()}
                    className="mt-1 text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30"
                  >
                    {translating ? '🔄 ...' : '🤖 EN → ES, PT'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input text-sm w-full"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name?.en || cat.id} ({imageCountByCategory[cat.id] || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-panel-border accent-[#FFE600]"
                  />
                  <span className="text-sm font-medium text-muted">Mark as featured</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? 'Saving...' : '💾 Save'}
                  </Button>
                  <Button variant="destructive" onClick={() => onDelete(image._id)} disabled={saving} className="flex-shrink-0">
                    🗑 Delete
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
