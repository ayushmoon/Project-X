import React, { useRef, useEffect } from 'react';

interface HeartParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  decay: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export const FloatingHearts: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: HeartParticle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color definitions
    const colors = [
      'rgba(244, 63, 94, ', // brand-pink-500
      'rgba(251, 113, 133, ', // brand-pink-400
      'rgba(253, 164, 181, ', // brand-pink-300
      'rgba(216, 180, 254, ', // brand-lavender-300
      'rgba(233, 213, 255, ', // brand-lavender-200
    ];

    const createHeartParticle = (x: number, y: number, isBurst = false): HeartParticle => {
      const size = isBurst ? Math.random() * 8 + 6 : Math.random() * 12 + 8;
      const speedY = isBurst ? (Math.random() * -3 - 1) : (Math.random() * -1 - 0.5);
      const speedX = isBurst ? (Math.random() * 4 - 2) : (Math.random() * 0.6 - 0.3);
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        x,
        y,
        size,
        speedY,
        speedX,
        alpha: 1,
        decay: isBurst ? Math.random() * 0.02 + 0.015 : Math.random() * 0.005 + 0.003,
        color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.02 - 0.01,
      };
    };

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, color: string, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      
      // Heart path
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // Top left curve
      ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, topCurveHeight, 0, size);
      // Top right curve
      ctx.bezierCurveTo(size, topCurveHeight, size / 2, -topCurveHeight, 0, topCurveHeight);
      
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowColor = 'rgba(244, 63, 94, 0.15)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    };

    // Auto-spawning background hearts
    const spawnTimer = setInterval(() => {
      if (particles.length < 20 && Math.random() < 0.25) {
        particles.push(createHeartParticle(Math.random() * canvas.width, canvas.height + 20, false));
      }
    }, 250);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        // Draw particle
        drawHeart(ctx, p.x, p.y, p.size, p.alpha, p.color, p.rotation);

        // Remove dead particles
        if (p.alpha <= 0 || p.y < -30 || p.x < -30 || p.x > canvas.width + 30) {
          particles.splice(idx, 1);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnTimer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] select-none opacity-40 dark:opacity-20"
    />
  );
};
