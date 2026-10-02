import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, FastForward, Activity, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  isPlaying: boolean;
  speed: number;
  simulatedTime: Date;
  isConnected: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSetSpeed: (speed: number) => void;
  onInjectMeal: () => void;
}

export function ReplayControls({
  isPlaying, speed, simulatedTime, isConnected,
  onPlay, onPause, onSetSpeed, onInjectMeal
}: Props) {
  return (
    <div className="flex items-stretch bg-[#e8e5df] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      
      <div className="flex items-center gap-2 px-4 border-r-2 border-black bg-white/50">
        <div className="relative flex items-center justify-center">
          {isConnected && isPlaying ? (
            <span className="relative inline-flex h-2 w-2 bg-black animate-pulse" />
          ) : (
            <span className="relative inline-flex h-2 w-2 border border-black bg-transparent" />
          )}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-black w-12 hidden sm:block">
          {isPlaying ? 'Live' : 'Paused'}
        </span>
      </div>

      <div className="flex items-center">
        <motion.button
          whileHover={{ backgroundColor: '#000', color: '#e8e5df' }}
          whileTap={{ scale: 0.95 }}
          onClick={isPlaying ? onPause : onPlay}
          className={cn(
            'w-12 h-12 flex items-center justify-center transition-colors border-r-2 border-black',
            isPlaying 
              ? 'bg-transparent text-black'
              : 'bg-black text-[#e8e5df]'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div key={isPlaying ? 'pause' : 'play'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <motion.button
          whileHover={{ backgroundColor: '#000', color: '#e8e5df' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSetSpeed(speed === 1 ? 5 : speed === 5 ? 20 : 1)}
          className={cn(
            'h-12 px-4 flex items-center gap-2 text-xs font-bold transition-colors border-r-2 border-black',
            speed > 1 
              ? 'bg-black/10 text-black' 
              : 'bg-transparent text-black'
          )}
        >
          <FastForward className="w-3.5 h-3.5" />
          {speed}x
        </motion.button>
      </div>

      <div className="flex items-center">
        <motion.button
          whileHover={{ backgroundColor: '#000', color: '#e8e5df' }}
          whileTap={{ scale: 0.95 }}
          onClick={onInjectMeal}
          disabled={!isPlaying}
          className="h-12 px-5 bg-transparent text-black flex items-center gap-2 text-xs font-bold transition-colors disabled:opacity-30 border-r-2 border-black"
        >
          <Flame className="w-4 h-4" />
          <span className="hidden md:inline uppercase tracking-widest">Meal</span>
        </motion.button>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-4 font-bold text-[11px] text-black bg-white/50">
        <Activity className="w-4 h-4" />
        {simulatedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>
    </div>
  );
}
