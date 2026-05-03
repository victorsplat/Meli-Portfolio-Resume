import React from 'react';
import { motion } from 'framer-motion';
import { IoDownloadOutline, IoNavigateOutline } from "react-icons/io5";

const About = () => {
  return (
    <section className="panel content-container" id="about">
      <motion.h2 
        className="subtitle"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        About
      </motion.h2>
      
      <div className="about-layout">
        <motion.div 
          className="about-card"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <p>
            I am a full-stack developer with a passion for building clean, user-friendly, and high-performance web applications. 
            Currently focusing on creating seamless digital experiences with modern technologies like React, Next.js, and Node.js.
          </p>
          <p style={{ marginTop: '1rem' }}>
            My approach combines technical precision with a creative edge, ensuring that every project not only works perfectly but also provides a delightful user experience.
          </p>
        </motion.div>

        <motion.div 
          className="about-actions"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <a href="/resume.pdf" className="button" download>
            Resume <IoDownloadOutline size={18} />
          </a>
          <a href="#projects" className="button secondary">
            Projects <IoNavigateOutline size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default About;