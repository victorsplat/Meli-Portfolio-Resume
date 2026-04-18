import { useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import portfolioAnim from '../SVG/Portfolio anim.lottie';
import mlLogo from '../media/PNG/Logotipo_MercadoLivre.png';

const Hero = ({ isMobile }) => {
  const baseText = "Victor Prado Portfolio";
  const count = useMotionValue(0);
  const displayText = useTransform(count, (latest) => baseText.slice(0, Math.round(latest)));

  useEffect(() => {
    const controls = animate(count, baseText.length, {
      type: "tween",
      duration: 1.5,
      ease: "linear",
      delay: 0.5,
    });
    return controls.stop;
  }, [count]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
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

  return (
    <header className="hero" onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <div className="hero-container">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.img 
            src={mlLogo} 
            alt="Mercado Livre Logo" 
            className="hero-logo"
            initial={{ opacity: 0, y: -30 }}
            animate={{ 
              opacity: 1, 
              y: [0, -10, 0] 
            }}
            transition={{ 
              opacity: { duration: 1, delay: 0.8 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          <p className="eyebrow">Hi, I&apos;m back in code.</p>
          <h1>
            <motion.span>{displayText}</motion.span>
            <span className="typewriter-cursor" />
          </h1>
          <p className="hero-copy">
            I build clean, modern interfaces and developer-focused portfolio experiences.
          </p>
          <motion.a 
            className="button" 
            href="#contact" 
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 4px 15px rgba(52, 131, 250, 0.2)", 
                "0 4px 25px rgba(52, 131, 250, 0.6)", 
                "0 4px 15px rgba(52, 131, 250, 0.2)"
              ] 
            }} 
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Talk to me&nbsp;<IoPaperPlaneOutline size={20} />
          </motion.a>
        </motion.div>
        <motion.div 
          className="hero-animation"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, x: isMobile ? 0 : 120, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1.3 }}
        >
          <DotLottieReact className="portifolioAnim" src={portfolioAnim} loop autoplay />
        </motion.div>
      </div>
    </header>
  );
};
export default Hero;