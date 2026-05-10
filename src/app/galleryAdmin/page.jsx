'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import PageHeader from '@/components/PageHeader';
import GalleryLightbox from '@/components/GalleryLightbox';

const AUTH_KEY = 'gallery_admin_token';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null);
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
            fr.onload = () => resolve(fr.result);
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
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image too large (max 10MB)');
      e.target.value = '';
      return;
    }
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
    } catch {
      alert('Failed to process image');
      e.target.value = '';
    }
  }

  async function handleUpload() {
    if (!preview) return;

    setUploading(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ image: preview, title, description })
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchImages();
      } else {
        const data = await res.json();
        alert(data.error || t('galleryAdmin.uploadFailed'));
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert(t('galleryAdmin.uploadError'));
    } finally {
      setUploading(false);
    }
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
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={handleFileSelect}
                className="w-full p-3 border border-[var(--panel-border)] rounded-lg bg-white/50 dark:bg-white/5"
              />
              <p className="text-xs text-muted mt-1">Max 10MB. Accepted: JPEG, PNG, WebP, GIF, AVIF</p>
            </div>

            {preview && (
              <div className="relative aspect-square max-w-xs mx-auto rounded-lg overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
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

            <button
              onClick={handleUpload}
              disabled={!preview || uploading}
              className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? t('galleryAdmin.uploading') : t('galleryAdmin.upload')}
            </button>
            <p className="text-xs text-muted text-center mt-3">
              Rate limit: 20 uploads/deletions per minute per IP
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
                  className="card p-3 cursor-pointer group"
                  onClick={() => setSelectedImage(img)}
                  layout
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={img.url}
                      alt={img.title || 'Gallery image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {img.title && (
                    <h3 className="text-sm font-medium truncate text-accent dark:text-white">
                      {img.title}
                    </h3>
                  )}
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
