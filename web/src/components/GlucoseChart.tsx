import { motion } from 'framer-motion';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine, ComposedChart, Area, Line
} from 'recharts';
import type { ForecastPoint } from '@/types/schema';

interface HistoryPoint {
  time: string;
  timestamp: string | number;
  glucose: number;
}

interface Props {
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  whatIfForecast?: ForecastPoint[] | null;
  targetLow?: number;
  targetHigh?: number;
}

export function GlucoseChart({ history, forecast, whatIfForecast, targetLow = 70, targetHigh = 180 }: Props) {
  const historyData = history.map(h => ({
    time: h.time,
    historicalGlucose: h.glucose ?? undefined,
    isForecast: false,
  }));

  const lastHistoryPoint = history[history.length - 1];
  const now = lastHistoryPoint ? new Date(lastHistoryPoint.timestamp) : new Date();

  const forecastData = forecast.map((f, i) => {
    const t = new Date(now.getTime() + f.offset_min * 60000);
    const whatIfPoint = whatIfForecast?.[i];

    return {
      time: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      predictedGlucose: f.p50,
      p10: f.p10,
      p90: f.p90,
      whatIfGlucose: whatIfPoint?.p50,
      isForecast: true,
    };
  });

  if (lastHistoryPoint && forecastData.length > 0) {
    forecastData.unshift({
      time: lastHistoryPoint.time,
      predictedGlucose: lastHistoryPoint.glucose,
      p10: lastHistoryPoint.glucose,
      p90: lastHistoryPoint.glucose,
      whatIfGlucose: whatIfForecast ? lastHistoryPoint.glucose : undefined,
      isForecast: true,
    });
  }

  const data = [...historyData, ...forecastData];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const isForecast = payload[0].payload.isForecast;

    return (
      <div className="bg-[#e8e5df] text-black border-2 border-black p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
        <p className="font-bold uppercase tracking-widest text-[10px] mb-3 text-black/60 border-b border-black/20 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'p90' || entry.dataKey === 'p10') return null;
          let name = 'Observed';
          let color = '#000';
          if (entry.dataKey === 'predictedGlucose') { name = 'Forecast'; color = '#000'; }
          if (entry.dataKey === 'whatIfGlucose') { name = 'Simulation'; color = '#000'; }

          return (
            <div key={index} className="flex justify-between items-center gap-8 mb-2">
              <span className="font-bold text-xs uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black" style={{ backgroundColor: color }} />
                {name}
              </span>
              <span className="font-display text-2xl leading-none">{Math.round(entry.value)}</span>
            </div>
          );
        })}
        {isForecast && payload[0].payload.p10 && (
          <div className="mt-3 pt-3 border-t border-black/20 text-[10px] font-bold text-black/60">
            80% CI: {Math.round(payload[0].payload.p10)} – {Math.round(payload[0].payload.p90)}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
          <XAxis dataKey="time" stroke="#000" fontSize={10} tick={{ fill: '#000', fontFamily: 'Inter', fontWeight: 700 }} tickMargin={12} minTickGap={30} axisLine={{ strokeWidth: 2 }} tickLine={false} />
          <YAxis stroke="#000" fontSize={10} domain={[40, 300]} ticks={[50, 100, 150, 200, 250, 300]} tick={{ fill: '#000', fontFamily: 'Inter', fontWeight: 700 }} axisLine={{ strokeWidth: 2 }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '3 3' }} />

          <ReferenceArea y1={targetLow} y2={targetHigh} fill="#000" fillOpacity={0.03} />
          <ReferenceLine y={targetHigh} stroke="#000" strokeDasharray="2 2" strokeOpacity={0.3} strokeWidth={1} />
          <ReferenceLine y={targetLow} stroke="#000" strokeDasharray="2 2" strokeOpacity={0.3} strokeWidth={1} />
          <ReferenceLine y={250} stroke="#000" strokeDasharray="4 4" strokeOpacity={0.4} strokeWidth={1} />

          {lastHistoryPoint && (
            <ReferenceLine
              x={lastHistoryPoint.time}
              stroke="#000"
              strokeWidth={1}
              label={{ position: 'top', value: 'NOW', fill: '#000', fontSize: 10, fontWeight: 900, fontFamily: 'Inter' }}
            />
          )}

          <Area type="monotone" dataKey="p90" stroke="none" fill="#000" fillOpacity={0.05} isAnimationActive={true} />
          <Area type="monotone" dataKey="p10" stroke="none" fill="#e8e5df" isAnimationActive={false} />

          <Line type="monotone" dataKey="historicalGlucose" stroke="#000" strokeWidth={3} dot={{ r: 3, fill: '#000', stroke: '#000', strokeWidth: 1 }} activeDot={{ r: 6, fill: '#000', stroke: '#e8e5df', strokeWidth: 2 }} isAnimationActive={false} connectNulls={false} />
          <Line type="monotone" dataKey="predictedGlucose" stroke="#000" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={{ r: 6, fill: '#000', stroke: '#e8e5df', strokeWidth: 2 }} isAnimationActive={true} />
          {whatIfForecast && <Line type="monotone" dataKey="whatIfGlucose" stroke="#000" strokeWidth={3} strokeDasharray="8 4" dot={false} activeDot={{ r: 6, fill: '#000', stroke: '#e8e5df', strokeWidth: 2 }} isAnimationActive={true} />}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
