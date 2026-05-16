'use client';

import React from 'react';
import { motion } from "framer-motion";
import { cardVariants } from '@/style/animations';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

const Projects = () => {
  const { t } = useI18n();

  const projects = [
    { title: t('projects.portfolio'), description: t('projects.portfolioDesc'), link: '#' },
    { title: t('projects.meli'), description: t('projects.meliDesc'), link: '/meli-it-case' },
    { title: t('projects.gallery'), description: t('projects.galleryDesc'), link: '/gallery', id: 'gallery' },
  ];

  return (
    <section id="projects" className="section container">
      <h2 className="title">{t('projects.title')}</h2>
      <div className="grid-cards">
        {projects.map((project) => (
          <motion.article
            key={project.title}
            id={project.id}
            className="card card-hover"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <h3 className="text-xl mb-6 text-center text-[var(--text-main)] dark:text-white">{project.title}</h3>
            <p className="text-gray-500 dark:text-gray-400">{project.description}</p>
            <Link href={project.link} className="btn btn-sm mt-4">
              {t('projects.explore')}
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
export default Projects;
