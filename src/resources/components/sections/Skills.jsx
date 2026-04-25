import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const personalData = [
  { name: 'Thirst for Knowledge', value: 95 },
  { name: 'Commitment', value: 80 },
  { name: 'Collaborativeness', value: 88 },
];

const techData = [
  { name: 'Back-end', value: 80 },
  { name: 'Front-end', value: 95 },
  { name: 'DevOps', value: 75 },
];

const otherData = [
  { name: 'UI/UX Design', value: 75 },
  { name: 'Video Editing', value: 95 },
  { name: 'Marketing', value: 85 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        padding: '8px 12px', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        fontSize: '12px',
        color: '#4a5568'
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{`${label}`}</p>
        <p style={{ margin: 0, color: '#2D3277' }}>{`Proficiency: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.3, once: true });

  return (
    <section className="panel" ref={ref} id="skills">
      <h2>Skills</h2>
      <div className="grid">
        <div className="card">
          <h3>Personal Skills</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                key={`personal-${isInView}`}
                layout="vertical"
                data={personalData}
                margin={{ top: 5, right: 0, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradPersonal" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2D3277" />
                    <stop offset="100%" stopColor="#4D5297">
                      <animate attributeName="stop-opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
                    </stop>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12, fill: '#4a5568' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar 
                  dataKey="value" 
                  fill="url(#gradPersonal)" 
                  radius={[0, 4, 4, 0]} 
                  isAnimationActive={isInView}
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Tech Skills</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                key={`tech-${isInView}`}
                data={techData} 
                margin={{ top: 20, right: 30, left: 30, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradTech" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#3D4287" />
                    <stop offset="100%" stopColor="#2D3277" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4a5568' }} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar 
                  dataKey="value" 
                  fill="url(#gradTech)" 
                  radius={[4, 4, 0, 0]} 
                  isAnimationActive={isInView}
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Other Skills</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                key={`other-${isInView}`}
                data={otherData} 
                margin={{ top: 20, right: 30, left: 30, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradOther" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#4D5297" />
                    <stop offset="100%" stopColor="#3D4287" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#2e343c' }} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="url(#gradOther)" radius={[4, 4, 0, 0]} isAnimationActive={isInView} animationDuration={2000} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Skills;