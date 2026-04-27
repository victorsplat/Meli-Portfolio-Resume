import React from 'react';
import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '@/style/animations';
import { 
  TbBrandReact,
  TbBrandVue,
  TbBrandVite,
  TbBrandMongodb,
  TbBrandAdobePhotoshop,
  TbBrandNotion,
  TbChartDots3
} from 'react-icons/tb';

import { 
  SiCanva,
  SiExpress 
} from 'react-icons/si';

const TechSection = () => {
  const techGroups = [
    {
      title: "Front-end",
      techs: [
        { name: "React", icon: <TbBrandReact /> }, 
        { name: "Vue", icon: <TbBrandVue /> },
        { name: "Vite", icon: <TbBrandVite /> },
        { name: "Recharts", icon: <TbChartDots3 /> },
      ]
    },
    {
      title: "Back-end",
      techs: [
        { name: "MongoDB", icon: <TbBrandMongodb /> },
        { name: "Express", icon: <SiExpress /> },
      ]
    },
    {
      title: "Complementary Tools",
      techs: [
        { name: "Photoshop", icon: <TbBrandAdobePhotoshop /> },
        { name: "Canva", icon: <SiCanva /> },
        { name: "Notion", icon: <TbBrandNotion /> },
      ]
    }
  ];

  return (
    <motion.section
      className="tech-section panel"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="section-title">Technologies & Stack</h2>
      {techGroups.map((group, idx) => (
        <div key={idx} className="tech-group-container">
          <h3 className="group-subtitle">{group.title}</h3>
          <div className="tech-grid">
            {group.techs.map((tech, i) => (
              <motion.div key={i} className="tech-card" variants={cardVariants}>
                <div className="tech-icon">{tech.icon}</div>
                <span className="tech-name">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.section>
  );
};

export default TechSection;