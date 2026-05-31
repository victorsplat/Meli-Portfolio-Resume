'use client';
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, animate, useInView } from "framer-motion";
import { IoPaperPlaneOutline, IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTheme } from '@/lib/useTheme';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MatrixRain from '@/components/ui/matrix';
import MeliLogoSvg from '@assets/svg/melilogo.svg';
import MeliLogoDarkSvg from '@assets/svg/melilogo_dark.svg';

const programmingComputerLottie = '/assets/svg/programmingComputer.lottie';

const MotionMeliLogo = motion.create(MeliLogoSvg);
const MotionMeliLogoDark = motion.create(MeliLogoDarkSvg);

interface HeroProps {
  isMobile?: boolean;
}

const Hero = ({ isMobile = false }: HeroProps) => {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, lang } = useI18n();

  useEffect(() => { setMounted(true); }, []);

  const baseText = t('hero.portfolioTitle');
  const count = useMotionValue(0);
  const displayText = useTransform(count, (latest) => baseText.slice(0, Math.round(latest)));

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  useEffect(() => {
    count.set(0);
    const controls = animate(count, baseText.length, {
      type: "tween",
      duration: 1.5,
      ease: "linear",
      delay: 0.5,
    });
    return controls.stop;
  }, [count, baseText, lang]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 30, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);
  const rotateX = useTransform(mouseYSpring, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-15, 15]);

  const shadowOpacity = useTransform(
    [rotateX, rotateY],
    ([rX, rY]) => {
      const tiltMagnitude = Math.sqrt((rX as number) ** 2 + (rY as number) ** 2);
      return 0.15 - (tiltMagnitude / 22) * 0.1;
    }
  );

  function handleMouse(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  return (
    <header
      className="relative overflow-hidden bg-[var(--bg-hero)] text-[var(--text-main)] p-10 px-12 max-md:p-8 max-md:px-4 text-left rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] [perspective:1000px] z-1 transition-[background,color] duration-300"
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[500px] h-80 bg-[#585FD9] rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-96 bg-[#585FD9] rounded-full blur-3xl" />
      </div>
      {mounted && theme === 'dark' && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <MatrixRain speed={0.4} density={1.5} />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg-hero)] to-transparent pointer-events-none z-10" />

      <div className="relative z-20">
        <div className="flex items-center justify-between min-h-[80px] mb-12 max-md:mb-6">
          <div className="flex h-[70px] w-auto max-md:h-[50px]">
            <MotionMeliLogo
              aria-label="Mercado Livre Logo"
              className="block dark:hidden h-full w-auto max-w-[260px] max-md:max-w-[180px] max-md:max-h-[50px] m-0 cursor-pointer flex items-center justify-center"
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
            <MotionMeliLogoDark
              aria-label="Mercado Livre Logo"
              className="hidden dark:block h-full w-auto max-w-[260px] max-md:max-w-[180px] max-md:max-h-[50px] m-0 cursor-pointer flex items-center justify-center"
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
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <motion.button
            className="bg-transparent border-none cursor-pointer text-inherit p-2 rounded-full flex transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={toggleTheme}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            aria-label={t('hero.toggleTheme')}
          >
            <IoMoonOutline size={22} className="block dark:hidden" />
            <IoSunnyOutline size={22} className="hidden dark:block" />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 flex-nowrap max-md:gap-4 max-md:justify-between">
        <div className="flex-[1.5] min-w-0 max-md:flex-[2]">
          <p className="font-harabara text-[2.2rem] max-md:text-xl max-md:max-w-[300px] opacity-90 font-semibold">
            {t('hero.greeting')}
          </p>
          <h1 className="font-saira text-[3.5rem] max-md:text-3xl max-md:mb-2 font-bold text-accent leading-tight whitespace-normal min-h-[1.2em]">
            <motion.span>{displayText}</motion.span>
            <span className="inline-block w-[3px] h-[1em] bg-accent ml-1 align-middle animate-blink" />
          </h1>
          <p className="font-quantico text-2xl max-md:text-base max-md:max-w-full max-md:mb-4 font-semibold max-w-[500px] text-text-main mt-2 mb-6">
            {t('hero.subtitleLine1')} <br/> {t('hero.subtitleLine2')}
          </p>
          <motion.a
            className="btn max-md:w-full max-md:max-w-[320px]"
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
            {t('hero.talkToMe')} <IoPaperPlaneOutline size={15} />
          </motion.a>
        </div>

        <div className="flex-1 w-full min-w-0 h-[400px] max-md:h-[180px] flex justify-center items-center overflow-visible relative [perspective:1000px]" ref={containerRef}>
          <motion.div
            className="w-full h-full flex justify-center items-center relative"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, x: isMobile ? 20 : 40, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: isMobile ? 1 : 1.5 }}
            whileHover={{ scale: isMobile ? 1 : 1.6 }}
            transition={{ duration: 1, ease: "easeOut", delay: 1 }}
          >
            <motion.div
              className="absolute w-[280px] h-[40px] bg-black blur-[25px] rounded-full bottom-[20%] left-1/2 -translate-x-1/2 pointer-events-none z-[-1] max-md:hidden"
              style={{ opacity: isMobile ? 0 : shadowOpacity }}
            />

            {isInView && (
              <DotLottieReact
                className="w-full h-full flex justify-center items-center [&_canvas]:w-full [&_canvas]:h-full [&_canvas]:object-contain [&_canvas]:pointer-events-none"
                src={programmingComputerLottie}
                speed={0.6}
                loop={isHovered ? true : 2 as unknown as boolean}
                autoplay
                renderConfig={{
                  autoResize: true,
                  devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
                }}
              />
            )}
          </motion.div>
        </div>
      </div>
      </div>
    </header>
  );
};

export default Hero;
