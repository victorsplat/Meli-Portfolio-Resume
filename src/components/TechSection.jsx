import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import {
  TbBrandReact,
  TbBrandNextjs,
  TbBrandTailwind,
  TbBrandNodejs,
  TbBrandMongodb,
  TbBrandFigma,
  TbBrandDocker,
  TbBrandGit,
  TbBrandHtml5,
  TbBrandCss3,
  TbBrandGithub,
  TbBrandVscode,
  TbBrandNpm,
  TbBrandAdobePhotoshop,
  TbBrandFramer,
  TbComponents,
  TbChartBar,
  TbApi,
  TbCamera,
  TbVideoPlus,
  TbCloudUpload,
  TbPhoto,
  TbPlayerPlay,
  TbColorSwatch,
  TbMovie
} from 'react-icons/tb';
import {
  SiJavascript,
  SiPostman,
  SiVercel,
  SiAxios,
  SiCanva
} from 'react-icons/si';

const stackData = [
  {
    category: "Front-end",
    items: [
      { name: "React", icon: <TbBrandReact />, color: "#61DAFB", description: "UI Component library." },
      { name: "Next.js", icon: <TbBrandNextjs />, color: "var(--text-main)", description: "React Framework." },
      { name: "Tailwind CSS", icon: <TbBrandTailwind />, color: "#06B6D4", description: "Modern Utility-first CSS." },
      { name: "shadcn/ui", icon: <TbComponents />, color: "var(--text-main)", description: "Reusable UI components." },
      { name: "Framer Motion", icon: <TbBrandFramer />, color: "#0055FF", description: "Animation library." },
      { name: "Lottie", icon: <TbPlayerPlay />, color: "#00D4AA", description: "Vector animation player." },
      { name: "Re-Charts", icon: <TbChartBar />, color: "#22B5BF", description: "Composable Chart library." },
      { name: "HTML5", icon: <TbBrandHtml5 />, color: "#E34F26", description: "Web structure markup." },
      { name: "CSS3", icon: <TbBrandCss3 />, color: "#1572B6", description: "Advanced web styling." },
      { name: "JavaScript", icon: <SiJavascript />, color: "#F7DF1E", description: "Web programming." },
    ]
  },
  {
    category: "Back-end",
    items: [
      { name: "Node.js", icon: <TbBrandNodejs />, color: "#339933", description: "Server runtime." },
      { name: "Axios", icon: <SiAxios />, color: "#5A29E4", description: "HTTP client." },
      { name: "MongoDB", icon: <TbBrandMongodb />, color: "#47A248", description: "NoSQL database." },
      { name: "Vercel Blob", icon: <TbCloudUpload />, color: "var(--text-main)", description: "Cloud image storage." },
      { name: "Sharp", icon: <TbPhoto />, color: "#99CC00", description: "Image processing." },
      { name: "REST APIs", icon: <TbApi />, color: "#009688", description: "API design & development." },
    ]
  },
  {
    category: "Databases & Tools",
    items: [
      { name: "Git", icon: <TbBrandGit />, color: "#F05032", description: "Version control system." },
      { name: "GitHub", icon: <TbBrandGithub />, color: "var(--text-main)", description: "Code collaboration platform." },
      { name: "VS Code", icon: <TbBrandVscode />, color: "#007ACC", description: "Modern code editor." },
      { name: "Docker", icon: <TbBrandDocker />, color: "#2496ED", description: "Containerization tool." },
      { name: "Postman", icon: <SiPostman />, color: "#FF6C37", description: "API testing platform." },
      { name: "npm/yarn", icon: <TbBrandNpm />, color: "#CB3837", description: "Package management." },
      { name: "Vercel", icon: <SiVercel />, color: "var(--text-main)", description: "Cloud deployment." },
    ]
  },
  {
    category: "Creative & Design",
    items: [
      { name: "Lightroom", icon: <TbColorSwatch />, color: "#7DF1FF", description: "Photo color grading & RAW processing." },
      { name: "Photoshop", icon: <TbBrandAdobePhotoshop />, color: "#31A8FF", description: "Image editing & retouching." },
      { name: "Canva", icon: <SiCanva />, color: "#00C4CC", description: "Quick graphic design." },
      { name: "DaVinci Resolve", icon: <TbMovie />, color: "var(--text-main)", description: "Color grading & video editing." },
      { name: "Figma", icon: <TbBrandFigma />, color: "#F24E1E", description: "UI/UX design & prototyping." },
      { name: "Photography", icon: <TbCamera />, color: "#E4405F", description: "Portrait, product & event photography." },
      { name: "Video Editing", icon: <TbVideoPlus />, color: "#FF6C37", description: "Reels, social media & event videos." },
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
  const { t } = useI18n();
  const [flippedIndex, setFlippedIndex] = useState(null);

  const handleFlip = (key) => {
    setFlippedIndex(flippedIndex === key ? null : key);
  };

  const renderItem = (item, i, groupPrefix) => {
    const flipKey = groupPrefix + '-' + i;
    const isVarColor = item.color.startsWith('var(');
    const shadowColor = isVarColor
      ? 'color-mix(in srgb, var(--text-main) 27%, transparent)'
      : `${item.color}44`;
    return (
      <motion.div
        key={flipKey}
        className="[perspective:1000px] h-[150px] w-full"
        variants={cardVariants}
      >
        <motion.div
          className="relative w-full h-full [transform-style:preserve-3d] rounded-[24px]"
          animate={{
            rotateY: flippedIndex === flipKey ? 180 : 0,
            boxShadow: flippedIndex === flipKey ? `0 0 25px ${shadowColor}` : 'none',
          }}
          onClick={() => handleFlip(flipKey)}
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
            <p className="text-xs leading-tight text-text-main">{t('tech.items.' + item.name)}</p>
            <span className="text-[0.7rem] font-extrabold opacity-50 mt-auto">{item.name}</span>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const fullWidthGroups = stackData.slice(0, 2);
  const splitGroups = stackData.slice(2);

  return (
    <motion.section
      className="section container"
      id="tech-stack"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <h2 className="title">{t('tech.title')}</h2>

      {fullWidthGroups.map((group, idx) => {
        const categoryKey = group.category === 'Front-end' ? 'frontend' : 'backend';
        return (
        <div key={idx} className="mb-12">
          <h3 className="text-lg font-bold uppercase tracking-widest text-accent mb-6 opacity-80">{t('tech.' + categoryKey)}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-6 max-md:grid-cols-3 max-md:gap-4 max-sm:grid-cols-2">
            {group.items.map((item, i) => renderItem(item, i, 'full-' + idx))}
          </div>
        </div>
        );
      })}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {splitGroups.map((group, idx) => {
          const categoryKey = group.category === 'Creative & Design' ? 'creative' : 'tools';
          return (
          <div key={idx}>
            <h3 className="text-lg font-bold uppercase tracking-widest text-accent mb-6 opacity-80">{t('tech.' + categoryKey)}</h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
              {group.items.map((item, i) => renderItem(item, i, 'split-' + idx))}
            </div>
          </div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default TechSection;
