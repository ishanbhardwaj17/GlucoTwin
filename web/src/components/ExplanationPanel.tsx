import { motion, AnimatePresence } from 'framer-motion';
import { useExplanation } from '@/api/client';
import type { FactorAttribution } from '@/types/schema';
import { cn } from '@/lib/utils';
import { StaggerContainer, staggerItem } from './Animations';

interface Props { patientId: string; }

function AttributionBar({ attr, maxShare, index }: { attr: FactorAttribution; maxShare: number; index: number }) {
  const pct = (attr.share_pct / maxShare) * 100;
  const isRaises = attr.direction === 'raises';

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ x: 4 }}
      className="flex flex-col gap-4 py-6 border-b-2 border-black last:border-0 relative group"
    >
      {/* Hover highlight */}
      <motion.div
        className="absolute inset-0 bg-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity -z-0 rounded-sm"
      />

      <div className="flex justify-between items-baseline relative z-10">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06, type: 'spring', stiffness: 200 }}
          className="font-display text-3xl text-black tracking-tight uppercase leading-none"
        >
          {attr.feature}
        </motion.span>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06 + 0.2, type: 'spring', stiffness: 300 }}
          animate={isRaises ? { y: [0, -2, 0] } : { y: [0, 2, 0] }}
          className={cn(
            'text-[10px] font-bold px-3 py-1 border border-black uppercase tracking-widest',
            isRaises ? 'bg-black text-[#e8e5df]' : 'bg-transparent text-black'
          )}
        >
          {isRaises ? '+' : '-'}{attr.share_pct}%
        </motion.span>
      </div>

      {/* Animated bar */}
      <div className="h-2 bg-black/10 overflow-hidden relative z-10 border border-black/20">
        <motion.div
          className={cn('h-full origin-left', isRaises ? 'bg-black' : 'bg-black/50')}
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: `${pct}%`, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Shimmer sweep on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06 + 0.3 }}
        className="text-black/60 text-sm font-medium leading-relaxed relative z-10"
      >
        {attr.plain_text}
      </motion.p>
    </motion.div>
  );
}

export function ExplanationPanel({ patientId }: Props) {
  const { data: explain, isLoading, error } = useExplanation(patientId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-4 border-black/10 border-t-black"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-1 rounded-full border-2 border-black/5 border-b-black/30"
          />
        </div>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs font-bold uppercase tracking-widest text-black/40"
        >
          Loading Attribution…
        </motion.p>
      </div>
    );
  }

  if (error || !explain) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-black font-bold text-sm p-4 bg-transparent border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]"
      >
        Unable to load synthesis model.
      </motion.div>
    );
  }

  const maxShare = Math.max(...explain.attributions.map((a) => a.share_pct));

  return (
    <div className="max-w-2xl">
      <StaggerContainer className="mb-12">
        {explain.attributions.map((attr, i) => (
          <AttributionBar key={attr.feature} attr={attr} maxShare={maxShare} index={i} />
        ))}
      </StaggerContainer>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.01 }}
        className="p-8 bg-black border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.2)] relative overflow-hidden text-[#e8e5df]"
      >
        {/* Animated grid overlay */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '20px 20px'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Shimmer orb inside dark card */}
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <p className="text-[#e8e5df] text-xs font-bold uppercase tracking-widest mb-4 inline-block border-b border-[#e8e5df]/30 pb-2 relative z-10">
          Model Synthesis
        </p>
        <p className="text-[#e8e5df] text-lg font-medium leading-relaxed relative z-10">
          {explain.summary}
        </p>
      </motion.div>
    </div>
  );
}
