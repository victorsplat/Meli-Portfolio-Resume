import React from 'react';
import { motion } from "framer-motion";
import { IoMail, IoLogoWhatsapp, IoLogoLinkedin } from "react-icons/io5";
import { containerVariants, cardVariants } from '@/style/animations';

const Contact = () => {
  return (
    <section id="contact" className="section-clear container text-center">
      <h2 className="title">Contact</h2>
      <motion.div
        className="mb-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h4 className="text-xl font-semibold">Ready to discuss the portfolio and next steps for Mercado Livre IT?</h4>
        <p className="text-xl text-muted">You can catch me up at Email, Whatsapp or Linkedin </p>
      </motion.div>
      <motion.div
        className="center-content"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.a variants={cardVariants} className="btn btn-secondary max-md:w-full max-md:max-w-[320px]" href="mailto:victorprado123@gmail.com">
          <IoMail className="btn-icon" size={20} alignmentBaseline="bottom" />
          Email
        </motion.a>

        <motion.a variants={cardVariants} className="btn btn-secondary max-md:w-full max-md:max-w-[320px]" href="https://wa.me/5511963452860?text=Tenho%20interesse%20em%20te%20contratar!%20Podemos%20conversar?">
          <IoLogoWhatsapp className="btn-icon" size={20} alignmentBaseline="bottom" />
          Whatsapp
        </motion.a>

        <motion.a variants={cardVariants} className="btn btn-secondary max-md:w-full max-md:max-w-[320px]" href="https://www.linkedin.com/in/victor-prado-603505161/">
          <IoLogoLinkedin className="btn-icon" size={20} alignmentBaseline="bottom" />
          LinkedIn
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Contact;
