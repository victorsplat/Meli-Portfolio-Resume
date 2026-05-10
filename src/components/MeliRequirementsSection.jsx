'use client';

import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { useI18n } from '@/lib/i18n';

export default function MeliRequirementsSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 bg-bg-hero">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="title text-3xl text-center mb-12">{t('meliCase.reqTitle')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t('meliCase.requirements').map((req, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-4 card"
              >
                <FaCheckCircle className="text-accent flex-shrink-0" />
                <span>{req}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
