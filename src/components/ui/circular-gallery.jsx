'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export default function CircularGallery({
  items,
  className,
  radius = 500,
  autoRotateSpeed = 0.01,
  visibleRange = 2,
  maxBlur = 12,
  glowIntensity = 0.25,
}) {
  const [rotation, setRotation] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIdle, setIsIdle] = useState(true);
  const idleTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const touchStartXRef = useRef(null);
  const wheelAccumRef = useRef(0);
  const anglePerItemRef = useRef(0);

  const step = useCallback((dir) => {
    setIsIdle(false);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    const angle = anglePerItemRef.current * dir;
    setRotation(prev => prev - angle);
    setCurrentIndex(prev => prev + dir);
    idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 2000);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    wheelAccumRef.current += e.deltaY;
    if (Math.abs(wheelAccumRef.current) >= 80) {
      step(wheelAccumRef.current > 0 ? 1 : -1);
      wheelAccumRef.current = 0;
    }
  }, [step]);

  const handleTouchStart = useCallback((e) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
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

  useEffect(() => {
    const el = document.getElementById('circular-gallery-container');
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    let lastAutoStep = 0;
    function autoRotate() {
      if (isIdle) {
        lastAutoStep += autoRotateSpeed;
        if (lastAutoStep >= 1) {
          const angle = anglePerItemRef.current;
          setRotation(prev => prev - angle);
          setCurrentIndex(prev => prev + 1);
          lastAutoStep = 0;
        }
      } else {
        lastAutoStep = 0;
      }
      animationFrameRef.current = requestAnimationFrame(autoRotate);
    }
    animationFrameRef.current = requestAnimationFrame(autoRotate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isIdle, autoRotateSpeed]);

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted">
        <p>No items to display</p>
      </div>
    );
  }

  const count = items.length;
  const anglePerItem = 360 / count;
  anglePerItemRef.current = anglePerItem;

  const angleThreshold = anglePerItem * (visibleRange + 0.5);

  const cardW = 200;
  const cardH = 280;

  return (
    <div
      id="circular-gallery-container"
      role="region"
      aria-label="Circular 3D Gallery"
      className={cn("relative w-full h-full flex items-center justify-center overflow-hidden touch-none", className)}
      style={{ perspective: '1200px' }}
    >
      {/* Ambient glow behind center item */}
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
        {items.map((item, i) => {
          const itemAngle = i * anglePerItem;
          const totalRotation = rotation % 360;
          const relativeAngle = ((itemAngle + totalRotation) % 360 + 360) % 360;
          const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);

          const t = Math.min(1, normalizedAngle / angleThreshold);

          const isVisible = t <= 1;
          const opacity = isVisible ? 1 - Math.pow(t, 1.5) : 0;
          const blur = isVisible ? t * t * maxBlur : maxBlur;
          const scale = isVisible ? 1 - t * 0.35 : 0.5;

          const isCenter = normalizedAngle < anglePerItem * 0.3;
          const boxShadow = isCenter
            ? `0 0 30px color-mix(in srgb, var(--accent) ${glowIntensity * 60}%, transparent), 0 0 60px color-mix(in srgb, var(--accent) ${glowIntensity * 20}%, transparent)`
            : 'none';

          return (
            <div
              key={item._id || item.photo?.url || i}
              role="group"
              aria-label={item.common}
              className="absolute"
              style={{
                transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale})`,
                width: cardW,
                height: cardH,
                left: '50%',
                top: '50%',
                marginLeft: -(cardW / 2),
                marginTop: -(cardH / 2),
                opacity: opacity,
                filter: blur > 0.5 ? `blur(${blur}px)` : 'none',
                boxShadow: boxShadow,
                transition: 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1), filter 0.8s ease, box-shadow 0.6s ease',
                pointerEvents: isVisible && opacity > 0.1 ? 'auto' : 'none',
              }}
            >
              <div className="relative w-full h-full rounded-xl shadow-2xl overflow-hidden border border-border/50 bg-card/70 dark:bg-card/30 backdrop-blur-lg">
                <img
                  src={item.photo.url}
                  alt={item.photo.text || ''}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: item.photo.pos || 'center' }}
                />
                <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-sm font-semibold leading-tight">{item.common}</h3>
                  <em className="text-[10px] italic opacity-80">{item.binomial}</em>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vignette overlay for cinematic feel */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* Subtle floor reflection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,0.03) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
