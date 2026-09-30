'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/layout/ThemeProvider';

interface Particle {
  x: number;
  y: number;
  radius: number;
  angle: number;
  dist: number;
  speed: number;
  length: number;
  opacity: number;
  color: string;
  type: 'cyclone' | 'breeze';
}

interface CycloneBackgroundProps {
  density?: number;
  speedMultiplier?: number;
  interactive?: boolean;
}

export const CycloneBackground: React.FC<CycloneBackgroundProps> = ({
  density = 65,
  speedMultiplier = 1.0,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const mouse = { x: width * 0.75, y: height * 0.5, active: false };
    const onMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    if (interactive && canvas.parentElement) {
      canvas.parentElement.addEventListener('mousemove', onMouseMove);
      canvas.parentElement.addEventListener('mouseleave', onMouseLeave);
    }

    let particles: Particle[] = [];

    const isDark = document.documentElement.classList.contains('dark') || theme === 'dark';

    const colorsDark = [
      'rgba(34, 211, 238, ',   // cyan-400
      'rgba(56, 189, 248, ',   // sky-400
      'rgba(14, 165, 233, ',   // sky-500
      'rgba(99, 102, 241, ',   // indigo-500
      'rgba(45, 212, 191, ',   // teal-400
    ];

    const colorsLight = [
      'rgba(14, 116, 144, ',   // cyan-700
      'rgba(2, 132, 199, ',    // sky-600
      'rgba(3, 105, 161, ',    // sky-700
      'rgba(79, 70, 229, ',    // indigo-600
    ];

    const colorPalette = isDark ? colorsDark : colorsLight;

    const initParticles = () => {
      particles = [];
      const count = Math.floor((width * height) / 14000) + density;
      const maxDist = Math.max(width, height) * 0.7;

      for (let i = 0; i < count; i++) {
        const isCyclone = Math.random() > 0.25;
        const dist = Math.random() * maxDist + 20;
        const angle = Math.random() * Math.PI * 2;
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        particles.push({
          x: isCyclone ? width * 0.75 + Math.cos(angle) * dist : Math.random() * width,
          y: isCyclone ? height * 0.45 + Math.sin(angle) * dist : Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          angle: angle,
          dist: dist,
          speed: (Math.random() * 0.015 + 0.005) * speedMultiplier,
          length: Math.random() * 24 + 10,
          opacity: Math.random() * 0.4 + 0.1,
          color: color,
          type: isCyclone ? 'cyclone' : 'breeze',
        });
      }
    };

    initParticles();

    let eyeX = width * 0.78;
    let eyeY = height * 0.45;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth eye position transition towards mouse if hovered
      if (mouse.active) {
        eyeX += (mouse.x - eyeX) * 0.02;
        eyeY += (mouse.y - eyeY) * 0.02;
      } else {
        const targetX = width * 0.75 + Math.sin(Date.now() * 0.0006) * 40;
        const targetY = height * 0.45 + Math.cos(Date.now() * 0.0006) * 30;
        eyeX += (targetX - eyeX) * 0.02;
        eyeY += (targetY - eyeY) * 0.02;
      }

      // Draw subtle eye glow
      const gradient = ctx.createRadialGradient(eyeX, eyeY, 10, eyeX, eyeY, 220);
      gradient.addColorStop(0, isDark ? 'rgba(34, 211, 238, 0.08)' : 'rgba(14, 165, 233, 0.05)');
      gradient.addColorStop(0.5, isDark ? 'rgba(6, 182, 212, 0.03)' : 'rgba(2, 132, 199, 0.02)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 220, 0, Math.PI * 2);
      ctx.fill();

      // Draw particles & streamlines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.type === 'cyclone') {
          // Cyclone vortex spiral physics (counter-clockwise Northern Hemisphere cyclonic flow)
          p.angle -= p.speed * (1 + 100 / (p.dist + 50));
          p.dist -= 0.15 * speedMultiplier;

          // Re-spawn on eye arrival or boundary
          if (p.dist < 15) {
            p.dist = Math.max(width, height) * 0.65 + Math.random() * 50;
            p.angle = Math.random() * Math.PI * 2;
          }

          // Compute logarithmic spiral positions
          const x = eyeX + Math.cos(p.angle) * p.dist;
          const y = eyeY + Math.sin(p.angle) * p.dist * 0.85; // Slightly elliptical

          // Tail for streamline effect
          const tailAngle = p.angle + (p.length / (p.dist + 40));
          const tailX = eyeX + Math.cos(tailAngle) * (p.dist + 4);
          const tailY = eyeY + Math.sin(tailAngle) * (p.dist + 4) * 0.85;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = `${p.color}${p.opacity * (isDark ? 0.85 : 0.6)})`;
          ctx.lineWidth = p.radius;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Particle head
          ctx.beginPath();
          ctx.arc(x, y, p.radius * 1.1, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity * (isDark ? 1.0 : 0.8)})`;
          ctx.fill();
        } else {
          // Ambient coastal wind breeze streamlines
          p.x -= (p.speed * 280) + 0.8;
          p.y += Math.sin(p.x * 0.008 + Date.now() * 0.001) * 0.6;

          if (p.x < -50) {
            p.x = width + 50;
            p.y = Math.random() * height;
          }

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length, p.y - 1.5);
          ctx.strokeStyle = `${p.color}${p.opacity * (isDark ? 0.6 : 0.4)})`;
          ctx.lineWidth = p.radius * 0.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive && canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', onMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, [theme, density, speedMultiplier, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-hidden"
    />
  );
};
