import { useState, useEffect } from "react";
import { useScroll, useTransform, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import Skills from '../Skills.jsx';
import DotPattern from '../../style/DotPattern.jsx';
import Hero from '../../style/Hero.jsx';
import About from '../../style/About.jsx';
import Projects from '../../style/Projects.jsx';
import Contact from '../../style/Contact.jsx';
import BackToTop from '../../style/BackToTop.jsx';
import { cardVariants } from '../../style/animations';

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
    if (latest > 400) setShowScrollButton(true);
    else setShowScrollButton(false);
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
            <Skills />
            <Projects cardVariants={cardVariants} />
            <Contact />
          </div>
        </main>
      </div>

      <BackToTop visible={showScrollButton} />
    </div>
  );
}
export default Home;
