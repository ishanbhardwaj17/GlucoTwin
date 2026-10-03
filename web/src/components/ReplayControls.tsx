import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, FastForward, Activity, Flame, Clock } from 'lucide-react';
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
  const timeStr = simulatedTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  return (
    <div className="flex items-stretch bg-[#e8e5df] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-full overflow-hidden">

      {/* Status indicator */}
      <div className="flex items-center gap-2 px-4 border-r-2 border-black bg-white/50">
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isConnected && isPlaying ? (
              <motion.div
                key="live"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="relative flex h-2 w-2"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
              </motion.div>
            ) : (
              <motion.div
                key="paused"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="h-2 w-2 border border-black bg-transparent"
              />
            )}
          </AnimatePresence>
        </div>
        <motion.span
          animate={isPlaying ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs font-bold uppercase tracking-widest text-black w-12 hidden sm:block"
        >
          {isPlaying ? 'Live' : 'Paused'}
        </motion.span>
      </div>

      {/* Play / Pause */}
      <div className="flex items-center">
        <motion.button
          whileHover={{ backgroundColor: '#000', color: '#e8e5df' }}
          whileTap={{ scale: 0.9 }}
          onClick={isPlaying ? onPause : onPlay}
          className={cn(
            'w-12 h-12 flex items-center justify-center transition-colors border-r-2 border-black',
            isPlaying ? 'bg-transparent text-black' : 'bg-black text-[#e8e5df]'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isPlaying ? 'pause' : 'play'}
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 500 }}
            >
              {isPlaying
                ? <Pause className="w-4 h-4 fill-current" />
                : <Play className="w-4 h-4 fill-current ml-1" />
              }
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Speed toggle */}
        <motion.button
          whileHover={{ backgroundColor: '#000', color: '#e8e5df' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSetSpeed(speed === 1 ? 5 : speed === 5 ? 20 : 1)}
          className={cn(
            'h-12 px-4 flex items-center gap-2 text-xs font-bold transition-colors border-r-2 border-black',
            speed > 1 ? 'bg-black/10 text-black' : 'bg-transparent text-black'
          )}
        >
          <motion.div
            animate={speed > 1 ? { rotate: [0, 20, -20, 0] } : {}}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            <FastForward className="w-3.5 h-3.5" />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.span
              key={speed}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {speed}x
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Meal injection */}
      <div className="flex items-center">
        <motion.button
          whileHover={isPlaying ? { backgroundColor: '#000', color: '#e8e5df' } : {}}
          whileTap={isPlaying ? { scale: 0.9 } : {}}
          onClick={onInjectMeal}
          disabled={!isPlaying}
          className="h-12 px-5 bg-transparent text-black flex items-center gap-2 text-xs font-bold transition-colors disabled:opacity-30 border-r-2 border-black"
        >
          <motion.div
            animate={isPlaying ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame className="w-4 h-4" />
          </motion.div>
          <span className="hidden md:inline uppercase tracking-widest">Meal</span>
        </motion.button>
      </div>

      {/* Clock */}
      <div className="hidden lg:flex items-center gap-2 px-4 font-bold text-[11px] text-black bg-white/50">
        <motion.div
          animate={isPlaying ? { rotate: 360 } : {}}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          <Clock className="w-3.5 h-3.5 text-black/50" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.span
            key={timeStr}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {timeStr}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
