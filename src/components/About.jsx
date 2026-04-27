import React from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from "framer-motion";

const About = ({ onHover }) => (
  <section 
    id="about" 
    className="panel"
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
  >
  <motion.div 
              className="About-text"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
    >
    <h2 className='subtitle'>About</h2>
    <div className="about-layout">
      <p>
        As a self-taught professional, I thrive on solving complex problems and growing alongside my team. I specialize in building practical, accessible web projects with React and Vite. Beyond the terminal, my expertise in photography and video editing helps me translate creative visions into seamless digital realities.
      </p>
      <div className="about-actions">
        <a href="#projects" className="button">See Projects</a>
        <a href="#gallery" className="button secondary">See Gallery</a>
      </div>
     </div>
    </motion.div>
  </section>
);
export default About;