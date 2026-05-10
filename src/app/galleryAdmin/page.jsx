'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import PageHeader from '@/components/PageHeader';
import GalleryLightbox from '@/components/GalleryLightbox';

export default function GalleryAdmin() {
  const { t } = useI18n();
  usePageTitle('galleryAdmin.title');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (!data.error) setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload() {
    if (!preview) return;

    setUploading(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: preview,
          title,
          description
        })
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchImages();
      } else {
        alert(t('galleryAdmin.uploadFailed'));
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
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchImages();
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
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
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full p-3 border border-[var(--panel-border)] rounded-lg bg-white/50 dark:bg-white/5"
              />
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
          </div>
        </motion.div>

        <div className="mb-8">
          <h2 className="title text-2xl">{t('galleryAdmin.existing')} ({images.length})</h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted">{t('galleryAdmin.loading')}</div>
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