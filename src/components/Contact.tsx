'use client';

import React from 'react';
import { motion } from "framer-motion";
import { IoMail, IoLogoWhatsapp, IoLogoLinkedin } from "react-icons/io5";
import { containerVariants, cardVariants } from '@/style/animations';
import { useI18n } from '@/lib/i18n';

const Contact = () => {
  const { t } = useI18n();

  return (
    <section id="contact" className="section-clear container text-center">
      <h2 className="title">{t('contact.title')}</h2>
      <motion.div
        className="mb-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h4 className="text-xl font-semibold">{t('contact.heading')}</h4>
        <p className="text-xl text-muted">{t('contact.subtitle')}</p>
      </motion.div>
      <motion.div
        className="center-content"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.a variants={cardVariants} className="btn btn-secondary max-md:w-full max-md:max-w-[320px]" href="mailto:victorprado123@gmail.com">
          <IoMail className="btn-icon" size={20} />
          {t('contact.email')}
        </motion.a>

        <motion.a variants={cardVariants} className="btn btn-secondary max-md:w-full max-md:max-w-[320px]" href="https://wa.me/5511963452860?text=Tenho%20interesse%20em%20te%20contratar!%20Podemos%20conversar?">
          <IoLogoWhatsapp className="btn-icon" size={20} />
          {t('contact.whatsapp')}
        </motion.a>

        <motion.a variants={cardVariants} className="btn btn-secondary max-md:w-full max-md:max-w-[320px]" href="https://www.linkedin.com/in/victor-prado-603505161/">
          <IoLogoLinkedin className="btn-icon" size={20} />
          {t('contact.linkedin')}
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Contact;
