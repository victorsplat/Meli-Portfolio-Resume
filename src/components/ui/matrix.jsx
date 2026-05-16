"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function MatrixRain({ className, speed = 1, density = 1, ...props }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let drops = [];
    let columns;

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);

      columns = Math.floor(canvas.offsetWidth / (14 * density));
      drops = Array(columns).fill(1);
    }

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      ctx.font = `${12 * density}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 14 * density;
        const y = drops[i] * 14 * density;

        ctx.fillStyle = y < 100 ? "rgba(180, 255, 180, 0.9)" : "rgba(0, 255, 65, 0.4)";
        ctx.fillText(char, x, y);

        if (y > canvas.offsetHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speed * 0.5;
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [speed, density]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full", className)}
      {...props}
    />
  );
}
