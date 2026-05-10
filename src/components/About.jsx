import React from 'react';
import { motion } from 'framer-motion';
import { IoDownloadOutline, IoNavigateOutline } from "react-icons/io5";

const About = () => {
  return (
    <section className="section container" id="about">
      <motion.h2
        className="title"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        About
      </motion.h2>

      <div className="flex flex-wrap items-center justify-start gap-6 mb-10 max-md:flex-row max-md:items-end">
        <motion.div
          className="card-glass"
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
          className="flex gap-3 flex-wrap justify-start items-center max-md:flex-col max-md:items-center max-md:w-full"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <a href="/resume.pdf" className="btn btn-secondary max-md:w-full max-md:max-w-[320px]" download>
            Resume <IoDownloadOutline size={18} />
          </a>
          <a href="#projects" className="btn btn-secondary max-md:w-full max-md:max-w-[320px]">
            Projects <IoNavigateOutline size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
