'use client';

import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';
import { useTheme } from '@/lib/useTheme';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function PageHeader() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-end gap-2 mb-6">
      <LanguageSwitcher />
      <button
        onClick={toggleTheme}
        className="bg-transparent border-none cursor-pointer text-text-main p-2 rounded-full flex transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10"
        aria-label={t('hero.toggleTheme')}
      >
        {theme === 'light' ? <IoMoonOutline size={22} /> : <IoSunnyOutline size={22} />}
      </button>
    </div>
  );
}
