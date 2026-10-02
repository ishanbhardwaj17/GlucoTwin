import {
  ComposedChart, Line, Area, ReferenceLine, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { CGMDataPoint, ForecastPoint } from '@/types/schema';
import { cn } from '@/lib/utils';

interface Props {
  history: CGMDataPoint[];
  forecast: ForecastPoint[];
  whatIfForecast?: ForecastPoint[] | null;
  targetLow?: number;
  targetHigh?: number;
  currentGlucose?: number;
}

// ─── Merge history + forecast into unified chart series ───────────────────

function buildChartData(
  history: CGMDataPoint[],
  forecast: ForecastPoint[],
  whatIfForecast?: ForecastPoint[] | null
) {
  const now = Date.now();

  const historyPoints = history.map((h) => ({
    time: h.time,
    timestamp: h.timestamp,
    glucose: h.glucose ?? null,
    p50: null as number | null,
    p10: null as number | null,
    p90: null as number | null,
    whatIf: null as number | null,
    isHistory: true,
  }));

  const forecastPoints = forecast.map((f, i) => {
    const ts = now + f.offset_min * 60 * 1000;
    return {
      time: new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: ts,
      glucose: null as number | null,
      p50: f.p50,
      p10: f.p10,
      p90: f.p90,
      whatIf: whatIfForecast?.[i]?.p50 ?? null,
      isHistory: false,
    };
  });

  // Stitch last history point into forecast for visual continuity
  const lastHist = historyPoints[historyPoints.length - 1];
  if (lastHist && forecastPoints.length > 0) {
    forecastPoints[0] = {
      ...forecastPoints[0],
      glucose: lastHist.glucose,
      p50: forecastPoints[0].p50,
    };
  }

  return [...historyPoints, ...forecastPoints];
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────

interface TooltipPayload {
  name: string;
  value: number | null;
  color: string;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { payload: ReturnType<typeof buildChartData>[0]; name: string; value: number | null; color: string }[];
  label?: string
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  const glucose = point.glucose;
  const p50 = point.p50;
  const p10 = point.p10;
  const p90 = point.p90;
  const whatIf = point.whatIf;

  return (
    <div className="bg-slate-900/95 border border-slate-700/60 rounded-xl p-3 shadow-2xl min-w-[160px]">
      <p className="text-xs text-slate-400 mb-2 font-tabular">{label}</p>
      {glucose != null && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-xs text-slate-400">Actual</span>
          <span className="font-tabular text-sm font-bold text-slate-100">{Math.round(glucose)} mg/dL</span>
        </div>
      )}
      {p50 != null && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-xs text-indigo-300">Forecast P50</span>
          <span className="font-tabular text-sm font-bold text-indigo-300">{Math.round(p50)} mg/dL</span>
        </div>
      )}
      {p10 != null && p90 != null && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-xs text-slate-500">P10–P90</span>
          <span className="font-tabular text-xs text-slate-400">{Math.round(p10)}–{Math.round(p90)}</span>
        </div>
      )}
      {whatIf != null && (
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-700/50">
          <span className="text-xs text-violet-300">What-If P50</span>
          <span className="font-tabular text-sm font-bold text-violet-300">{Math.round(whatIf)} mg/dL</span>
        </div>
      )}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────

function ChartLegend({ hasWhatIf }: { hasWhatIf: boolean }) {
  return (
    <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 px-4 pb-1">
      <span className="flex items-center gap-1.5">
        <span className="w-6 h-0.5 bg-emerald-400 inline-block" />
        Historical CGM
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-6 h-0.5 bg-indigo-400 inline-block border-dashed border-t-2 border-indigo-400" style={{ background: 'none' }} />
        Forecast P50
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-6 h-2 rounded bg-indigo-400/20 inline-block" />
        P10–P90 Band
      </span>
      {hasWhatIf && (
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-violet-400 inline-block" style={{ borderTop: '2px dashed #a78bfa', background: 'none' }} />
          What-If Scenario
        </span>
      )}
      <span className="flex items-center gap-1.5 ml-auto">
        <span className="w-4 h-0.5 bg-emerald-500/60 inline-block" />
        <span className="text-emerald-500/60">70</span>
        <span className="w-4 h-0.5 bg-amber-500/60 inline-block ml-1" />
        <span className="text-amber-500/60">180 mg/dL</span>
      </span>
    </div>
  );
}

// ─── Main Chart ────────────────────────────────────────────────────────────

export function GlucoseChart({
  history,
  forecast,
  whatIfForecast,
  targetLow = 70,
  targetHigh = 180,
  currentGlucose,
}: Props) {
  const data = buildChartData(history, forecast, whatIfForecast);
  const hasWhatIf = !!(whatIfForecast?.length);

  return (
    <div className="w-full">
      <ChartLegend hasWhatIf={hasWhatIf} />
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />

          <XAxis
            dataKey="time"
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[Math.min(50, targetLow - 20), 320]}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            width={36}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Target range band */}
          <Area
            dataKey="p90"
            stroke="none"
            fill="rgba(99,102,241,0.08)"
            legendType="none"
            name="p90"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Area
            dataKey="p10"
            stroke="none"
            fill="#020617"
            legendType="none"
            name="p10"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* Reference lines */}
          <ReferenceLine
            y={targetLow}
            stroke="#10b981"
            strokeOpacity={0.5}
            strokeDasharray="4 4"
            label={{ value: '70', position: 'left', fill: '#10b981', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
          <ReferenceLine
            y={targetHigh}
            stroke="#f59e0b"
            strokeOpacity={0.5}
            strokeDasharray="4 4"
            label={{ value: '180', position: 'left', fill: '#f59e0b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />

          {/* Historical glucose line */}
          <Line
            dataKey="glucose"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#34d399', strokeWidth: 0 }}
            name="Historical CGM"
            connectNulls={false}
            isAnimationActive={false}
          />

          {/* Forecast P50 line */}
          <Line
            dataKey="p50"
            stroke="#818cf8"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
            name="Forecast P50"
            connectNulls={false}
            isAnimationActive={false}
          />

          {/* What-if line */}
          {hasWhatIf && (
            <Line
              dataKey="whatIf"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="3 2"
              dot={false}
              activeDot={{ r: 4, fill: '#a78bfa', strokeWidth: 0 }}
              name="What-If Scenario"
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
