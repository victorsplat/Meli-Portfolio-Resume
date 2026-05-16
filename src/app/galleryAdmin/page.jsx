'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAuthStore } from '@/lib/stores/authStore';
import { useGalleryStore } from '@/lib/stores/galleryStore';
import { useGalleryImages, useUploadImage, useDeleteImage, useGallerySettings } from '@/hooks/useGallery';
import GalleryLightbox from '@/components/GalleryLightbox';

const MAX_FILES = 20;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_DIM = 2000;
const JPEG_QUALITY = 0.85;

export default function GalleryAdmin() {
  const { t } = useI18n();
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

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [featured, setFeatured] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const passwordRef = useRef(null);

  const categories = settings?.categories?.items || [];

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

    const errors = [];
    for (let i = 0; i < ready.length; i++) {
      const file = ready[i];
      if (!file.preview) {
        errors.push(`"${file.originalName}": No image data`);
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
      } catch (error) {
        errors.push(`"${file.originalName}": ${error.message}`);
      }
    }

    if (errors.length > 0) {
      alert(`Upload completed with errors:\n${errors.join('\n')}`);
    }
    setFiles([]);
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
            <button type="submit" className="btn w-full">Authenticate</button>
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
            <div className="flex flex-wrap gap-2">
              <Link href="/" className="btn !text-xs !py-2 !px-3 !bg-white/80 dark:!bg-white/10 !text-accent hover:!bg-white dark:hover:!bg-white/20 !shadow-none border border-panel-border">
                🏠 {t('galleryAdmin.backToHome')}
              </Link>
              <Link href="/gallery" className="btn !text-xs !py-2 !px-3 !bg-white/80 dark:!bg-white/10 !text-accent hover:!bg-white dark:hover:!bg-white/20 !shadow-none border border-panel-border">
                👁 {t('galleryAdmin.viewGallery')}
              </Link>
              <Link href="/galleryAdmin/dashboard" className="btn !text-xs !py-2 !px-3" style={{ background: 'linear-gradient(135deg, #FFE600, #FFC000)', color: '#111827' }}>
                📊 Dashboard
              </Link>
              <button onClick={logout} className="btn !text-xs !py-2 !px-3 !bg-red-500 hover:!bg-red-600 !shadow-none">
                🚪 Logout
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-3">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`card cursor-pointer transition-all duration-200 min-h-[240px] flex flex-col items-center justify-center text-center ${
                dragging ? 'border-2 border-[#FFE600] shadow-[0_0_24px_rgba(255,230,0,0.15)]' : 'border-2 border-dashed border-panel-border hover:border-[#FFE600] hover:shadow-[0_0_16px_rgba(255,230,0,0.08)]'
              }`}
            >
              <div className={`text-5xl mb-4 transition-transform duration-200 ${dragging ? 'scale-110' : ''}`}>📁</div>
              <p className="text-lg font-semibold text-accent dark:text-white mb-2">{dragging ? 'Drop files here' : 'Drop images here'}</p>
              <p className="text-sm text-muted mb-4">or click to browse</p>
              <span className="inline-block px-4 py-2 rounded-lg bg-accent/10 text-accent dark:text-[#FFE600] text-xs font-medium">Browse Files</span>
              <p className="text-xs text-muted mt-4">PNG, JPG, WebP, GIF, AVIF &middot; up to 15MB each</p>
              <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={handleFileSelect} className="hidden" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-4">
            <div className="card">
              <h2 className="text-sm font-semibold text-accent dark:text-[#FFE600] uppercase tracking-wider mb-4">Image Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">{t('galleryAdmin.titleField')}</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('galleryAdmin.titlePlaceholder')} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">{t('galleryAdmin.descField')}</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('galleryAdmin.descPlaceholder')} className="input text-sm min-h-[80px] resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">{t('galleryAdmin.category')}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input text-sm">
                    {categories.length === 0 && <option value="">No categories</option>}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name?.en || cat.id}
                      </option>
                    ))}
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
                disabled={files.length === 0 || uploadMutation.isPending}
                className="btn w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending
                  ? `⏳ ${t('galleryAdmin.uploading')}`
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
                    <button onClick={() => removeFile(f.id)} disabled={uploadMutation.isPending} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-md disabled:hidden">✕</button>
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
              {images.map((img, i) => (
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
                    <img src={img.url} alt={img.title || 'Gallery image'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="space-y-1">
                    {img.title && <h3 className="text-xs font-semibold text-accent dark:text-white truncate">{img.title}</h3>}
                    <div className="flex items-center justify-between">
                      {img.description && <p className="text-[10px] text-muted truncate flex-1 mr-2">{img.description}</p>}
                      <span className="text-[9px] uppercase tracking-wider text-muted bg-accent/5 dark:bg-white/10 px-1.5 py-0.5 rounded flex-shrink-0">
                        {getCategoryName(img.category)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <GalleryLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onDelete={handleDelete}
        deleteLabel={t('galleryAdmin.delete')}
        categoryLabel={selectedImage ? getCategoryName(selectedImage.category) : ''}
        categoryEmoji={selectedImage ? categories.find(c => c.id === selectedImage.category)?.emoji || '📁' : ''}
      />
    </div>
  );
}
