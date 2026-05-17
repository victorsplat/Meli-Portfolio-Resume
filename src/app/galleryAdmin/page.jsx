'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAuthStore } from '@/lib/stores/authStore';
import { useGalleryStore } from '@/lib/stores/galleryStore';
import { useGalleryImages, useUploadImage, useDeleteImage, useUpdateImage, useGallerySettings } from '@/hooks/useGallery';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const MAX_FILES = 20;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_DIM = 2000;
const JPEG_QUALITY = 0.85;

export default function GalleryAdmin() {
  const { t, lang } = useI18n();
  usePageTitle('galleryAdmin.title');

  const { token, login, logout } = useAuthStore();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const isAuthed = ready && !!token;
  const { selectedImage, setSelectedImage } = useGalleryStore();

  const { data: images = [], isLoading, refetch } = useGalleryImages();
  const { data: settings } = useGallerySettings();
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();
  const updateMutation = useUpdateImage();

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [featured, setFeatured] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, errors: [] });
  const fileInputRef = useRef(null);
  const passwordRef = useRef(null);

  const categories = settings?.categories?.items || [];

  const imageCountByCategory = useMemo(() => {
    const counts = {};
    for (const img of images) {
      const cat = img.category || 'others';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [images]);

  useEffect(() => {
    if (ready && !token && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [isAuthed]);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  function getCategoryName(catId) {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return catId;
    return cat.name?.en || catId;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    if (!passwordInput.trim()) {
      setAuthError('Password is required');
      return;
    }
    const ok = await login(passwordInput.trim());
    if (!ok) {
      setAuthError('Invalid password');
      return;
    }
    setPasswordInput('');
  }

  function compressImage(file, maxDim = MAX_DIM, quality = JPEG_QUALITY) {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`"${file.name}" exceeds 15MB`));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round(height * maxDim / width);
              width = maxDim;
            } else {
              width = Math.round(width * maxDim / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            const fr = new FileReader();
            fr.onload = () => resolve({ name: file.name, preview: fr.result, width, height, originalSize: file.size, compressedSize: blob.size });
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          }, 'image/jpeg', quality);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    processFiles(dropped);
  }

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files);
    processFiles(selected);
    e.target.value = '';
  }

  function processFiles(selected) {
    const imagesOnly = selected.filter((f) => f.type.startsWith('image/')).slice(0, MAX_FILES - files.length);
    if (imagesOnly.length === 0) return;
    const oversized = imagesOnly.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      alert(`Some files exceed 15MB:\n${oversized.map((f) => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`).join('\n')}`);
      return;
    }
    const compressed = [];
    for (const file of imagesOnly) {
      const existing = files.find((f) => f.originalName === file.name);
      if (existing) {
        compressed.push(existing);
        continue;
      }
      const id = `${Date.now()}-${compressed.length}`;
      const url = URL.createObjectURL(file);
      compressed.push({ id, originalName: file.name, preview: url, file, compressed: false });
    }
    setFiles((prev) => [...prev, ...compressed].slice(0, MAX_FILES));
  }

  async function compressPending() {
    const updated = [...files];
    let hasChanges = false;
    for (let i = 0; i < updated.length; i++) {
      if (!updated[i].compressed && updated[i].file) {
        try {
          const result = await compressImage(updated[i].file);
          updated[i] = { ...updated[i], ...result, compressed: true, file: null };
          hasChanges = true;
        } catch (err) {
          alert(err.message);
          return null;
        }
      }
    }
    if (hasChanges) setFiles(updated);
    return updated;
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleUpload() {
    const ready = await compressPending();
    if (!ready || ready.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: ready.length, errors: [] });
    const errors = [];
    for (let i = 0; i < ready.length; i++) {
      const file = ready[i];
      if (!file.preview) {
        errors.push(`"${file.originalName}": No image data`);
        setUploadProgress((p) => ({ ...p, current: i + 1, errors: [...errors] }));
        continue;
      }
      try {
        await uploadMutation.mutateAsync({
          image: file.preview,
          title,
          description,
          category,
          featured,
        });
        setUploadProgress((p) => ({ ...p, current: i + 1 }));
      } catch (error) {
        errors.push(`"${file.originalName}": ${error.message}`);
        setUploadProgress((p) => ({ ...p, current: i + 1, errors: [...errors] }));
      }
    }

    setUploading(false);
    if (errors.length > 0) {
      alert(`Upload completed with errors:\n${errors.join('\n')}`);
    }
    setFiles([]);
  }

  const [editTitle, setEditTitle] = useState({ en: '', es: '', pt: '' });
  const [editDesc, setEditDesc] = useState({ en: '', es: '', pt: '' });
  const [editCategory, setEditCategory] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [translatingImg, setTranslatingImg] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      const t = selectedImage.title || {};
      const d = selectedImage.description || {};
      setEditTitle({ en: t.en || '', es: t.es || '', pt: t.pt || '' });
      setEditDesc({ en: d.en || '', es: d.es || '', pt: d.pt || '' });
      setEditCategory(selectedImage.category || '');
      setEditFeatured(selectedImage.featured || false);
    }
  }, [selectedImage]);

  async function handleAutoTranslateImg() {
    const enTitle = editTitle.en?.trim();
    const enDesc = editDesc.en?.trim();
    if (!enTitle && !enDesc) return;
    setTranslatingImg(true);
    try {
      if (enTitle) {
        const res1 = await fetch('https://libretranslate.com/translate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: enTitle, source: 'en', target: 'es', format: 'text' }),
        });
        const es = res1.ok ? (await res1.json()).translatedText || '' : '';
        const res2 = await fetch('https://libretranslate.com/translate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: enTitle, source: 'en', target: 'pt', format: 'text' }),
        });
        const pt = res2.ok ? (await res2.json()).translatedText || '' : '';
        setEditTitle(prev => ({ ...prev, es, pt }));
      }
      if (enDesc) {
        const res1 = await fetch('https://libretranslate.com/translate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: enDesc, source: 'en', target: 'es', format: 'text' }),
        });
        const es = res1.ok ? (await res1.json()).translatedText || '' : '';
        const res2 = await fetch('https://libretranslate.com/translate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: enDesc, source: 'en', target: 'pt', format: 'text' }),
        });
        const pt = res2.ok ? (await res2.json()).translatedText || '' : '';
        setEditDesc(prev => ({ ...prev, es, pt }));
      }
    } catch {}
    setTranslatingImg(false);
  }

  async function handleUpdate() {
    if (!selectedImage) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedImage._id,
        title: editTitle,
        description: editDesc,
        category: editCategory,
        featured: editFeatured,
      });
      setSelectedImage(null);
    } catch (error) {
      alert('Failed to update: ' + error.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('galleryAdmin.deleteConfirm'))) return;
    try {
      await deleteMutation.mutateAsync(id);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
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
          <div className="text-center mb-2">
            <span className="text-4xl">🖼</span>
          </div>
          <h1 className="title text-2xl text-center mb-2">{t('galleryAdmin.title')}</h1>
          <p className="text-muted text-center mb-6 text-sm">{t('galleryAdmin.title')} Access</p>
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
            {authError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
                {authError}
              </motion.p>
            )}
            <Button type="submit" className="w-full">Authenticate</Button>
          </form>
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-accent hover:underline">{t('galleryAdmin.backToHome')}</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app">
      <div className="container py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="title text-3xl md:text-4xl mb-1">{t('galleryAdmin.title')}</h1>
              <p className="text-muted text-sm">Manage your gallery images</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="btn btn-sm">🏠 {t('galleryAdmin.backToHome')}</Link>
              <Link href="/gallery" className="btn btn-sm">👁 {t('galleryAdmin.viewGallery')}</Link>
              <Link href="/galleryAdmin/dashboard" className="btn btn-sm">📊 Dashboard</Link>
              <Button variant="destructive" size="sm" onClick={logout}>🚪 Logout</Button>
              <LanguageSwitcher />
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-3">
            <div
              onDragOver={uploading ? null : handleDragOver}
              onDragLeave={uploading ? null : handleDragLeave}
              onDrop={uploading ? null : handleDrop}
              onClick={uploading ? null : () => fileInputRef.current?.click()}
              className={`card transition-all duration-200 min-h-[240px] flex flex-col items-center justify-center text-center ${
                uploading
                  ? 'opacity-50 cursor-not-allowed border-2 border-dashed border-panel-border'
                  : dragging
                    ? 'cursor-pointer border-2 border-[#FFE600] shadow-[0_0_24px_rgba(255,230,0,0.15)]'
                    : 'cursor-pointer border-2 border-dashed border-panel-border hover:border-[#FFE600] hover:shadow-[0_0_16px_rgba(255,230,0,0.08)]'
              }`}
            >
              <div className={`text-5xl mb-4 transition-transform duration-200 ${dragging ? 'scale-110' : ''}`}>📁</div>
              <p className="text-lg font-semibold text-accent dark:text-white mb-2">
                {uploading ? 'Uploading...' : dragging ? 'Drop files here' : 'Drop images here'}
              </p>
              <p className="text-sm text-muted mb-4">{uploading ? 'Please wait' : 'or click to browse'}</p>
              <span className="inline-block px-4 py-2 rounded-lg bg-accent/10 text-accent dark:text-[#FFE600] text-xs font-medium">
                {uploading ? '⏳ Processing...' : 'Browse Files'}
              </span>
              <p className="text-xs text-muted mt-4">PNG, JPG, WebP, GIF, AVIF &middot; up to 15MB each</p>
              <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={uploading ? null : handleFileSelect} className="hidden" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-4">
            <div className="card">
              <h2 className="text-sm font-semibold text-accent dark:text-[#FFE600] uppercase tracking-wider mb-4">Image Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">{t('galleryAdmin.titleField')}</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('galleryAdmin.titlePlaceholder')} className="input text-sm" />
                  <p className="text-[10px] text-muted mt-0.5">EN → ES, PT via auto-translate on upload</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">{t('galleryAdmin.descField')}</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('galleryAdmin.descPlaceholder')} className="input text-sm min-h-[80px] resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">{t('galleryAdmin.category')}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input text-sm">
                    {categories.length === 0 && <option value="">No categories</option>}
                    {categories.map((cat) => {
                      const count = imageCountByCategory[cat.id] || 0;
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name?.en || cat.id} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer pt-1">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded border-panel-border accent-[#FFE600]" />
                  <span className="text-sm font-medium text-muted">{t('galleryAdmin.markFeatured')}</span>
                </label>
              </div>
            </div>

            <div className="card">
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="btn w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? `⏳ Uploading ${uploadProgress.current}/${uploadProgress.total}`
                  : files.length > 0
                    ? `↑ ${t('galleryAdmin.uploadAll', { count: files.length })}`
                    : `↑ ${t('galleryAdmin.uploadAll', { count: 0 })}`}
              </button>
              <p className="text-[10px] text-muted text-center mt-2">{t('galleryAdmin.rateLimit')}</p>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card mb-12">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-accent dark:text-[#FFE600]">Selected ({files.length})</h3>
                <span className="text-[10px] text-muted">Click ✕ to remove</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {files.map((f) => (
                  <motion.div key={f.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative flex-shrink-0 group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden ring-1 ring-panel-border">
                      <img src={f.preview} alt={f.originalName} className="w-full h-full object-cover" />
                    </div>
                    <button onClick={() => removeFile(f.id)} disabled={uploading} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-md disabled:hidden">✕</button>
                    <p className="text-[9px] text-muted mt-1 max-w-20 truncate text-center">{f.originalName}</p>
                    {f.compressedSize && <p className="text-[8px] text-green-600 dark:text-green-400 text-center">{(f.compressedSize / 1024).toFixed(0)}KB</p>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <h2 className="title text-xl">
            {t('galleryAdmin.existing')}
            <span className="text-muted text-lg ml-2">({images.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-3">
                <div className="aspect-square skeleton rounded-lg mb-3" />
                <div className="h-4 w-2/3 skeleton mb-2" />
                <div className="h-3 w-1/2 skeleton" />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted">
            <div className="text-5xl mb-4">📸</div>
            <p className="text-lg font-medium mb-1">{t('galleryAdmin.noImages')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {images.map((img, i) => {
                const titleText = img.title?.[lang] || img.title?.en || '';
                const descText = img.description?.[lang] || img.description?.en || '';
                const altText = titleText || 'Gallery image';
                return (
                  <motion.div
                    key={img._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                    className="card p-3 cursor-pointer group relative card-hover"
                    onClick={() => setSelectedImage(img)}
                    layout
                  >
                    {img.featured && (
                      <span className="absolute top-4 right-4 bg-[#FFE600] text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-md">★ Featured</span>
                    )}
                    <div className="aspect-square rounded-xl overflow-hidden mb-3 ring-1 ring-panel-border/50">
                      <img src={img.url} alt={altText} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="space-y-1">
                      {titleText && <h3 className="text-xs font-semibold text-accent dark:text-white truncate">{titleText}</h3>}
                      <div className="flex items-center justify-between">
                        {descText && <p className="text-[10px] text-muted truncate flex-1 mr-2">{descText}</p>}
                        <span className="text-[9px] uppercase tracking-wider text-muted bg-accent/5 dark:bg-white/10 px-1.5 py-0.5 rounded flex-shrink-0">
                          {getCategoryName(img.category)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Overlay */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-bg-app rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center"
            >
              <div className="text-5xl mb-4">⏳</div>
              <h3 className="text-lg font-bold mb-2">Uploading images</h3>
              <p className="text-sm text-muted mb-6">
                {uploadProgress.current} of {uploadProgress.total} complete
              </p>
              <div className="w-full h-2 rounded-full bg-accent/10 dark:bg-white/10 overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full bg-[#FFE600]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {uploadProgress.errors.length > 0 && (
                <p className="text-xs text-red-400 mb-4">
                  {uploadProgress.errors.length} error{uploadProgress.errors.length > 1 ? 's' : ''}
                </p>
              )}
              <p className="text-xs text-muted">Please don't close this page</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-bg-app rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/50 transition z-10"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Image preview */}
                <div className="md:w-1/2 bg-black/20 flex items-center justify-center p-4">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || ''}
                    className="w-full h-auto max-h-[50vh] md:max-h-[60vh] object-contain rounded-lg"
                  />
                </div>

                {/* Edit fields */}
                <div className="md:w-1/2 p-5 space-y-4">
                  <h2 className="text-lg font-bold text-accent dark:text-white">Edit Image</h2>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Title</label>
                    {['en', 'es', 'pt'].map(l => (
                      <div key={l} className="flex items-center gap-2 mb-1 last:mb-0">
                        <span className="text-xs w-8 flex-shrink-0">{{ en: '🇺🇸', es: '🇦🇷', pt: '🇧🇷' }[l]}</span>
                        <input
                          type="text"
                          value={editTitle[l] || ''}
                          onChange={(e) => setEditTitle(prev => ({ ...prev, [l]: e.target.value }))}
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
                        <span className="text-xs w-8 flex-shrink-0 mt-2">{{ en: '🇺🇸', es: '🇦🇷', pt: '🇧🇷' }[l]}</span>
                        <textarea
                          value={editDesc[l] || ''}
                          onChange={(e) => setEditDesc(prev => ({ ...prev, [l]: e.target.value }))}
                          placeholder={`Description (${l})`}
                          className="input text-sm flex-1 min-h-[50px] resize-none"
                          rows={2}
                        />
                      </div>
                    ))}
                    <button
                      onClick={handleAutoTranslateImg}
                      disabled={translatingImg || !editTitle.en?.trim()}
                      className="mt-1 text-xs text-accent dark:text-[#FFE600] hover:underline disabled:opacity-30"
                    >
                      {translatingImg ? '🔄 ...' : '🤖 EN → ES, PT'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="input text-sm w-full"
                    >
                      {categories.map((cat) => {
                        const count = imageCountByCategory[cat.id] || 0;
                        return (
                          <option key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.name?.en || cat.id} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-panel-border accent-[#FFE600]"
                    />
                    <span className="text-sm font-medium text-muted">Mark as featured</span>
                  </label>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleUpdate}
                      disabled={updateMutation.isPending}
                      className="flex-1"
                    >
                      {updateMutation.isPending ? 'Saving...' : '💾 Save'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedImage._id)}
                      disabled={deleteMutation.isPending}
                      className="flex-shrink-0"
                    >
                      {deleteMutation.isPending ? '...' : '🗑 Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
