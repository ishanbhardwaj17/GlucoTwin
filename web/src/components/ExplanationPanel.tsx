import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useExplanation } from '@/api/client';
import type { FactorAttribution } from '@/types/schema';
import { cn } from '@/lib/utils';

interface Props {
  patientId: string;
}

function AttributionBar({ attr, maxShare }: { attr: FactorAttribution; maxShare: number }) {
  const pct = (attr.share_pct / maxShare) * 100;
  const isRaises = attr.direction === 'raises';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isRaises
            ? <TrendingUp className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            : <TrendingDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
          <span className="text-sm text-slate-300 truncate" title={attr.feature}>{attr.feature}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            'text-xs font-semibold px-1.5 py-0.5 rounded-md font-tabular',
            isRaises ? 'text-orange-300 bg-orange-500/10' : 'text-sky-300 bg-sky-500/10'
          )}>
            {isRaises ? '↑' : '↓'} {attr.share_pct}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: isRaises
              ? 'linear-gradient(90deg, #f97316, #ef4444)'
              : 'linear-gradient(90deg, #38bdf8, #06b6d4)',
          }}
        />
      </div>

      {/* Plain text */}
      <p className="text-xs text-slate-500 leading-relaxed pl-5">{attr.plain_text}</p>
    </div>
  );
}

export function ExplanationPanel({ patientId }: Props) {
  const { data: explain, isLoading, error } = useExplanation(patientId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5 animate-pulse">
            <div className="flex justify-between">
              <div className="h-4 w-40 bg-slate-800 rounded" />
              <div className="h-4 w-12 bg-slate-800 rounded" />
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full" style={{ width: `${70 - i * 12}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (error || !explain) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 p-3">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        Unable to load explanation.
      </div>
    );
  }

  const maxShare = Math.max(...explain.attributions.map((a) => a.share_pct));
  const lowConf = explain.confidence < 0.4;

  return (
    <div className="space-y-4">
      {/* Low confidence warning */}
      {lowConf && (
        <div className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            Low confidence ({Math.round(explain.confidence * 100)}%) — significant sensor data missing.
            Attribution weights are unreliable.
          </p>
        </div>
      )}

      {/* Attribution bars */}
      <div className="space-y-4">
        {explain.attributions.map((attr) => (
          <AttributionBar key={attr.feature} attr={attr} maxShare={maxShare} />
        ))}
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-slate-800/60">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">Model Summary</p>
            <p className="text-sm text-slate-300 leading-relaxed">{explain.summary}</p>
          </div>
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>Prediction confidence</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${explain.confidence * 100}%`,
                background: explain.confidence > 0.7 ? '#10b981' : explain.confidence > 0.4 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <span className="font-tabular font-semibold text-slate-300">
            {Math.round(explain.confidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
