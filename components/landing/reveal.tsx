'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
};

/** Fade-and-rise for blocks: 56px → 0, the same move the reference site uses. */
export function Reveal({ children, className, delay = 0, immediate = false }: RevealProps) {
  const reduce = useReducedMotion();
  const visible = { opacity: 1, y: 0 };
  const hidden = reduce ? visible : { opacity: 0, y: 56 };
  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={immediate ? visible : undefined}
      whileInView={immediate ? undefined : visible}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

type WordsProps = {
  text: string;
  /** Trailing part rendered in grey, e.g. "from ODX" after "What's new". */
  muted?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  delay?: number;
};

/** Heading reveal: each word sharpens out of a blur, staggered left to right. */
export function Words({ text, muted, className, as: Tag = 'h2', delay = 0 }: WordsProps) {
  const reduce = useReducedMotion();
  const visible = { opacity: 1, filter: 'blur(0px)', y: 0 };
  const hidden = reduce ? visible : { opacity: 0, filter: 'blur(10px)', y: 10 };
  const parts = [
    ...text.split(' ').map(w => ({ w, muted: false })),
    ...(muted ? muted.split(' ').map(w => ({ w, muted: true })) : []),
  ];
  return (
    <Tag className={cn('text-balance', className)}>
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className={cn('inline-block', p.muted && 'text-[#818181]')}
          initial={hidden}
          whileInView={visible}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.6, ease: EASE, delay: delay + i * 0.06 }}
        >
          {p.w}
          {i < parts.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}
