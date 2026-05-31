'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

export function usePageTitle(key: string): void {
  const { t } = useI18n();
  useEffect(() => {
    document.title = t(key) + ' - Meli Portfolio';
  }, [t(key)]);
}
