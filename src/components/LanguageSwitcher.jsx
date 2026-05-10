'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 rounded-full p-1">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
            lang === l.code
              ? 'bg-accent dark:bg-[#FFE600] text-white dark:text-[#333] shadow-sm'
              : 'text-text-main opacity-60 hover:opacity-100'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}