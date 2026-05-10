'use client';
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/lib/i18n';

const Skills = () => {
  const { t } = useI18n();

  const personalData = [
    { name: t('skills.knowledge'), value: 95 },
    { name: t('skills.commitment'), value: 80 },
    { name: t('skills.collaborative'), value: 88 }
  ];

  const techData = [
    { name: t('skills.backend'), value: 80 },
    { name: t('skills.frontend'), value: 95 },
    { name: t('skills.devops'), value: 75 }
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.1, once: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="section container" id="skills" ref={ref}>
      <h2 className="title">{t('skills.title')}</h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 mb-16">
        <div className="bg-[var(--bg-hero)] p-6 rounded-[24px]">
          <h3 className="mb-4">{t('skills.personal')}</h3>
          <div style={{ height: '200px', minWidth: 0 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={personalData}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: 'var(--text-main)' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} isAnimationActive={isInView} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-hero)] p-6 rounded-[24px]">
          <h3 className="mb-4">{t('skills.overallTech')}</h3>
          <div style={{ height: '200px', minWidth: 0 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={techData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--panel-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-main)' }} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} isAnimationActive={isInView} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;