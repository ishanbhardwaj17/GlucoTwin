import { useState } from 'react';
import { Sliders, ArrowUpRight, ArrowDownLeft, Info, Utensils, PersonStanding, Frown } from 'lucide-react';
import { useWhatIf } from '@/api/client';
import type { WhatIfRequest } from '@/types/schema';
import { cn } from '@/lib/utils';

interface Props {
  patientId: string;
  basePeak: number;
  baseProb: number;
  onForecastChange?: (forecast: import('@/types/schema').ForecastPoint[] | null) => void;
}

// ─── Slider ───────────────────────────────────────────────────────────────

function Slider({
  id, label, icon, value, min, max, step, unit, color, onChange
}: {
  id: string; label: string; icon: React.ReactNode; value: number;
  min: number; max: number; step: number; unit: string; color: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-slate-300">
          {icon}
          {label}
        </label>
        <span className="font-tabular text-sm font-bold" style={{ color }}>
          {value}{unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, rgba(51,65,85,0.6) ${pct}%)`
        }}
      />
      <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-tabular">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Delta badge ──────────────────────────────────────────────────────────

function Delta({ value, unit, invert = false }: { value: number; unit: string; invert?: boolean }) {
  const isPositive = value > 0;
  const isBad = invert ? !isPositive : isPositive;
  const color = isBad ? 'text-red-400' : 'text-emerald-400';
  return (
    <span className={cn('font-tabular text-xs font-semibold flex items-center gap-0.5', color)}>
      {isPositive
        ? <ArrowUpRight className="w-3 h-3" />
        : <ArrowDownLeft className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value}{unit}
    </span>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────

function MetricCard({
  label, baseline, scenario, delta, unit, invertDelta
}: {
  label: string; baseline: number | string; scenario: number | string;
  delta: number; unit: string; invertDelta?: boolean;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3">
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Baseline</p>
          <p className="font-tabular text-base font-bold text-slate-300">{baseline}<span className="text-xs text-slate-500 ml-1">{unit}</span></p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Scenario</p>
          <p className="font-tabular text-base font-bold text-slate-100">{scenario}<span className="text-xs text-slate-500 ml-1">{unit}</span></p>
        </div>
      </div>
      <div className="mt-1.5">
        <Delta value={delta} unit={unit} invert={invertDelta} />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function WhatIfPanel({ patientId, basePeak, baseProb, onForecastChange }: Props) {
  const [carbs, setCarbs] = useState(0);
  const [walkMin, setWalkMin] = useState(0);
  const [stress, setStress] = useState<'none' | 'mild' | 'high'>('none');
  const [result, setResult] = useState<import('@/types/schema').WhatIfResponse | null>(null);

  const mutation = useWhatIf(patientId);

  const handleRun = async () => {
    const req: WhatIfRequest = {
      patient_id: patientId,
      carbs_g: carbs,
      walk_duration_min: walkMin,
      stress_level: stress,
    };
    try {
      const res: import('@/types/schema').WhatIfResponse = await mutation.mutateAsync(req);
      setResult(res);
      onForecastChange?.(res.forecast_scenario);
    } catch {
      // silent
    }
  };

  const handleReset = () => {
    setCarbs(0);
    setWalkMin(0);
    setStress('none');
    setResult(null);
    onForecastChange?.(null);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-4">
        <Slider
          id="whatif-carbs"
          label="Carbohydrate Intake"
          icon={<Utensils className="w-4 h-4 text-orange-400" />}
          value={carbs}
          min={0}
          max={120}
          step={5}
          unit="g"
          color="#f97316"
          onChange={setCarbs}
        />
        <Slider
          id="whatif-walk"
          label="Walking Duration"
          icon={<PersonStanding className="w-4 h-4 text-sky-400" />}
          value={walkMin}
          min={0}
          max={60}
          step={5}
          unit=" min"
          color="#38bdf8"
          onChange={setWalkMin}
        />

        {/* Stress level */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Frown className="w-4 h-4 text-purple-400" />
            Stress Level
          </label>
          <div className="flex gap-2">
            {(['none', 'mild', 'high'] as const).map((s) => (
              <button
                key={s}
                id={`whatif-stress-${s}`}
                onClick={() => setStress(s)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-all',
                  stress === s
                    ? s === 'none' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : s === 'mild' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-700/50 hover:text-slate-300'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          id="whatif-run"
          onClick={handleRun}
          disabled={mutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
        >
          {mutation.isPending
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Sliders className="w-4 h-4" />}
          {mutation.isPending ? 'Computing…' : 'Run Scenario'}
        </button>
        {result && (
          <button
            id="whatif-reset"
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium border border-slate-700/50 transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 gap-2">
            <MetricCard
              label="Predicted Peak Glucose"
              baseline={result.baseline.peak_mgdl}
              scenario={result.scenario.peak_mgdl}
              delta={result.delta.peak_mgdl}
              unit="mg/dL"
              invertDelta
            />
            <MetricCard
              label="Spike Probability"
              baseline={`${Math.round(result.baseline.spike_probability * 100)}%`}
              scenario={`${Math.round(result.scenario.spike_probability * 100)}%`}
              delta={Math.round(result.delta.spike_probability * 100)}
              unit="%"
              invertDelta
            />
            <MetricCard
              label="Time Above 180 mg/dL"
              baseline={result.baseline.minutes_above_180}
              scenario={result.scenario.minutes_above_180}
              delta={result.delta.minutes_above_180}
              unit=" min"
              invertDelta
            />
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          <strong className="text-amber-200">Model estimate for exploration only.</strong>{' '}
          Not medical advice. Consult a clinician before making any treatment decisions.
        </p>
      </div>
    </div>
  );
}
