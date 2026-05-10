'use client';

import { motion } from 'framer-motion';
import { FaShippingFast, FaBox, FaTruck } from 'react-icons/fa';
import { useI18n } from '@/lib/i18n';

export default function MeliFeaturesSection() {
  const { t } = useI18n();

  return (
    <div className="container py-16">
      <div className="grid md:grid-cols-3 gap-8 md:-mt-10 relative z-10">
        {[FaShippingFast, FaBox, FaTruck].map((Icon, idx) => {
          const feature = t('meliCase.features')[idx] || { title: '', desc: '' };
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="card text-center p-8"
            >
              <Icon className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted">{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
