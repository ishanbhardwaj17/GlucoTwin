import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40, rotate: -2, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 200, damping: 26 }
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 200, damping: 26 }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -3 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 22 }
  }
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 25 }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STAGGER CONTAINER
// ─────────────────────────────────────────────────────────────────────────────

export function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren: delay }
        }
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FADE UP
// ─────────────────────────────────────────────────────────────────────────────

export function FadeUp({
  children,
  delay = 0,
  className,
  distance = 30,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FADE IN
// ─────────────────────────────────────────────────────────────────────────────

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE IN LEFT / RIGHT
// ─────────────────────────────────────────────────────────────────────────────

export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  className,
}: {
  children: ReactNode;
  direction?: 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const x = direction === 'left' ? -60 : 60;
  return (
    <motion.div
      initial={{ opacity: 0, x, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT REVEAL – per word
// ─────────────────────────────────────────────────────────────────────────────

export function TextReveal({
  children,
  className,
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const words = children.split(' ');
  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em' }}>
      {words.map((word, i) => (
        <div key={i} style={{ overflow: 'hidden' }}>
          <motion.span
            initial={{ y: '110%', rotate: 6, opacity: 0 }}
            whileInView={{ y: 0, rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.9,
              delay: delay + i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: 'inline-block' }}
          >
            {word}
          </motion.span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAR REVEAL – per character (for short hero strings)
// ─────────────────────────────────────────────────────────────────────────────

export function CharReveal({
  children,
  className,
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const chars = children.split('');
  return (
    <span className={className} style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
      {chars.map((char, i) => (
        <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
          <motion.span
            initial={{ y: '120%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.03,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: 'inline-block' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED LINE
// ─────────────────────────────────────────────────────────────────────────────

export function AnimatedLine({
  className,
  delay = 0,
  color = 'rgba(0,0,0,0.15)',
}: {
  className?: string;
  delay?: number;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ originX: 0, backgroundColor: color }}
      className={className}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE
// ─────────────────────────────────────────────────────────────────────────────

export function Marquee({
  children,
  className,
  speed = 20,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
}) {
  return (
    <div className={`overflow-hidden whitespace-nowrap flex ${className}`}>
      {[0, 1].map((k) => (
        <motion.div
          key={k}
          className="flex min-w-full shrink-0 items-center justify-around gap-8"
          animate={{ x: reverse ? ['0%', '100%'] : ['0%', '-100%'] }}
          transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
          aria-hidden={k === 1}
        >
          {children}
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNT UP
// ─────────────────────────────────────────────────────────────────────────────

export function CountUp({
  to,
  duration = 1.8,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    let raf: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(parseFloat((to * ease).toFixed(decimals)));
      if (progress < 1) raf = requestAnimationFrame(animate);
      else setCount(to);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, inView, decimals]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count}{suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARALLAX WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

export function ParallaxLayer({
  children,
  className,
  speed = 0.3,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', `${speed * 100}%`]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC BUTTON – element that subtly follows the cursor
// ─────────────────────────────────────────────────────────────────────────────

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED NUMBER TICKER  (live value that ticks when it changes)
// ─────────────────────────────────────────────────────────────────────────────

export function NumberTicker({
  value,
  suffix = '',
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === display) return;
    setIsAnimating(true);
    const duration = 600;
    const start = display;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * ease));
      if (progress < 1) requestAnimationFrame(tick);
      else { setDisplay(value); setIsAnimating(false); }
    };
    requestAnimationFrame(tick);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.span
      className={className}
      animate={isAnimating ? { color: ['#111', '#3b82f6', '#111'] } : {}}
      transition={{ duration: 0.6 }}
    >
      {display}{suffix}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOWING ORB – decorative ambient blob
// ─────────────────────────────────────────────────────────────────────────────

export function GlowOrb({
  className,
  color = 'from-blue-400/30 to-purple-400/30',
  size = 400,
  delay = 0,
}: {
  className?: string;
  color?: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-tr ${color} blur-3xl pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
        rotate: [0, 45, -20, 30, 0],
      }}
      transition={{
        duration: 12 + delay * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPINNING RING – decorative ring that orbits
// ─────────────────────────────────────────────────────────────────────────────

export function SpinningRing({
  className,
  size = 200,
  thickness = 2,
  color = 'rgba(0,0,0,0.08)',
  speed = 8,
  reverse = false,
}: {
  className?: string;
  size?: number;
  thickness?: number;
  color?: string;
  speed?: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        border: `${thickness}px solid ${color}`,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

export function AnimatedProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  delay = 0,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  delay?: number;
}) {
  const pct = (value / max) * 100;
  return (
    <div className={`h-1.5 w-full bg-black/5 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-black ${barClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
