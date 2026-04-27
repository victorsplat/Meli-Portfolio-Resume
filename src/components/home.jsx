'use client';

import { useState, useEffect } from "react";
import { useScroll, useTransform, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import About from '@/components/About';
import TechSection from '@/components/TechSection';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import DotPattern from '@/components/DotPattern';
import Hero from '@/components/Hero';
import BackToTop from '@/components/BackToTop';

function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [isAboutHovered, setIsAboutHovered] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Monitor scroll for Back to Top button
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const isPastThreshold = latest > 400;
    if (isPastThreshold !== showScrollButton) {
      setShowScrollButton(isPastThreshold);
    }
  });

  // Background Parallax Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth the mouse movement
  const springConfig = { stiffness: 100, damping: 30 };
  const smoothedX = useSpring(mouseX, springConfig);
  const smoothedY = useSpring(mouseY, springConfig);

  function handleMouseMove(event) {
    const { clientX, clientY } = event;
    mouseX.set(clientX - window.innerWidth / 2);
    mouseY.set(clientY - window.innerHeight / 2);
  }

  // Scroll Fade Logic
  const { scrollYProgress } = useScroll();
  const patternOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 0]);
  const patternY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="app-shell" onMouseMove={handleMouseMove}>
      <Hero isMobile={isMobile} />

      <div className="main-wrapper">
        <DotPattern 
          style={{ opacity: patternOpacity, y: patternY }} 
          isHovered={isAboutHovered} 
          mouseX={smoothedX}
          mouseY={smoothedY}
        />
        
        <main style={{ position: 'relative', zIndex: 1 }}>
          <div className="content-container">
            <About onHover={setIsAboutHovered} />
            <TechSection />
            <Skills />
            <Projects />
            <Contact />
          </div>
        </main>
      </div>

      <BackToTop visible={showScrollButton} />
    </div>
  );
}
export default Home;
