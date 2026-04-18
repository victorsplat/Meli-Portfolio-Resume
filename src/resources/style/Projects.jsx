import { motion } from "framer-motion";

export const projects = [
  { title: 'Portfolio Website', description: 'Clean, responsive portfolio.', link: '#' },
  { title: 'Mercado Livre IT Case', description: 'Design ideas for the team.', link: '#' },
  { title: 'Learning Dashboard', description: 'Tasks and progress tracking.', link: '#' },
];

const Projects = ({ cardVariants }) => (
  <section id="projects" className="panel">
    <h2>Projects</h2>
    <div className="grid">
      {projects.map((project) => (
        <motion.article 
          key={project.title} 
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