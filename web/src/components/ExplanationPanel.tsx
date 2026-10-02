import { motion } from 'framer-motion';
import { useExplanation } from '@/api/client';
import type { FactorAttribution } from '@/types/schema';
import { cn } from '@/lib/utils';
import { StaggerContainer, staggerItem } from './Animations';

interface Props {
  patientId: string;
}

function AttributionBar({ attr, maxShare }: { attr: FactorAttribution; maxShare: number }) {
  const pct = (attr.share_pct / maxShare) * 100;
  const isRaises = attr.direction === 'raises';

  return (
    <motion.div variants={staggerItem} className="flex flex-col gap-4 py-6 border-b-2 border-black last:border-0 relative">
      <div className="flex justify-between items-baseline relative z-10">
        <span className="font-display text-4xl text-black tracking-tight uppercase leading-none">{attr.feature}</span>
        <span className={cn('text-[10px] font-bold px-3 py-1 border border-black uppercase tracking-widest', isRaises ? 'bg-black text-[#e8e5df]' : 'bg-transparent text-black')}>
          {isRaises ? '+' : '-'}{attr.share_pct}%
        </span>
      </div>

      <div className="h-2 bg-black/10 overflow-hidden relative z-10 border border-black/20">
        <motion.div
          className={cn('h-full', isRaises ? 'bg-black' : 'bg-black/50')}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <p className="text-black/60 text-sm font-medium leading-relaxed relative z-10">{attr.plain_text}</p>
    </motion.div>
  );
}

export function ExplanationPanel({ patientId }: Props) {
  const { data: explain, isLoading, error } = useExplanation(patientId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 rounded-full border-4 border-black/20 border-t-black animate-spin" />
      </div>
    );
  }

  if (error || !explain) {
    return <div className="text-black font-bold text-sm p-4 bg-transparent border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">Unable to load synthesis model.</div>;
  }

  const maxShare = Math.max(...explain.attributions.map((a) => a.share_pct));

  return (
    <div className="max-w-2xl">
      <StaggerContainer className="mb-12">
        {explain.attributions.map((attr) => (
          <AttributionBar key={attr.feature} attr={attr} maxShare={maxShare} />
        ))}
      </StaggerContainer>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 bg-black border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.2)] relative overflow-hidden text-[#e8e5df]"
      >
        <p className="text-[#e8e5df] text-xs font-bold uppercase tracking-widest mb-4 inline-block border-b border-[#e8e5df]/30 pb-2">Model Synthesis</p>
        <p className="text-[#e8e5df] text-lg font-medium leading-relaxed relative z-10">{explain.summary}</p>
      </motion.div>
    </div>
  );
}
