import { motion } from "framer-motion";
import { IoMail, IoLogoWhatsapp, IoLogoLinkedin } from "react-icons/io5";
import { containerVariants, cardVariants } from './animations';

const Contact = () => {
  return (
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
          <IoMail className="contact-button button-icon" size={20} alignmentBaseline="bottom" />
          Email
        </motion.a>
        
        <motion.a variants={cardVariants} className="contact-button button secondary" href="https://wa.me/5511963452860?text=Tenho%20interesse%20em%20te%20contratar!%20Podemos%20conversar?">
          <IoLogoWhatsapp className="contact-button button-icon" size={20} alignmentBaseline="bottom" />
          Whatsapp 
        </motion.a>
        
        <motion.a variants={cardVariants} className="contact-button button secondary" href="https://www.linkedin.com/in/victor-prado-603505161/">
          <IoLogoLinkedin className="contact-button button-icon" size={20} alignmentBaseline="bottom" />
          LinkedIn
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Contact;