'use client';

/**
 * @fileOverview A lightweight, self-contained confetti animation engine.
 * Uses the Canvas API directly to avoid external dependencies and ESM module conflicts.
 */

type ConfettiParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
};

type ConfettiOptions = {
  particleCount?: number;
  spread?: number;
  colors?: string[];
  origin?: { x?: number; y?: number };
  duration?: number;
  scalar?: number;
};

const DEFAULT_COLORS = [
  '#2E7D5A', // SpendXP gold
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#EC4899', // pink
  '#8B5CF6', // purple
  '#10b981', // emerald
];

export function fireConfetti(options: ConfettiOptions = {}): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const {
    particleCount = 80,
    colors = DEFAULT_COLORS,
    origin = { x: 0.5, y: 0.6 },
    duration = 3000,
    scalar = 1,
  } = options;

  const isMobile = window.innerWidth < 768;
  const count = isMobile ? Math.floor(particleCount * 0.6) : particleCount;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  handleResize();
  window.addEventListener('resize', handleResize, { passive: true });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    window.removeEventListener('resize', handleResize);
    document.body.removeChild(canvas);
    return;
  }

  const originX = (origin.x ?? 0.5) * canvas.width;
  const originY = (origin.y ?? 0.6) * canvas.height;

  const particles: ConfettiParticle[] = Array.from({ length: count }, () => {
    const angle = (Math.random() * 360 - 180) * (Math.PI / 180);
    const speed = (Math.random() * 6 + 3) * scalar;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 4 + 2),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: (Math.random() * 8 + 4) * scalar,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
  });

  const gravity = 0.15;
  const friction = 0.99;
  const startTime = Date.now();

  function draw() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      window.removeEventListener('resize', handleResize);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      return;
    }

    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    let stillVisible = false;

    particles.forEach((p) => {
      p.vy += gravity;
      p.vx *= friction;
      p.vy *= friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      const fadeStart = duration * 0.7;
      if (elapsed > fadeStart) {
        p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (duration * 0.3));
      }

      if (p.opacity > 0 && p.y < canvas.height + 20) {
        stillVisible = true;
      }

      if (p.opacity <= 0) return;

      ctx!.save();
      ctx!.globalAlpha = p.opacity;
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx!.beginPath();
        ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }

      ctx!.restore();
    });

    if (!stillVisible && elapsed > duration * 0.5) {
      window.removeEventListener('resize', handleResize);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      return;
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

export function fireConfettiPersonalBest(): void {
  fireConfetti({
    particleCount: 100,
    colors: ['#1A1F2E', '#2E7D5A', '#10b981'],
    origin: { x: 0.5, y: 0.7 },
  });
}

export function fireConfettiBadgeUnlock(): void {
  fireConfetti({
    particleCount: 60,
    colors: ['#8B5CF6', '#EC4899', '#f59e0b'],
    origin: { x: 0.2, y: 0.8 },
  });
  setTimeout(() => {
    fireConfetti({
      particleCount: 60,
      colors: ['#8B5CF6', '#EC4899', '#f59e0b'],
      origin: { x: 0.8, y: 0.8 },
    });
  }, 150);
}

export function fireConfettiGoalReached(): void {
  fireConfetti({
    particleCount: 120,
    colors: ['#1A1F2E', '#2E7D5A', '#f59e0b', '#10b981'],
    origin: { x: 0.5, y: 0.5 },
    scalar: 1.2,
  });
}

export function fireConfettiQuestComplete(): void {
  fireConfetti({
    particleCount: 80,
    colors: ['#534AB7', '#7F77DD', '#CECBF6'],
    origin: { x: 0.5, y: 0.6 },
  });
}
