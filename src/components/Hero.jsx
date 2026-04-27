'use client';
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, animate, useInView } from "framer-motion";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import Image from 'next/image';
import mlLogoimg from '@assets/PNG/melilogo.png';

const MotionImage = motion(Image);

const Hero = ({ isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const baseText = "Victor Prado Portfolio.";
  const count = useMotionValue(0);
  const displayText = useTransform(count, (latest) => baseText.slice(0, Math.round(latest)));

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

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
      <MotionImage 
        src={mlLogoimg} 
        alt="Mercado Livre Logo" 
        className="hero-logo"
        priority
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.2, y: -5 }}
        transition={{ 
          y: { type: "spring", stiffness: 300 },
          opacity: { duration: 1, delay: 0.8 },
          scale: { type: "spring", stiffness: 400, damping: 10 }
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
      <div className="hero-container">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="eyebrow">Hi, I&apos;m back in code!</p>
          <h1>
            <motion.span>{displayText}</motion.span>
            <span className="typewriter-cursor" />
          </h1>
          <p className="hero-copy">
            Crafting digital experiences <br/> with a creative edge.
          </p>
          <motion.a 
            className="button" 
            href="#contact" 
            animate={!isHovered ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 4px 15px rgba(45, 50, 119, 0.2)", 
                "0 4px 25px rgba(45, 50, 119, 0.6)", 
                "0 4px 15px rgba(45, 50, 119, 0.2)"
              ] 
            } : { scale: 1, boxShadow: "0 4px 10px rgba(45, 50, 119, 0.1)" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Talk to me <IoPaperPlaneOutline size={15} />
          </motion.a>
        </motion.div>

        <motion.div 
          className="hero-animation"
          ref={containerRef}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ opacity: 0, x: isMobile ? 20 : 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: isMobile ? 1 : 1.3 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1 }}>
          {isInView && (
            <DotLottieReact 
          className="portfolioAnim" 
          src="@assets/SVG/ProgrammingComputer.lottie" 
          speed={0.6}
          loop={isHovered ? true : 2}
          autoplay
          renderConfig={{ autoResize: true, // Automatically adjusts canvas size when the container resizes
                          devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
                        }} 
              />
          )}
        </motion.div>
      </div>
    </header>
  );
};
export default Hero;