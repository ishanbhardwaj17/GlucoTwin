import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { useWhatIf } from '@/api/client';
import type { WhatIfRequest, WhatIfResponse } from '@/types/schema';
import { cn } from '@/lib/utils';
import { staggerItem, GlowOrb } from './Animations';

interface Props {
  patientId: string;
  basePeak: number;
  baseProb: number;
  onForecastChange?: (forecast: import('@/types/schema').ForecastPoint[] | null) => void;
}

// ─── Slider ──────────────────────────────────────────────────────────────────

function Slider({ id, label, value, min, max, step, unit, onChange }: any) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
      className="bg-white/40 p-6 border-2 border-black group transition-all duration-300 relative overflow-hidden first:rounded-l-[32px] last:rounded-r-[32px]"
    >
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <label htmlFor={id} className="text-black text-sm font-bold uppercase tracking-widest">
          {label}
        </label>
        <motion.span
          key={value}
          initial={{ scale: 1.4, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-black text-2xl tabular-nums"
        >
          {value}
          <span className="text-black/50 font-sans font-bold text-[10px] ml-1 uppercase tracking-widest">
            {unit}
          </span>
        </motion.span>
      </div>

      <div className="relative h-2 w-full bg-black/10 border border-black overflow-hidden relative z-10 rounded-full">
        <motion.div
          className="absolute inset-y-0 left-0 bg-black rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.15, type: 'spring', stiffness: 600, damping: 40 }}
        />
        {/* Shimmer on bar */}
        <motion.div
          className="absolute inset-y-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-8"
          animate={{ x: [`-32px`, `${pct}%`] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-2 relative z-10">
        <span className="text-[9px] text-black/30 font-bold">{min}{unit}</span>
        <span className="text-[9px] text-black/30 font-bold">{max}{unit}</span>
      </div>
    </motion.div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ label, baseline, scenario, delta, unit, invertDelta, index }: any) {
  const isPositive = delta > 0;
  const isBad = invertDelta ? !isPositive : isPositive;
  const deltaColor =
    delta === 0
      ? 'text-black/50'
      : isBad
      ? 'text-black bg-black/10'
      : 'text-black bg-transparent border border-black';

  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      animate="show"
      custom={index}
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      className="bg-white/40 border-2 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-shadow rounded-[32px]"
    >
      {/* Ambient glow */}
      <GlowOrb
        size={100}
        color={isBad && delta !== 0 ? 'from-red-400/15 to-orange-400/15' : 'from-green-400/15 to-teal-400/15'}
        className="-top-8 -right-8"
        delay={index * 0.3}
      />

      <div className="flex justify-between items-start mb-6 border-b border-black/20 pb-4 relative z-10">
        <p className="text-black/50 text-xs font-bold uppercase tracking-widest">{label}</p>
        <AnimatePresence mode="wait">
          <motion.span
            key={delta}
            initial={{ scale: 0.5, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className={cn('px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full', deltaColor)}
          >
            {delta === 0 ? 'SAME' : `${isPositive ? '+' : ''}${delta}${unit}`}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10">
        <div>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Baseline</p>
          <motion.p className="font-display text-3xl text-black/50">
            {baseline}
            <span className="text-xs ml-1 font-sans">{unit}</span>
          </motion.p>
        </div>
        <div>
          <p className="text-black text-[10px] font-bold uppercase tracking-widest mb-1">Simulated</p>
          <motion.p
            key={scenario}
            initial={{ scale: 1.2, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-4xl text-black"
          >
            {scenario}
            <span className="text-xs text-black/50 ml-1 font-sans">{unit}</span>
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── WhatIf Panel ────────────────────────────────────────────────────────────

export function WhatIfPanel({ patientId, onForecastChange }: Props) {
  const [carbs, setCarbs] = useState(0);
  const [walkMin, setWalkMin] = useState(0);
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const mutation = useWhatIf(patientId);

  const handleRun = async () => {
    try {
      const res = await mutation.mutateAsync({
        patient_id: patientId,
        carbs_g: carbs,
        walk_duration_min: walkMin,
        stress_level: 'none',
      });
      setResult(res);
      onForecastChange?.(res.forecast_scenario);
    } catch { /* silent */ }
  };

  const handleReset = () => {
    setCarbs(0);
    setWalkMin(0);
    setResult(null);
    onForecastChange?.(null);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Sliders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-white/40 rounded-[32px] overflow-hidden"
      >
        <Slider id="whatif-carbs" label="Carb Load" value={carbs} min={0} max={120} step={5} unit="g" onChange={setCarbs} />
        <div className="hidden md:block w-[2px] bg-black h-full" />
        <Slider id="whatif-walk" label="Activity" value={walkMin} min={0} max={60} step={5} unit="m" onChange={setWalkMin} />
      </motion.div>

      {/* Run / Reset buttons */}
      <div className="flex gap-4 items-center">
        <motion.button
          onClick={handleRun}
          disabled={mutation.isPending}
          whileHover={!mutation.isPending ? { scale: 1.02, y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' } : {}}
          whileTap={!mutation.isPending ? { scale: 0.97 } : {}}
          className="flex-1 flex items-center justify-center gap-3 disabled:opacity-50 h-16 bg-black text-white border-2 border-black font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_rgba(0,0,0,0.3)] transition-all rounded-[32px]"
        >
          <AnimatePresence mode="wait">
            {mutation.isPending ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
                className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                EXECUTE SIMULATION
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {result && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              whileHover={{ scale: 1.1, backgroundColor: '#000', color: '#e8e5df' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="w-16 h-16 flex items-center justify-center bg-transparent border-2 border-black text-black transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-full"
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 0.5, delay: 0.1 }}>
                <RotateCcw className="w-5 h-5" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pt-8"
            >
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="font-display text-2xl text-black uppercase tracking-tight mb-6 flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-black/50" />
                </motion.div>
                Simulation Impact
              </motion.h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <MetricCard
                  index={0}
                  label="Peak"
                  baseline={result.baseline.peak_mgdl}
                  scenario={result.scenario.peak_mgdl}
                  delta={result.delta.peak_mgdl}
                  unit="mg/dL"
                  invertDelta
                />
                <MetricCard
                  index={1}
                  label="Spike Risk"
                  baseline={`${Math.round(result.baseline.spike_probability * 100)}`}
                  scenario={`${Math.round(result.scenario.spike_probability * 100)}`}
                  delta={Math.round(result.delta.spike_probability * 100)}
                  unit="%"
                  invertDelta
                />
                <MetricCard
                  index={2}
                  label="TBR"
                  baseline={result.baseline.minutes_above_180}
                  scenario={result.scenario.minutes_above_180}
                  delta={result.delta.minutes_above_180}
                  unit="m"
                  invertDelta
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
