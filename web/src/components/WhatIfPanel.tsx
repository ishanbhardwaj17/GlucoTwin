import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { useWhatIf } from '@/api/client';
import type { WhatIfRequest, WhatIfResponse } from '@/types/schema';
import { cn } from '@/lib/utils';
import { staggerItem } from './Animations';

interface Props {
  patientId: string;
  basePeak: number;
  baseProb: number;
  onForecastChange?: (forecast: import('@/types/schema').ForecastPoint[] | null) => void;
}

function Slider({ id, label, value, min, max, step, unit, onChange }: any) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="bg-white/40 p-6 border-2 border-black group transition-colors hover:bg-white/80">
      <div className="flex items-center justify-between mb-6">
        <label htmlFor={id} className="text-black text-sm font-bold uppercase tracking-widest">{label}</label>
        <span className="font-display text-black text-2xl">
          {value}<span className="text-black/50 font-sans font-bold text-[10px] ml-1 uppercase tracking-widest">{unit}</span>
        </span>
      </div>
      <div className="relative h-2 w-full bg-black/10 border border-black overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-black" 
          animate={{ width: `${pct}%` }} 
          transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
        />
        <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
    </div>
  );
}

function MetricCard({ label, baseline, scenario, delta, unit, invertDelta, index }: any) {
  const isPositive = delta > 0;
  const isBad = invertDelta ? !isPositive : isPositive;
  const deltaColor = delta === 0 ? 'text-black/50' : isBad ? 'text-black bg-black/10' : 'text-black bg-transparent border border-black';

  return (
    <motion.div variants={staggerItem} initial="hidden" animate="show" custom={index} className="bg-white/40 border-2 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
      <div className="flex justify-between items-start mb-6 border-b border-black/20 pb-4">
        <p className="text-black/50 text-xs font-bold uppercase tracking-widest">{label}</p>
        <span className={cn('px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider', deltaColor)}>
          {delta === 0 ? 'SAME' : `${isPositive ? '+' : ''}${delta}${unit}`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Baseline</p>
          <p className="font-display text-3xl text-black/50">{baseline}<span className="text-xs ml-1 font-sans">{unit}</span></p>
        </div>
        <div>
          <p className="text-black text-[10px] font-bold uppercase tracking-widest mb-1">Simulated</p>
          <p className="font-display text-4xl text-black">{scenario}<span className="text-xs text-black/50 ml-1 font-sans">{unit}</span></p>
        </div>
      </div>
    </motion.div>
  );
}

export function WhatIfPanel({ patientId, onForecastChange }: Props) {
  const [carbs, setCarbs] = useState(0);
  const [walkMin, setWalkMin] = useState(0);
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const mutation = useWhatIf(patientId);

  const handleRun = async () => {
    try {
      const res = await mutation.mutateAsync({ patient_id: patientId, carbs_g: carbs, walk_duration_min: walkMin, stress_level: 'none' });
      setResult(res); onForecastChange?.(res.forecast_scenario);
    } catch { /* silent */ }
  };

  const handleReset = () => {
    setCarbs(0); setWalkMin(0); setResult(null); onForecastChange?.(null);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-white/40">
        <Slider id="whatif-carbs" label="Carb Load" value={carbs} min={0} max={120} step={5} unit="g" onChange={setCarbs} />
        <div className="hidden md:block w-[2px] bg-black h-full" />
        <Slider id="whatif-walk" label="Activity" value={walkMin} min={0} max={60} step={5} unit="m" onChange={setWalkMin} />
      </div>

      <div className="flex gap-4 items-center">
        <button onClick={handleRun} disabled={mutation.isPending} className="flex-1 flex items-center justify-center gap-3 disabled:opacity-50 h-16 btn-editorial">
          {mutation.isPending ? <div className="w-6 h-6 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : <><Play className="w-5 h-5 fill-current" /> EXECUTE SIMULATION</>}
        </button>
        <AnimatePresence>
          {result && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={handleReset} className="w-16 h-16 flex items-center justify-center bg-transparent border-2 border-black text-black hover:bg-black hover:text-[#e8e5df] transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-8 overflow-hidden">
            <h3 className="font-display text-2xl text-black uppercase tracking-tight mb-6">Simulation Impact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MetricCard index={0} label="Peak" baseline={result.baseline.peak_mgdl} scenario={result.scenario.peak_mgdl} delta={result.delta.peak_mgdl} unit="mg/dL" invertDelta />
              <MetricCard index={1} label="Spike Risk" baseline={`${Math.round(result.baseline.spike_probability * 100)}`} scenario={`${Math.round(result.scenario.spike_probability * 100)}`} delta={Math.round(result.delta.spike_probability * 100)} unit="%" invertDelta />
              <MetricCard index={2} label="TBR" baseline={result.baseline.minutes_above_180} scenario={result.scenario.minutes_above_180} delta={result.delta.minutes_above_180} unit="m" invertDelta />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
