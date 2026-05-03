'use client';
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const personalData = [
  { name: 'Thirst for Knowledge', value: 95 },
  { name: 'Commitment', value: 80 },
  { name: 'Collaborativeness', value: 88 }
];

const techData = [
  { name: 'Back-end', value: 80 },
  { name: 'Front-end', value: 95 },
  { name: 'DevOps', value: 75 }
];

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.1, once: true });

  return (
    <section className="panel content-container" id="skills" ref={ref}>
      <h2 className="subtitle">Skills & Proficiency</h2>
      
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="card" style={{ background: 'var(--bg-hero)', padding: '1.5rem', borderRadius: 'var(--card-radius)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Personal Skills</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={personalData}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: 'var(--text-main)' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} isAnimationActive={isInView} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--bg-hero)', padding: '1.5rem', borderRadius: 'var(--card-radius)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Overall Tech</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--panel-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-main)' }} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} isAnimationActive={isInView} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;