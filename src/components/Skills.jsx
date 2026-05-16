'use client';
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/lib/i18n';
import { MeshGradientBackground } from '@/components/ui/mesh-gradient';

function ChartTooltip({ active, payload, label }) {
  const { t } = useI18n();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-sm">
      <span>{label}</span>
      <span className="ml-2 font-semibold text-[#FFE600]">{t('skills.chartValue')}: {payload[0].value}</span>
    </div>
  );
}

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
    <section className="section container relative overflow-hidden rounded-2xl px-14 py-10 shadow-xl shadow-black/10 dark:shadow-black/30" id="skills" ref={ref}>
      <MeshGradientBackground
        className="absolute inset-0"
        colors={["#585FD9", "#2D3277", "#FFE600", "#2563eb"]}
        speed={0.5}
      />
      <div className="relative z-10 text-white">
        <h2 className="title text-white">{t('skills.title')}</h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 mb-16">
          <div className="bg-white/15 dark:bg-[var(--bg-hero)] p-6 rounded-[24px] border border-white/10 dark:border-panel-border backdrop-blur-md">
            <h3 className="mb-4">{t('skills.personal')}</h3>
            <div style={{ position: 'relative', width: '100%', height: '200px' }}>
              {mounted && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart layout="vertical" data={personalData}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: '#fff' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltip />} />
                    <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} isAnimationActive={isInView} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white/15 dark:bg-[var(--bg-hero)] p-6 rounded-[24px] border border-white/10 dark:border-panel-border backdrop-blur-md">
            <h3 className="mb-4">{t('skills.overallTech')}</h3>
            <div style={{ position: 'relative', width: '100%', height: '200px' }}>
              {mounted && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={techData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltip />} />
                    <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} isAnimationActive={isInView} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
