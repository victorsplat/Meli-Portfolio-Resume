import React from 'react';
import { motion } from "framer-motion";
import { cardVariants } from '@/style/animations';

export const projects = [
  { title: 'Portfolio Website', description: 'Clean, responsive portfolio.', link: '#' },
  { title: 'Mercado Livre IT Case', description: 'Design ideas for the team.', link: '#' },
  { title: 'My Gallery', description: 'A creative space showcasing my visual work and photography.', link: '#', id: 'gallery' },
];

const Projects = () => (
  <section id="projects" className="panel content-container">
    <h2 className="subtitle">Projects</h2>
    <div className="grid">
      {projects.map((project) => (
        <motion.article 
          key={project.title} 
          id={project.id}
          className="card" 
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{ scale: 1.03, y: -5 }}
        >
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <a href={project.link}>Explore</a>
        </motion.article>
      ))}
    </div>
  </section>
);
export default Projects;