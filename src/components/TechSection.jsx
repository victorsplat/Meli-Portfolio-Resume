import React, { useState } from 'react';
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
  const [flippedIndex, setFlippedIndex] = useState(null);

  const handleFlip = (index) => {
    setFlippedIndex(flippedIndex === index ? null : index);
  };

  return (
    <motion.section
      className="section container"
      id="tech-stack"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <h2 className="title">Technologies & Stack</h2>

      {stackData.map((group, idx) => (
        <div key={idx} className="mb-12">
          <h3 className="text-lg font-bold uppercase tracking-widest text-accent mb-6 opacity-80">{group.category}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-6 max-md:grid-cols-3 max-md:gap-4 max-sm:grid-cols-2">
            {group.items.map((item, i) => (
              <motion.div
                key={i}
                className="[perspective:1000px] h-[150px] w-full"
                variants={cardVariants}
              >
                <motion.div
                  className="relative w-full h-full [transform-style:preserve-3d] rounded-[24px]"
                  animate={{
                    rotateY: flippedIndex === i ? 180 : 0,
                    boxShadow: flippedIndex === i ? `0 0 25px ${item.color}44` : 'none',
                  }}
                  onClick={() => handleFlip(i)}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                >
                  <div className="absolute inset-0 backface-hidden rounded-[24px] flex flex-col items-center justify-center gap-4 bg-[var(--bg-hero)] border border-panel-border backdrop-blur-md">
                    <div className="text-4xl flex items-center justify-center [filter:drop-shadow(0_0_8px_rgba(0,0,0,0.1))]" style={{ color: item.color }}>
                      {item.icon}
                    </div>
                    <span className="font-quantico text-sm font-semibold text-text-main">{item.name}</span>
                  </div>

                  <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] p-4 text-center border-2 rounded-[24px] flex flex-col items-center justify-center gap-4 bg-[var(--bg-hero)] backdrop-blur-md" style={{ borderColor: item.color }}>
                    <p className="text-xs leading-tight text-text-main">{item.description}</p>
                    <span className="text-[0.7rem] font-extrabold opacity-50 mt-auto">{item.name}</span>
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
