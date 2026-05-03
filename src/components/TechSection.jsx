import React from 'react';
import { motion } from 'framer-motion';
import { 
  TbBrandReact,
  TbBrandNextjs,
  TbBrandTypescript,
  TbBrandTailwind,
  TbBrandNodejs,
  TbBrandMongodb,
  TbBrandFigma,
  TbBrandDocker,
  TbBrandGit,
  TbBrandVue,
  TbBrandHtml5,
  TbBrandCss3,
  TbBrandGithub,
  TbBrandVscode,
  TbBrandNpm,
  TbBrandAdobePhotoshop,
  TbChartBar,
  TbApi,
  TbHierarchy
} from 'react-icons/tb';
import { 
  SiExpress, 
  SiJavascript,
  SiRecharts,
  SiPostgresql,
  SiPostman,
  SiVercel
} from 'react-icons/si';

const stackData = [
  {
    category: "Front-end",
    items: [
      { name: "React", icon: <TbBrandReact />, color: "#61DAFB", description: "UI Component library." },
      { name: "Next.js", icon: <TbBrandNextjs />, color: "#000000", description: "React Framework." },
      { name: "Vue.js", icon: <TbBrandVue />, color: "#4FC08D", description: "Progressive Framework." },
      { name: "Re-Charts", icon: <TbChartBar />, color: "#22B5BF", description: "Composable Chart library." },
      { name: "TypeScript", icon: <TbBrandTypescript />, color: "#3178C6", description: "Typed JavaScript." },
      { name: "Tailwind CSS", icon: <TbBrandTailwind />, color: "#06B6D4", description: "Modern Utility-first CSS." },
      { name: "HTML5", icon: <TbBrandHtml5 />, color: "#E34F26", description: "Web structure markup." },
      { name: "CSS3", icon: <TbBrandCss3 />, color: "#1572B6", description: "Advanced web styling." },
      { name: "JavaScript", icon: <SiJavascript />, color: "#F7DF1E", description: "Web programming." },
    ]
  },
  {
    category: "Back-end",
    items: [
      { name: "Node.js", icon: <TbBrandNodejs />, color: "#339933", description: "Server runtime." },
      { name: "Express", icon: <SiExpress />, color: "#000000", description: "Node framework." },
      { name: "Microservices", icon: <TbHierarchy />, color: "#666666", description: "Distributed architecture." },
      { name: "PostgreSQL", icon: <SiPostgresql />, color: "#4169E1", description: "Relational database." },
      { name: "MongoDB", icon: <TbBrandMongodb />, color: "#47A248", description: "NoSQL database." },
      { name: "REST APIs", icon: <TbApi />, color: "#009688", description: "API design & development." },
    ]
  },
  {
    category: "Databases & Tools",
    items: [
      { name: "Git", icon: <TbBrandGit />, color: "#F05032", description: "Version control system." },
      { name: "GitHub", icon: <TbBrandGithub />, color: "#181717", description: "Code collaboration platform." },
      { name: "VS Code", icon: <TbBrandVscode />, color: "#007ACC", description: "Modern code editor." },
      { name: "Docker", icon: <TbBrandDocker />, color: "#2496ED", description: "Containerization tool." },
      { name: "Figma", icon: <TbBrandFigma />, color: "#F24E1E", description: "Interface design tool." },
      { name: "Postman", icon: <SiPostman />, color: "#FF6C37", description: "API testing platform." },
      { name: "npm/yarn", icon: <TbBrandNpm />, color: "#CB3837", description: "Package management." },
      { name: "Photoshop", icon: <TbBrandAdobePhotoshop />, color: "#31A8FF", description: "Image editing." },
      { name: "Vercel", icon: <SiVercel />, color: "#000000", description: "Cloud deployment." },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const TechSection = () => {
  return (
    <motion.section 
      className="panel content-container" 
      id="tech-stack"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      style={{ background: 'none', border: 'none', boxShadow: 'none' }}
      viewport={{ once: true, amount: 0.1 }}
    >
      <h2 className="subtitle">Technologies & Stack</h2>
      
      {stackData.map((group, idx) => (
        <div key={idx} className="stack-group">
          <h3 className="stack-category-title">{group.category}</h3>
          <div className="stack-grid">
            {group.items.map((item, i) => (
              <motion.div 
                key={i} 
                className="stack-card flip-card"
                variants={cardVariants}
              >
                <motion.div 
                  className="flip-card-inner"
                  whileHover={{ 
                    rotateY: 180,
                    boxShadow: `0 0 25px ${item.color}44`,
                  }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  style={{ borderRadius: 'var(--card-radius)' }}
                >
                  {/* Front Face */}
                  <div className="card-face card-front" style={{ borderRadius: 'var(--card-radius)' }}>
                    <div className="stack-icon" style={{ color: item.color }}>
                      {item.icon}
                    </div>
                    <span className="stack-name">{item.name}</span>
                  </div>

                  {/* Back Face */}
                  <div className="card-face card-back" style={{ borderColor: item.color, borderRadius: 'var(--card-radius)' }}>
                    <p className="stack-description">{item.description}</p>
                    <span className="stack-name-small">{item.name}</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.section>
  );
};

export default TechSection;