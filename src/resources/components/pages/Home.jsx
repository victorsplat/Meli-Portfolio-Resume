import { useState, useEffect } from "react";
import Skills from '../Skills.jsx';

import { motion, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import { IoPaperPlaneOutline, IoMail, IoLogoWhatsapp, IoLogoLinkedin } from "react-icons/io5";
import { FloatingWhatsApp } from 'react-floating-whatsapp';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import portfolioAnim from '../../SVG/Portfolio anim.lottie';


export const projects = [
  {
    title: 'Portfolio Website',
    description: 'Clean, responsive portfolio with sections for work, experience and contact.',
    link: '#',
  },
  {
    title: 'Mercado Livre IT Case',
    description: 'Design ideas and a modern layout for a Latin America marketplace team.',
    link: '#',
  },
  {
    title: 'Learning Dashboard',
    description: 'A developer dashboard with tasks, notes and progress tracking.',
    link: '#',
  },
]

function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Typewriter Effect Logic
  const baseText = "Victor Prado Portfolio";
  const count = useMotionValue(0);
  const displayText = useTransform(count, (latest) => baseText.slice(0, Math.round(latest)));

  useEffect(() => {
    const controls = animate(count, baseText.length, {
      type: "tween",
      duration: 1.5,
      ease: "linear",
      delay: 0.5, // Starts slightly after the SVG begins its slide
    });
    return controls.stop;
  }, [count]);

  // Motion values for mouse tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Add spring physics for smooth tracking
  const springConfig = { stiffness: 150, damping: 30, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-15, 15]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  // Stagger variants for project cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <div className="app-shell">
      <header className="hero" onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }}>
        <div className="hero-container">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <p className="eyebrow">Hi, I&apos;m back in code.</p>
            <h1>
              <motion.span>{displayText}</motion.span>
              <span className="typewriter-cursor" />
            </h1>
            <p className="hero-copy">
              I build clean, modern interfaces and developer-focused portfolio experiences.
              Let&apos;s create an app with strong design and practical use for the team. 
              Wishing new experiences, i&apos;m excited to share my work with you.
            </p>
            <motion.a 
              className="button" 
              href="#contact"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Talk to me&nbsp;<IoPaperPlaneOutline className="button-icon first" size={20} alignmentBaseline="bottom" opacity={20} />
            </motion.a>
          </motion.div>
          <motion.div 
            className="hero-animation"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, x: isMobile ? 0 : 120, y: isMobile ? 40 : 0, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1.3 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <DotLottieReact className="portifolioAnim" src={portfolioAnim}  loop autoplay />
          </motion.div>
        </div>
      </header>

      <main>
        <section id="about" className="panel">
          <h2>About</h2>
          <p>
            A self-taught young professional committed to personal and collective growth.
            Returning to the field of web development
            I&apos;m focusing on practical web projects with React, Vite, and accessible UI patterns. This portfolio can
            be adapted to highlight your experience, projects, and contributions.
          </p>
        </section>

        {/* Added the Skills section here */}
        <Skills />

        <section id="projects" className="panel">
          <h2>Projects</h2>
          <motion.div 
            className="grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {projects.map((project) => (
              <motion.article 
                key={project.title} 
                className="card" 
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <a href={project.link}>Explore</a>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section id="contact" className="panel contact-panel">
          <h2 className="section-header">Contact</h2>
          <h4>Ready to discuss the portfolio and next steps for Mercado Livre IT?</h4>
          <p>You can catch me up at Email, Whatsapp or Linkedin </p>
          <motion.div 
            className="contact-button div"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
          <motion.a variants={cardVariants} className="contact-button button secondary" href="mailto:victorprado123@gmail.com">
           <IoMail className="contact-button button-icon" size={20} alignmentBaseline="bottom" opacity={20} />
                        Email
          </motion.a>
          <motion.a variants={cardVariants} className="contact-button button secondary" href="https://wa.me/5511963452860?text=Tenho%20interesse%20em%20te%20contratar!%20Podemos%20conversar?">
           <IoLogoWhatsapp className="contact-button button-icon" size={20} alignmentBaseline="bottom" opacity={20} />
                        Whatsapp 
          </motion.a>
           <motion.a variants={cardVariants} className="contact-button button secondary" href="https://www.linkedin.com/in/victor-prado-603505161/">
           <IoLogoLinkedin className="contact-button button-icon" size={20} alignmentBaseline="bottom" opacity={20} />
                        LinkedIn
          </motion.a>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
export default Home;
