'use client';
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, animate, useInView } from "framer-motion";
import { IoPaperPlaneOutline, IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import Image from 'next/image';
import MeliLogoSvg from '@assets/svg/melilogo.svg';

const programmingComputerLottie = '/assets/svg/programmingComputer.lottie';

const MotionImage = motion.create(Image);
const MotionMeliLogo = motion.create(MeliLogoSvg);

const Hero = ({ isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

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

  // Calculate shadow opacity based on tilt magnitude (distance from center)
  const shadowOpacity = useTransform(
    [rotateX, rotateY],
    ([rX, rY]) => {
      const tiltMagnitude = Math.sqrt(rX ** 2 + rY ** 2);
      return 0.15 - (tiltMagnitude / 22) * 0.1; // Dims from 0.15 down to 0.05
    }
  );

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  return (
    <header className="hero" onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <div className="hero-top-bar">
        <div className="logo-container">
          <MotionMeliLogo
            aria-label="Mercado Livre Logo"
            className="hero-logo"
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
        </div>
        <motion.button 
          className="theme-toggle" 
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <IoMoonOutline size={22} /> : <IoSunnyOutline size={22} />}
        </motion.button>
      </div>
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

        <div className="hero-animation" ref={containerRef}>
          <motion.div 
            className="tilted-wrapper"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, x: isMobile ? 20 : 40, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: isMobile ? 1 : 1.5 }}
            whileHover={{ scale: isMobile ? 1 : 1.6 }} // Higher than animate scale to prevent shrinking
            transition={{ duration: 1, ease: "easeOut", delay: 1 }}>
            
            <motion.div 
              className="hero-shadow" 
              style={{ opacity: isMobile ? 0 : shadowOpacity }} 
            />
            
            {isInView && (
              <DotLottieReact 
                className="portfolioAnim" 
                src={programmingComputerLottie}
                speed={0.6}
                loop={isHovered ? true : 2}
                autoplay
                renderConfig={{ 
                  autoResize: true, // Now safe because parent footprint is stable
                  devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
                }} 
              />
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
};
export default Hero;