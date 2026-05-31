'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';

interface GalleryItem {
  _id?: string;
  common?: string;
  binomial?: string;
  photo: {
    url: string;
    text?: string;
    pos?: string;
    by?: string;
  };
  [key: string]: unknown;
}

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  anglePerItem: number;
  rotation: number;
  radius: number;
  visibleRange: number;
  maxBlur: number;
  glowIntensity: number;
  total: number;
  failedImages: Set<string>;
  onImageError: (url: string) => void;
  onCardClick?: (item: GalleryItem) => void;
}

const GalleryCard = memo(function GalleryCard({
  item, index, anglePerItem, rotation, radius, visibleRange, maxBlur, glowIntensity,
  total, failedImages, onImageError, onCardClick,
}: GalleryCardProps) {
  const count = total;
  const itemAngle = index * anglePerItem;
  const totalRotation = rotation % 360;
  const relativeAngle = ((itemAngle + totalRotation) % 360 + 360) % 360;
  const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);

  const angleThreshold = anglePerItem * (visibleRange + 0.5);
  const t = Math.min(1, normalizedAngle / angleThreshold);

  const isVisible = t <= 1;
  const opacity = isVisible ? 1 - Math.pow(t, 1.5) : 0;
  const blur = maxBlur !== 0 && isVisible ? t * t * maxBlur : maxBlur;
  const scale = isVisible ? 1 - t * 0.35 : 0.5;

  const isCenter = normalizedAngle < anglePerItem * 0.3;
  const boxShadow = isCenter
    ? `0 0 30px color-mix(in srgb, var(--accent) ${glowIntensity * 60}%, transparent), 0 0 60px color-mix(in srgb, var(--accent) ${glowIntensity * 20}%, transparent)`
    : 'none';

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`Image ${index + 1} of ${count}`}
      aria-hidden={!isVisible || opacity <= 0.1}
      tabIndex={isVisible && opacity > 0.1 ? 0 : -1}
      onClick={() => onCardClick?.(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick?.(item); } }}
      className="absolute cursor-pointer"
      style={{
        transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale})`,
        width: 200,
        height: 280,
        left: '50%',
        top: '50%',
        marginLeft: -100,
        marginTop: -140,
        opacity: opacity,
        filter: blur > 0.5 ? `blur(${blur}px)` : 'none',
        boxShadow: boxShadow,
        transition: 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1), filter 0.8s ease, box-shadow 0.6s ease',
        pointerEvents: isVisible && opacity > 0.1 ? 'auto' : 'none',
        willChange: isCenter ? 'transform' : 'auto',
      }}
    >
      <div className="relative w-full h-full rounded-xl shadow-2xl overflow-hidden border border-border/50 bg-card/70 dark:bg-card/30 backdrop-blur-lg">
        <div className="absolute inset-0 bg-zinc-800/20 animate-pulse rounded-xl" />
        <img
          src={failedImages.has(item.photo.url) ? '/fallback-image.svg' : item.photo.url}
          alt={item.photo.text || ''}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: item.photo.pos || 'center' }}
          loading="lazy"
          onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
          onError={() => onImageError?.(item.photo.url)}
        />
        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h3 className="text-sm font-semibold leading-tight">{item.common}</h3>
          <em className="text-[10px] italic opacity-80">{item.binomial}</em>
        </div>
      </div>
    </div>
  );
});

interface CircularGalleryProps {
  items: GalleryItem[];
  className?: string;
  radius?: number;
  autoRotateSpeed?: number;
  visibleRange?: number;
  maxBlur?: number;
  glowIntensity?: number;
  onImageClick?: (item: GalleryItem) => void;
}

export default function CircularGallery({
  items,
  className,
  radius = 500,
  autoRotateSpeed = 0.01,
  visibleRange = 2,
  maxBlur = 6,
  glowIntensity = 0.25,
  onImageClick,
}: CircularGalleryProps) {
  const [rotation, setRotation] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isIdle, setIsIdle] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const wheelAccumRef = useRef(0);
  const resizeTickRef = useRef<number | null>(null);
  const isIdleRef = useRef(true);
  const isAutoRotatingRef = useRef(false);
  const autoRotateSpeedRef = useRef(autoRotateSpeed);
  const isVisibleRef = useRef(true);

  isIdleRef.current = isIdle;
  isAutoRotatingRef.current = isAutoRotating;
  autoRotateSpeedRef.current = autoRotateSpeed;

  const handleImageError = useCallback((url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  }, []);

  const step = useCallback((dir: number) => {
    setIsIdle(false);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    const angle = (360 / items.length) * dir;
    setRotation(prev => prev - angle);
    idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 2000);
  }, [items.length]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    wheelAccumRef.current += e.deltaY;
    if (Math.abs(wheelAccumRef.current) >= 80) {
      step(wheelAccumRef.current > 0 ? 1 : -1);
      wheelAccumRef.current = 0;
    }
  }, [step]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStartXRef.current === null) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) >= 60) {
      step(deltaX < 0 ? 1 : -1);
      touchStartXRef.current = e.touches[0].clientX;
    }
  }, [step]);

  const handleTouchEnd = useCallback(() => {
    touchStartXRef.current = null;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  }, [step]);

  const handleCardClick = useCallback((item: GalleryItem) => {
    onImageClick?.(item);
  }, [onImageClick]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('keydown', handleKeyDown);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleKeyDown]);

  useEffect(() => {
    let lastAutoStep = 0;

    function tick() {
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isIdleRef.current && isAutoRotatingRef.current) {
        lastAutoStep += autoRotateSpeedRef.current;
        if (lastAutoStep >= 1) {
          const angle = (360 / items.length);
          setRotation(prev => prev - angle);
          lastAutoStep = 0;
        }
      } else {
        lastAutoStep = 0;
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    animationFrameRef.current = requestAnimationFrame(tick);

    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0.1 });
    if (containerRef.current) observer.observe(containerRef.current);

    function onVisibilityChange() {
      if (document.hidden) {
        isVisibleRef.current = false;
      } else {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          isVisibleRef.current = (
            rect.top < window.innerHeight &&
            rect.bottom > 0
          );
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [items.length]);

  useEffect(() => {
    function handleResize() {
      if (resizeTickRef.current) cancelAnimationFrame(resizeTickRef.current);
      resizeTickRef.current = requestAnimationFrame(() => {
        setRotation(prev => prev + 0.0001);
      });
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTickRef.current) cancelAnimationFrame(resizeTickRef.current);
    };
  }, []);

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted">
        <p>No items to display</p>
      </div>
    );
  }

  const count = items.length;
  const anglePerItem = 360 / count;

  return (
    <div
      ref={containerRef}
      id="circular-gallery-container"
      role="region"
      aria-roledescription="carousel"
      aria-label="Image gallery carousel"
      tabIndex={0}
      className={cn("relative w-full h-full flex items-center justify-center overflow-visible touch-none focus:outline-none", className)}
      style={{ perspective: '1800px' }}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 60%)',
        }}
      />

      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg)`,
          transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {items.map((item, i) => (
          <GalleryCard
            key={(item._id || item.photo?.url || i) as string}
            item={item}
            index={i}
            anglePerItem={anglePerItem}
            rotation={rotation}
            radius={radius}
            visibleRange={visibleRange}
            maxBlur={maxBlur}
            glowIntensity={glowIntensity}
            total={count}
            failedImages={failedImages}
            onImageError={handleImageError}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,0.03) 0%, transparent 100%)',
        }}
      />

      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        <button
          onClick={() => setIsAutoRotating(prev => !prev)}
          className="w-10 h-10 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label={isAutoRotating ? 'Stop auto-rotation' : 'Start auto-rotation'}
          aria-pressed={isAutoRotating}
        >
          {isAutoRotating ? '⏹' : '🔄'}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex gap-2 pointer-events-auto">
        <button
          onClick={() => step(-1)}
          className="w-10 h-10 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          onClick={() => step(1)}
          className="w-10 h-10 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Next image"
        >
          ›
        </button>
      </div>
    </div>
  );
}
