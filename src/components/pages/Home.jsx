'use client';

import { useState, useEffect } from "react";
import { useScroll, useTransform, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import About from '@/components/About';
import TechSection from '@/components/TechSection';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import DotPattern from '@/style/DotPattern';
import Hero from '@/components/Hero';
import BackToTop from '@/style/BackToTop';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';

function Home() {
  const { t } = useI18n();
  usePageTitle('siteTitle');
  const [isMobile, setIsMobile] = useState(false);
  const [isAboutHovered, setIsAboutHovered] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const isPastThreshold = latest > 400;
    if (isPastThreshold !== showScrollButton) {
      setShowScrollButton(isPastThreshold);
    }
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 30 };
  const smoothedX = useSpring(mouseX, springConfig);
  const smoothedY = useSpring(mouseY, springConfig);

  function handleMouseMove(event) {
    const { clientX, clientY } = event;
    mouseX.set(clientX - window.innerWidth / 2);
    mouseY.set(clientY - window.innerHeight / 2);
  }

  const { scrollYProgress } = useScroll();
  const patternOpacity = useTransform(scrollYProgress, [0, 0.55], [0.8, 0]);
  const patternY = useTransform(scrollYProgress, [0, 0.55], [0, -40]);

  return (
    <div className="font-quantico leading-normal text-text-main max-w-full overflow-x-hidden mx-auto bg-bg-app text-lg" onMouseMove={handleMouseMove}>
      <Hero isMobile={isMobile} />

      <div className="relative bg-bg-app overflow-hidden">
        <DotPattern
          style={{ opacity: patternOpacity, y: patternY }}
          isHovered={isAboutHovered}
          mouseX={smoothedX}
          mouseY={smoothedY}
        />

        <main style={{ position: 'relative', zIndex: 1 }}>
          <div className="container">
            <About onHover={setIsAboutHovered} />
            <TechSection />
            <div className="h-16" />
            <Skills />
            <div className="h-16" />
            <Projects />
            <div className="h-16" />
            <Contact />
          </div>

          <footer className="py-8 text-center text-muted text-sm">
            <p>{t('homeFooter')}</p>
          </footer>
        </main>
      </div>

      <BackToTop visible={showScrollButton} />
    </div>
  );
}
export default Home;
