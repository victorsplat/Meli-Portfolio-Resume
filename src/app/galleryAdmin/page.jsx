'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import PageHeader from '@/components/PageHeader';
import GalleryLightbox from '@/components/GalleryLightbox';

const AUTH_KEY = 'gallery_admin_token';
const MAX_FILES = 20;

export default function GalleryAdmin() {
  const { t } = useI18n();
  usePageTitle('galleryAdmin.title');
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('others');
  const [featured, setFeatured] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token) {
      setAuthenticated(true);
      fetchImages(token);
    } else {
      setAuthChecking(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated && !authChecking && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [authenticated, authChecking]);

  function getAuthHeaders(token) {
    const t = token || localStorage.getItem(AUTH_KEY);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${t}`
    };
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
      headers: getAuthHeaders(passwordInput.trim()),
      body: JSON.stringify({ image: '', title: '', description: '' })
    });
    if (testRes.status === 401 || testRes.status === 403) {
      setAuthError('Invalid password');
      return;
    }
    localStorage.setItem(AUTH_KEY, passwordInput.trim());
    setAuthenticated(true);
    setPasswordInput('');
    fetchImages(passwordInput.trim());
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setImages([]);
    setPasswordInput('');
  }

  async function fetchImages() {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (!data.error) setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
      setAuthChecking(false);
    }
  }

  function compressImage(file, maxDim = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error(`"${file.name}" exceeds 10MB`));
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
            fr.onload = () => resolve({ name: file.name, preview: fr.result });
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

  async function handleFileSelect(e) {
    const selected = Array.from(e.target.files).slice(0, MAX_FILES);
    if (selected.length === 0) return;

    const oversized = selected.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      alert(`Some files exceed 10MB:\n${oversized.map(f => `- ${f.name}`).join('\n')}`);
      e.target.value = '';
      return;
    }

    const compressed = [];
    for (const file of selected) {
      try {
        const result = await compressImage(file);
        compressed.push({ id: `${Date.now()}-${compressed.length}`, ...result });
      } catch (err) {
        alert(err.message);
        e.target.value = '';
        return;
      }
    }

    setFiles(prev => [...prev, ...compressed].slice(0, MAX_FILES));
    e.target.value = '';
  }

  function removeFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });
      try {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            image: files[i].preview,
            title,
            description,
            category,
            featured
          })
        });
        if (!res.ok) {
          const data = await res.json();
          errors.push(`"${files[i].name}": ${data.error || t('galleryAdmin.uploadFailed')}`);
        }
      } catch (error) {
        errors.push(`"${files[i].name}": ${error.message}`);
      }
    }

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });

    if (errors.length > 0) {
      alert(`Upload completed with errors:\n${errors.join('\n')}`);
    }

    setFiles([]);
    fetchImages();
  }

  async function handleDelete(id) {
    if (!confirm(t('galleryAdmin.deleteConfirm'))) return;

    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchImages();
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error deleting:', error);
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
          <h1 className="title text-2xl text-center mb-2">{t('galleryAdmin.title')}</h1>
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
            {authError && (
              <p className="text-red-500 text-sm text-center">{authError}</p>
            )}
            <button type="submit" className="btn w-full">
              Authenticate
            </button>
          </form>
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-accent hover:underline">
              {t('galleryAdmin.backToHome')}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app">
      <div className="container py-12">
        <PageHeader />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="title text-4xl md:text-5xl">{t('galleryAdmin.title')}</h1>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/" className="btn btn-sm">
              {t('galleryAdmin.backToHome')}
            </Link>
            <Link href="/gallery" className="btn btn-sm btn-secondary">
              {t('galleryAdmin.viewGallery')}
            </Link>
            <button onClick={handleLogout} className="btn btn-sm !bg-red-500 hover:!bg-red-600">
              Logout
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-xl mx-auto mb-12"
        >
          <h2 className="text-xl font-semibold mb-6 text-accent dark:text-white">{t('galleryAdmin.addNew')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('galleryAdmin.selectImage')}</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={handleFileSelect}
                className="w-full p-3 border border-[var(--panel-border)] rounded-lg bg-white/50 dark:bg-white/5"
              />
              <p className="text-xs text-muted mt-1">{t('galleryAdmin.fileLimit')}</p>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {files.map((f) => (
                  <div key={f.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={f.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(f.id)}
                      disabled={uploading}
                      className="absolute top-1 right-1 bg-red-500/90 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                      {f.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">{t('galleryAdmin.titleField')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('galleryAdmin.titlePlaceholder')}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('galleryAdmin.descField')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('galleryAdmin.descPlaceholder')}
                className="textarea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('galleryAdmin.category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="design">{t('galleryAdmin.categoryDesign')}</option>
                <option value="aboutMe">{t('galleryAdmin.categoryAboutMe')}</option>
                <option value="skate">{t('galleryAdmin.categorySkate')}</option>
                <option value="drinks">{t('galleryAdmin.categoryDrinks')}</option>
                <option value="food">{t('galleryAdmin.categoryFood')}</option>
                <option value="others">{t('galleryAdmin.categoryOthers')}</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 rounded border-panel-border accent-[#FFE600]"
              />
              <span className="text-sm font-medium">{t('galleryAdmin.markFeatured')}</span>
            </label>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted">
                  <span>{t('galleryAdmin.uploadProgress', { current: uploadProgress.current, total: uploadProgress.total })}</span>
                  <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-panel-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    className="h-full bg-gradient-to-r from-[#FFE600] to-[#2D3277] rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? t('galleryAdmin.uploading')
                : files.length > 0
                  ? t('galleryAdmin.uploadAll', { count: files.length })
                  : t('galleryAdmin.upload')}
            </button>

            <p className="text-xs text-muted text-center mt-3">
              {t('galleryAdmin.rateLimit')}
            </p>
          </div>
        </motion.div>

        <div className="mb-8">
          <h2 className="title text-2xl">{t('galleryAdmin.existing')} ({images.length})</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="card p-3">
                <div className="aspect-square skeleton rounded-lg mb-3" />
                <div className="h-4 w-2/3 skeleton" />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-10 text-muted">{t('galleryAdmin.noImages')}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((img) => (
                <motion.div
                  key={img._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card p-3 cursor-pointer group relative"
                  onClick={() => setSelectedImage(img)}
                  layout
                >
                  {img.featured && (
                    <span className="absolute top-5 right-5 bg-[#FFE600] text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      ★ {t('galleryAdmin.featured')}
                    </span>
                  )}
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={img.url}
                      alt={img.title || 'Gallery image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {img.title && (
                      <h3 className="text-sm font-medium truncate text-accent dark:text-white flex-1">
                        {img.title}
                      </h3>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-muted bg-white/20 dark:bg-white/10 px-1.5 py-0.5 rounded">
                      {t('galleryAdmin.category' + img.category.charAt(0).toUpperCase() + img.category.slice(1))}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">{img.description}</p>
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
      />
    </div>
  );
}
