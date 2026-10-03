import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePatients } from '@/api/client';
import type { PatientSummary } from '@/types/schema';
import { cn } from '@/lib/utils';
import { StaggerContainer, staggerItem, CharReveal, FadeUp, GlowOrb, SpinningRing } from './Animations';

// ─── Filter Pill ────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.07, y: -2 }}
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={cn(
        'px-5 py-2 font-bold text-sm transition-all rounded-full flex items-center gap-2 border',
        active
          ? 'bg-black text-white border-black shadow-[0_10px_20px_rgba(0,0,0,0.2)]'
          : 'bg-white/50 text-black/60 border-black/5 hover:bg-white hover:text-black shadow-sm'
      )}
    >
      {label}
      <motion.span
        animate={active ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={cn(
          'text-[10px] px-2 py-0.5 rounded-full font-black',
          active ? 'bg-white/20 text-white' : 'bg-black/10 text-black/60'
        )}
      >
        {count}
      </motion.span>
    </motion.button>
  );
}

// ─── Trend Icon ─────────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'rising')
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <TrendingUp className="w-4 h-4 text-red-500" />
      </motion.div>
    );
  if (trend === 'falling')
    return (
      <motion.div
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <TrendingDown className="w-4 h-4 text-green-500" />
      </motion.div>
    );
  return <Minus className="w-4 h-4 text-black/40" />;
}

// ─── Patient Card ───────────────────────────────────────────────────────────

function PatientCard({
  patient,
  onClick,
  index,
}: {
  patient: PatientSummary;
  onClick: () => void;
  index: number;
}) {
  const probPct = Math.round(patient.spike_probability * 100);
  const isCritical = patient.risk_severity === 'high' && patient.confidence_score >= 0.4;

  // Tilt on hover
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-100, 100], [6, -6]);
  const rotateY = useTransform(mouseX, [-100, 100], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      variants={staggerItem}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="glass-card cursor-pointer group flex flex-col justify-between min-h-[400px] p-6 overflow-hidden relative bg-white border border-white"
    >
      {/* Ambient orb */}
      <GlowOrb
        size={200}
        color={isCritical ? 'from-red-400/20 to-orange-400/20' : 'from-blue-400/15 to-indigo-400/15'}
        className="-top-20 -right-20"
        delay={index * 0.3}
      />

      {/* Secondary orbiting ring */}
      <SpinningRing
        size={300}
        thickness={1}
        color={isCritical ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.06)'}
        speed={12 + index}
        className="-bottom-16 -left-16"
      />
      <SpinningRing
        size={180}
        thickness={1}
        color={isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.08)'}
        speed={8}
        reverse
        className="-top-8 -right-8"
      />

      {/* Critical indicator stripe */}
      {isCritical && (
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
            backgroundSize: '200% 100%',
          }}
          className="absolute top-0 inset-x-0 h-1.5"
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap gap-2 justify-between items-start mb-6 relative z-10">
        <div className="min-w-0 flex-1">
          <motion.h3
            className={cn(
              'text-2xl font-black tracking-tighter transition-all duration-300 truncate',
              isCritical ? 'text-red-600' : 'text-black'
            )}
          >
            {patient.name}
          </motion.h3>
          <p className="text-xs text-black/40 font-bold mt-1 tracking-wide uppercase truncate">
            MRN: {patient.mrn} · {patient.age}Y
          </p>
        </div>

        {/* Status Badge */}
        <motion.div
          animate={isCritical ? { scale: [1, 1.06, 1], opacity: [1, 0.8, 1] } : {}}
          transition={{ duration: 1.8, repeat: Infinity }}
          className={cn(
            'flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1',
            isCritical
              ? 'bg-red-500/10 text-red-600 border-red-500/30'
              : patient.risk_severity === 'moderate'
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              : 'bg-green-500/10 text-green-600 border-green-500/30'
          )}
        >
          {isCritical && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
          )}
          {patient.risk_severity}
        </motion.div>
      </div>

      {/* Metric Grid */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-2 gap-4">
          {/* Glucose */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-black/[0.03] rounded-2xl p-4 border border-black/5 shadow-inner overflow-hidden"
          >
            <p className="text-black/40 text-[9px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
              Live Glucose
              <TrendIcon trend={patient.trend ?? 'stable'} />
            </p>
            <div className="flex flex-col">
              <span className="text-4xl font-black tracking-tighter text-black leading-none">
                {patient.current_glucose_mgdl}
              </span>
              <span className="text-[9px] font-bold text-black/30 mt-1 uppercase tracking-widest">mg/dL</span>
            </div>
          </motion.div>

          {/* Spike Risk */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className={cn(
              'rounded-2xl p-4 border shadow-inner transition-colors duration-500 overflow-hidden',
              isCritical ? 'bg-red-500/10 border-red-500/20' : 'bg-black/[0.03] border-black/5'
            )}
          >
            <p className={cn('text-[9px] font-bold uppercase tracking-widest mb-2', isCritical ? 'text-red-600' : 'text-black/40')}>
              Spike Risk
            </p>
            <div className="flex items-baseline gap-1">
              <span className={cn('text-4xl font-black tracking-tighter leading-none', isCritical ? 'text-red-600' : 'text-black')}>
                {probPct}%
              </span>
            </div>
            {/* Animated risk bar */}
            <div className="mt-2 h-0.5 w-full bg-black/10 rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', isCritical ? 'bg-red-500' : 'bg-black')}
                initial={{ width: 0 }}
                animate={{ width: `${probPct}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Confidence bar */}
        <div className="mt-4 px-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Model Confidence</span>
            <span className="text-[10px] font-black text-black/50">
              {Math.round(patient.confidence_score * 100)}%
            </span>
          </div>
          <div className="h-0.5 w-full bg-black/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-black/20"
              initial={{ width: 0 }}
              animate={{ width: `${patient.confidence_score * 100}%` }}
              transition={{ duration: 1.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 flex items-center justify-between relative z-10">
        {patient.estimated_minutes_to_event ? (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[10px] font-black bg-black text-white px-5 py-3 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.25)] tracking-widest uppercase"
          >
            ETA {patient.estimated_minutes_to_event} MIN
          </motion.div>
        ) : (
          <span />
        )}

        <motion.div
          whileHover={{ scale: 1.15, rotate: -8 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
        >
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-black"
          >
            →
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Patient List ────────────────────────────────────────────────────────────

export function PatientList() {
  const { data: patients, isLoading } = usePatients();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const navigate = useNavigate();

  const counts = useMemo(() => {
    if (!patients) return { all: 0, high: 0, moderate: 0, low: 0 };
    return {
      all: patients.length,
      high: patients.filter((p) => p.risk_severity === 'high' && p.confidence_score >= 0.4).length,
      moderate: patients.filter((p) => p.risk_severity === 'moderate' && p.confidence_score >= 0.4).length,
      low: patients.filter((p) => p.risk_severity === 'low' && p.confidence_score >= 0.4).length,
    };
  }, [patients]);

  const filtered = useMemo(() => {
    if (!patients) return [];
    let list = [...patients];
    if (filter !== 'all') list = list.filter((p) => p.risk_severity === filter && p.confidence_score >= 0.4);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list;
  }, [patients, filter, search]);

  return (
    <div className="relative pb-32 max-w-[1600px] mx-auto px-6">

      {/* ═══════════════════════════════════════════════════════════
           HERO — Industry Grade
      ═══════════════════════════════════════════════════════════ */}
      <div className="py-24 md:py-36 text-center max-w-6xl mx-auto relative perspective-1000">
        {/* Ambient background glows */}
        <GlowOrb size={600} color="from-blue-500/8 to-purple-500/8" className="-top-40 -left-40" />
        <GlowOrb size={500} color="from-pink-500/6 to-orange-500/6" className="-bottom-20 -right-20" delay={2} />
        <GlowOrb size={400} color="from-emerald-500/5 to-cyan-500/5" className="top-1/2 -right-40" delay={4} />

        {/* Spinning decorative rings */}
        <SpinningRing size={700} thickness={1} color="rgba(99,102,241,0.05)" speed={30} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <SpinningRing size={500} thickness={1} color="rgba(168,85,247,0.06)" speed={20} reverse className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <SpinningRing size={300} thickness={1} color="rgba(6,182,212,0.04)" speed={15} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        {/* Hero title — shimmer gradient text */}
        <motion.div
          initial={{ opacity: 0, y: 120, rotateX: 45, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.6, type: 'spring', bounce: 0.35 }}
        >
          <h1 className="text-6xl md:text-[8rem] lg:text-[140px] leading-[0.85] tracking-tighter font-black drop-shadow-2xl floating-element inline-block text-shimmer">
            GlucoTwin
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)', y: 30 }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1.4, delay: 0.35, type: 'spring' }}
          className="text-xl md:text-3xl text-black/50 mt-12 font-bold tracking-tight max-w-3xl mx-auto leading-snug"
        >
          The first forecasting engine where clinicians can{' '}
          <motion.span
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-shimmer-blue"
            style={{ backgroundSize: '200% 100%' }}
          >
            see the future
          </motion.span>{' '}
          right on the timeline.
        </motion.p>

        {/* Animated stat strip */}
        <FadeUp delay={0.8} className="mt-16 flex items-center justify-center gap-8 md:gap-12 flex-wrap">
          {[
            { label: 'AUROC', value: '86%' },
            { label: 'Lead Time', value: '72 min' },
            { label: 'Accuracy', value: '94%' },
            { label: 'Latency', value: '<50ms' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.12, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, y: -3 }}
              className="text-center group cursor-default"
            >
              <p className="text-2xl font-black tracking-tighter text-black group-hover:text-shimmer-blue transition-all">{stat.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/35 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </FadeUp>

        {/* Divider with animated scale */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 mx-auto w-24 h-px bg-black/10 origin-left"
        />
      </div>

      {/* Search + Filters */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, type: 'spring', bounce: 0.4 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16"
      >
        <motion.div
          whileFocus={{ scale: 1.02, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
          className="flex items-center gap-3 w-full md:w-96 glass-pill px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.06)] bg-white border border-black/5"
        >
          <motion.div
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Search className="w-6 h-6 text-black/40" />
          </motion.div>
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-black font-bold text-lg tracking-tight placeholder-black/30 focus:outline-none"
          />
        </motion.div>

        <div className="flex items-center overflow-x-auto gap-3 w-full md:w-auto hide-scrollbar p-2 glass-pill bg-white/50">
          <FilterPill label="All Patients" active={filter === 'all'} count={counts.all} onClick={() => setFilter('all')} />
          <FilterPill label="Critical Risk" active={filter === 'high'} count={counts.high} onClick={() => setFilter('high')} />
          <FilterPill label="Elevated" active={filter === 'moderate'} count={counts.moderate} onClick={() => setFilter('moderate')} />
          <FilterPill label="Nominal" active={filter === 'low'} count={counts.low} onClick={() => setFilter('low')} />
        </div>
      </motion.div>

      {/* Patient grid / loading */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Multi-ring spinner */}
            <SpinningRing size={120} thickness={3} color="rgba(0,0,0,0.15)" speed={1.5} />
            <SpinningRing size={80} thickness={2} color="rgba(0,0,0,0.1)" speed={1} reverse />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-6 bg-black rounded-full"
            />
          </div>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" delay={0.8}>
          <AnimatePresence mode="popLayout">
            {filtered.map((patient, i) => (
              <motion.div
                key={patient.id}
                variants={staggerItem}
                layout
                exit={{ opacity: 0, scale: 0.8, y: -30 }}
              >
                <PatientCard
                  patient={patient}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  index={i}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </StaggerContainer>
      )}
    </div>
  );
}
