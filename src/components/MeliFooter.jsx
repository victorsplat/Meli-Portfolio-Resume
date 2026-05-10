'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function MeliFooter() {
  const { t } = useI18n();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-8 text-center text-muted border-t border-[var(--panel-border)]"
    >
      <div className="container">
        <p className="text-sm">{t('meliCase.footer')}</p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/" className="text-accent hover:underline">{t('meliCase.home')}</Link>
          <Link href="/gallery" className="text-accent hover:underline">{t('meliCase.gallery')}</Link>
          <Link href="/galleryAdmin" className="text-accent hover:underline">{t('meliCase.admin')}</Link>
        </div>
      </div>
    </motion.footer>
  );
}
