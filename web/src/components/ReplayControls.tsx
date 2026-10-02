import { Play, Pause, Zap, UtensilsCrossed, Wifi, WifiOff, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  isPlaying: boolean;
  speed: number;
  simulatedTime: Date;
  isConnected: boolean;
  currentGlucose: number;
  onPlay: () => void;
  onPause: () => void;
  onSetSpeed: (speed: number) => void;
  onInjectMeal: (carbs: number) => void;
}

const SPEEDS = [
  { label: '60×', value: 60 },
  { label: '300×', value: 300 },
  { label: '900×', value: 900 },
];

export function ReplayControls({
  isPlaying, speed, simulatedTime, isConnected, currentGlucose,
  onPlay, onPause, onSetSpeed, onInjectMeal
}: Props) {
  const timeLabel = simulatedTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const dateLabel = simulatedTime.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Connection status */}
      <div className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border',
        isConnected
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
          : 'bg-slate-800 text-slate-500 border-slate-700/50'
      )}>
        {isConnected
          ? <><Wifi className="w-3.5 h-3.5" /> Live</>
          : <><WifiOff className="w-3.5 h-3.5" /> Mock Sim</>}
      </div>

      {/* Play/Pause */}
      <button
        id="replay-playpause"
        onClick={isPlaying ? onPause : onPlay}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-150',
          isPlaying
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
        )}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Speed toggles */}
      <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-700/50 rounded-lg p-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            id={`replay-speed-${s.value}`}
            onClick={() => onSetSpeed(s.value)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-semibold font-tabular transition-all',
              speed === s.value
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Zap className="w-3 h-3 inline mr-0.5" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Simulated time */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <div>
          <p className="font-tabular text-sm font-bold text-slate-200">{timeLabel}</p>
          <p className="text-[10px] text-slate-500">{dateLabel} · Simulated</p>
        </div>
      </div>

      {/* Inject Meal */}
      <button
        id="replay-inject-meal"
        onClick={() => onInjectMeal(60)}
        title="Inject a 60g carbohydrate meal event into the simulation"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-700/50 bg-slate-800/60 text-slate-400 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/30 transition-all duration-150"
      >
        <UtensilsCrossed className="w-4 h-4" />
        Add Meal
        <span className="text-xs bg-slate-700/60 px-1 py-0.5 rounded font-tabular">60g</span>
      </button>
    </div>
  );
}
