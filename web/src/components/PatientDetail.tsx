import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Activity, Heart, Brain } from 'lucide-react';
import { usePatient, usePrediction, useCGMHistory } from '@/api/client';
import { usePatientStream } from '@/hooks/usePatientStream';
import { GlucoseChart } from './GlucoseChart';
import { ReplayControls } from './ReplayControls';
import { ExplanationPanel } from './ExplanationPanel';
import { WhatIfPanel } from './WhatIfPanel';
import {
  FadeUp, CountUp, StaggerContainer, staggerItem,
  GlowOrb, SpinningRing, NumberTicker, AnimatedProgressBar,
  MagneticButton,
} from './Animations';
import type { ForecastPoint } from '@/types/schema';
import { cn } from '@/lib/utils';

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  isCritical = false,
  delay = 0,
  isLive = false,
}: {
  label: string;
  value: number | string | undefined;
  unit?: string;
  icon?: React.ElementType;
  isCritical?: boolean;
  delay?: number;
  isLive?: boolean;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.04, y: -4 }}
      className={cn(
        'glass-card p-8 relative overflow-hidden group',
        isCritical ? 'border-red-500/20 bg-red-500/5' : ''
      )}
    >
      {/* Ambient orb */}
      <GlowOrb
        size={150}
        color={isCritical ? 'from-red-400/20 to-orange-400/20' : 'from-blue-400/10 to-purple-400/10'}
        className="-top-12 -right-12"
        delay={delay}
      />
      <SpinningRing size={200} thickness={1} color={isCritical ? 'rgba(239,68,68,0.06)' : 'rgba(99,102,241,0.05)'} speed={15} className="-bottom-10 -left-10" />

      <div className="relative z-10">
        <p className={cn('text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2',
          isCritical ? 'text-red-600' : 'text-black/50')}>
          {Icon && (
            <motion.span animate={isLive ? { rotate: [0, 10, -10, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
              <Icon className="w-4 h-4" />
            </motion.span>
          )}
          {label}
          {isLive && (
            <span className="relative flex h-2 w-2 ml-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
        </p>

        <div className="flex items-baseline gap-2">
          <motion.span
            className={cn('font-bold text-6xl tracking-tighter stat-number', isCritical ? 'text-red-600' : 'text-black')}
            animate={isCritical && isLive ? { color: ['#dc2626', '#ef4444', '#dc2626'] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {typeof value === 'number' ? (
              <NumberTicker value={value} />
            ) : value ?? '--'}
          </motion.span>
          {unit && <span className="text-lg font-medium text-black/50">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Patient Detail ──────────────────────────────────────────────────────────

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patientId = id ?? '';

  const { data: patient, isLoading: pLoading } = usePatient(patientId);
  const { data: prediction, isLoading: predLoading } = usePrediction(patientId);
  const { data: history, isLoading: hLoading } = useCGMHistory(patientId);

  const { state: stream, play, pause, setSpeed, injectMeal } = usePatientStream(patientId);
  const [whatIfForecast, setWhatIfForecast] = useState<ForecastPoint[] | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'explain' | 'whatif'>('chart');

  const isLoading = pLoading || predLoading || hLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <SpinningRing size={120} thickness={3} color="rgba(0,0,0,0.15)" speed={1.5} />
          <SpinningRing size={80} thickness={2} color="rgba(0,0,0,0.1)" speed={1} reverse />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-6 bg-black rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const liveGlucose = stream.isPlaying ? stream.currentGlucose : patient.current_glucose_mgdl;
  const liveTrend = stream.isPlaying ? stream.trend : patient.trend;
  const liveForecast = stream.isPlaying ? stream.forecast : (prediction?.forecast ?? []);
  const liveRisk = stream.isPlaying ? stream.eventRisk : prediction?.event_risk;

  const chartHistory =
    stream.isPlaying && stream.recentReadings.length > 0
      ? stream.recentReadings.map((r) => ({
          time: new Date(r.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          timestamp: r.timestamp,
          glucose: r.glucose ?? 0,
        }))
      : (history ?? []).map((r) => ({
          time: new Date(r.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          timestamp: r.timestamp,
          glucose: r.glucose ?? 0,
        }));

  const riskPct = liveRisk ? Math.round(liveRisk.probability * 100) : 0;
  const isCritical = patient.risk_severity === 'high' && patient.confidence_score >= 0.4;

  return (
    <div className="relative pb-32 max-w-7xl mx-auto px-6">

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-6">
          <MagneticButton strength={0.4}>
            <Link
              to="/"
              className="w-12 h-12 bg-white border border-black/10 shadow-sm text-black rounded-full flex items-center justify-center hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300 group"
            >
              <motion.div
                whileHover={{ x: -3 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <ArrowLeft className="w-5 h-5 stroke-[2]" />
              </motion.div>
            </Link>
          </MagneticButton>

          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="font-bold text-4xl tracking-tight text-black"
            >
              {patient.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-sm text-black/50 font-medium mt-1"
            >
              MRN: {patient.mrn} · {patient.age}Y · {patient.id}
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
          className="glass-pill p-1"
        >
          <ReplayControls
            isPlaying={stream.isPlaying}
            speed={stream.speed}
            simulatedTime={stream.simulatedTime}
            isConnected={stream.isConnected}
            onPlay={play}
            onPause={pause}
            onSetSpeed={setSpeed}
            onInjectMeal={() => injectMeal(60)}
          />
        </motion.div>
      </motion.div>

      {/* Metric Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard
          label="Live Glucose"
          value={liveGlucose}
          unit="mg/dL"
          icon={Activity}
          isLive={stream.isPlaying}
          delay={0}
        />

        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.04, y: -4 }}
          className={cn('glass-card p-8 relative overflow-hidden group', isCritical ? 'border-red-500/20 bg-red-500/5' : '')}
        >
          <GlowOrb
            size={150}
            color={isCritical ? 'from-red-400/20 to-orange-400/20' : 'from-blue-400/10 to-purple-400/10'}
            className="-top-12 -right-12"
            delay={0.5}
          />
          <div className="relative z-10">
            <p className={cn('text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2',
              isCritical ? 'text-red-600' : 'text-black/50')}>
              <Heart className="w-4 h-4" />
              Spike Risk
            </p>
            <div className="flex items-baseline gap-1">
              <span className={cn('font-bold text-6xl tracking-tighter stat-number', isCritical ? 'text-red-600' : 'text-black')}>
                <CountUp to={riskPct} suffix="%" />
              </span>
            </div>
            <AnimatedProgressBar
              value={riskPct}
              className="mt-4"
              barClassName={isCritical ? 'bg-red-500' : 'bg-black'}
              delay={0.3}
            />
          </div>
        </motion.div>

        <MetricCard
          label="Peak Estimate"
          value={liveRisk?.peak_predicted_mgdl}
          unit="mg/dL"
          icon={Brain}
          delay={1}
        />

        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.04, y: -4 }}
          className="glass-card p-8 relative overflow-hidden group"
        >
          <GlowOrb size={150} color="from-amber-400/10 to-yellow-400/10" className="-top-12 -right-12" delay={1.5} />
          <div className="relative z-10">
            <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-amber-500" />
              </motion.div>
              ETA
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-6xl tracking-tighter stat-number text-black">
                {liveRisk?.estimated_minutes_to_event ?? '--'}
              </span>
              <span className="text-lg font-medium text-black/50">MIN</span>
            </div>
          </div>
        </motion.div>
      </StaggerContainer>

      {/* Trend pill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <motion.div
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/5 border border-black/8 text-black font-semibold text-xs tracking-wider uppercase"
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-black/40"
          />
          Trend: {liveTrend ?? 'stable'}
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* Chart / Tabs Panel */}
        <FadeUp delay={0.5} className="glass-card flex flex-col min-h-[600px] overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center gap-2 p-4 border-b border-black/5 bg-white/50">
            {[
              { id: 'chart', label: 'Forecast' },
              { id: 'explain', label: 'Attribution' },
              { id: 'whatif', label: 'Simulation' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'chart' | 'explain' | 'whatif')}
                className={cn(
                  'relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all',
                  activeTab === tab.id ? 'text-white' : 'text-black/50 hover:text-black hover:bg-black/5'
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="detailTab"
                    className="absolute inset-0 bg-black rounded-full z-0 shadow-md shadow-black/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 relative bg-[#fafafa]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full absolute inset-0 p-8 overflow-y-auto hide-scrollbar"
              >
                {activeTab === 'chart' && (
                  <GlucoseChart
                    history={chartHistory}
                    forecast={liveForecast}
                    whatIfForecast={whatIfForecast}
                    targetLow={patient.target_range.low}
                    targetHigh={patient.target_range.high}
                  />
                )}
                {activeTab === 'explain' && <ExplanationPanel patientId={patientId} />}
                {activeTab === 'whatif' && (
                  <WhatIfPanel
                    patientId={patientId}
                    basePeak={liveRisk?.peak_predicted_mgdl ?? 200}
                    baseProb={liveRisk?.probability ?? 0.5}
                    onForecastChange={(f) => {
                      setWhatIfForecast(f);
                      if (f) setActiveTab('chart');
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeUp>

        {/* Right Sidebar */}
        <div className="space-y-8">

          {/* Profile Card */}
          <FadeUp delay={0.6} className="glass-card p-8 relative overflow-hidden">
            <GlowOrb size={200} color="from-blue-400/8 to-purple-400/8" className="-top-16 -right-16" />
            <h3 className="font-bold text-2xl tracking-tight text-black mb-6 relative z-10">Profile</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'Twin Status', value: patient.twin_status.replace('_', ' ').toUpperCase() },
                { label: 'Confidence', value: `${Math.round(patient.confidence_score * 100)}%` },
                { label: 'Risk Level', value: patient.risk_severity.toUpperCase() },
              ].map(({ label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1, type: 'spring', stiffness: 200 }}
                  className="flex justify-between items-center py-4 border-b border-black/5 last:border-0"
                >
                  <span className="text-black/50 text-xs font-semibold uppercase tracking-wider">{label}</span>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="font-bold text-black text-sm bg-black/5 rounded-full px-4 py-1 hover:bg-black/10 transition-colors cursor-default"
                  >
                    {value}
                  </motion.span>
                </motion.div>
              ))}
            </div>

            {/* Confidence bar */}
            <div className="mt-6 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Model Confidence</span>
                <span className="text-[10px] font-black text-black/60">{Math.round(patient.confidence_score * 100)}%</span>
              </div>
              <AnimatedProgressBar value={patient.confidence_score * 100} delay={0.8} />
            </div>
          </FadeUp>

          {/* Labs Card */}
          <FadeUp delay={0.7} className="glass-card p-8 relative overflow-hidden">
            <GlowOrb size={200} color="from-green-400/8 to-teal-400/8" className="-bottom-16 -right-16" delay={1} />
            <h3 className="font-bold text-2xl tracking-tight text-black mb-6 relative z-10">Clinical Labs</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'HbA1c', value: patient.labs.hba1c_pct, unit: '%', alert: patient.labs.hba1c_pct > 7 },
                { label: 'eGFR', value: patient.labs.egfr_ml_min, unit: 'mL/min', alert: patient.labs.egfr_ml_min < 60 },
              ].map(({ label, value, unit, alert }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 200 }}
                  className="flex justify-between items-center py-4 border-b border-black/5 last:border-0"
                >
                  <span className="text-black/50 text-xs font-semibold uppercase tracking-wider">{label}</span>
                  <motion.span
                    className={cn('text-2xl font-bold tracking-tight', alert ? 'text-red-500' : 'text-black')}
                    animate={alert ? { color: ['#ef4444', '#dc2626', '#ef4444'] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {value}{' '}
                    <span className="text-black/40 text-sm ml-1">{unit}</span>
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
