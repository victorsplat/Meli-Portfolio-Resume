'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import MeliLogoSvg from '@assets/svg/melilogo.svg';
import { FaArrowRight, FaClock, FaUserTie, FaMapMarkerAlt } from 'react-icons/fa';
import { useI18n } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';

export default function MeliHeroSection() {
  const { t } = useI18n();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -100]);

  return (
    <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative bg-bg-hero text-text-main pb-20 md:pb-32">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#FFE600] rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-20 w-96 h-96 bg-[#FFE600] rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-bg-app to-transparent pointer-events-none" />

      <div className="relative pt-20 md:pt-32 container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <PageHeader />
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-[#FFE600] text-[#333] px-4 py-1 rounded-full text-sm font-bold">
              {t('meliCase.badge')}
            </div>
            <MeliLogoSvg className="h-8 w-auto" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6">
            {t('meliCase.title')}
            <span className="block text-[#FFE600] dark:text-[#FFE600]">{t('meliCase.subtitle')}</span>
          </h1>

          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            {t('meliCase.description')}
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {[
              { icon: FaClock, label: t('meliCase.role') },
              { icon: FaUserTie, label: t('meliCase.fulltime') },
              { icon: FaMapMarkerAlt, label: t('meliCase.location') }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted">
                <item.icon className="text-accent" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Link href="#application-form" className="btn btn-secondary">
            {t('meliCase.applyNow')} <FaArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
