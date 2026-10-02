import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import { usePatient, usePrediction, useCGMHistory } from '@/api/client';
import { usePatientStream } from '@/hooks/usePatientStream';
import { GlucoseChart } from './GlucoseChart';
import { ReplayControls } from './ReplayControls';
import { ExplanationPanel } from './ExplanationPanel';
import { WhatIfPanel } from './WhatIfPanel';
import { FadeUp, CountUp, StaggerContainer, staggerItem } from './Animations';
import type { ForecastPoint } from '@/types/schema';
import { cn } from '@/lib/utils';

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
        <div className="w-12 h-12 border-4 border-black/10 border-t-black animate-spin rounded-full" />
      </div>
    );
  }

  if (!patient) return null;

  const liveGlucose = stream.isPlaying ? stream.currentGlucose : patient.current_glucose_mgdl;
  const liveTrend = stream.isPlaying ? stream.trend : patient.trend;
  const liveForecast = stream.isPlaying ? stream.forecast : (prediction?.forecast ?? []);
  const liveRisk = stream.isPlaying ? stream.eventRisk : prediction?.event_risk;

  const chartHistory = stream.isPlaying && stream.recentReadings.length > 0
    ? stream.recentReadings.map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        timestamp: r.timestamp,
        glucose: r.glucose ?? 0,
      }))
    : (history ?? []).map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        timestamp: r.timestamp,
        glucose: r.glucose ?? 0,
      }));

  const riskPct = liveRisk ? Math.round(liveRisk.probability * 100) : 0;
  const isCritical = patient.risk_severity === 'high' && patient.confidence_score >= 0.4;

  return (
    <div className="relative pb-32 max-w-7xl mx-auto px-6">
      <div className="py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="w-12 h-12 bg-white border border-black/10 shadow-sm text-black rounded-full flex items-center justify-center hover:scale-105 hover:shadow-md transition-all">
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </Link>
          <div>
            <h1 className="font-bold text-4xl tracking-tight text-black">{patient.name}</h1>
            <p className="text-sm text-black/50 font-medium mt-1">
              MRN: {patient.mrn} • {patient.age}Y • {patient.id}
            </p>
          </div>
        </div>
        <div className="glass-pill p-1">
          <ReplayControls
            isPlaying={stream.isPlaying} speed={stream.speed} simulatedTime={stream.simulatedTime}
            isConnected={stream.isConnected}
            onPlay={play} onPause={pause} onSetSpeed={setSpeed} onInjectMeal={() => injectMeal(60)}
          />
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div variants={staggerItem} className="glass-card p-8">
          <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-4">Live Glucose</p>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-6xl tracking-tighter text-black">{liveGlucose}</span>
            <span className="text-lg font-medium text-black/50">mg/dL</span>
          </div>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-black/5 text-black font-semibold text-xs tracking-wider uppercase">Trend: {liveTrend}</div>
        </motion.div>

        <motion.div variants={staggerItem} className={cn("glass-card p-8", isCritical ? "bg-red-500/5 border-red-500/20" : "")}>
          <p className={cn("text-xs font-semibold uppercase tracking-widest mb-4", isCritical ? "text-red-600" : "text-black/50")}>Spike Risk</p>
          <div className="flex items-baseline gap-1">
            <span className={cn('font-bold text-6xl tracking-tighter', isCritical ? 'text-red-600' : 'text-black')}>
              <CountUp to={riskPct} suffix="%" />
            </span>
          </div>
          <div className="mt-6 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
             <motion.div className={cn("h-full rounded-full", isCritical ? "bg-red-500" : "bg-black")} initial={{ width: 0 }} animate={{ width: `${riskPct}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-card p-8">
          <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-4">Peak Estimate</p>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-6xl tracking-tighter text-black">{liveRisk?.peak_predicted_mgdl ?? '--'}</span>
            <span className="text-lg font-medium text-black/50">mg/dL</span>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-card p-8">
          <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2"><Zap className="w-4 h-4" /> ETA</p>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-6xl tracking-tighter text-black">{liveRisk?.estimated_minutes_to_event ?? '--'}</span>
            <span className="text-lg font-medium text-black/50">MIN</span>
          </div>
        </motion.div>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <FadeUp delay={0.5} className="glass-card flex flex-col min-h-[600px] overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-black/5 bg-white/50">
            {[
              { id: 'chart', label: 'Forecast' },
              { id: 'explain', label: 'Attribution' },
              { id: 'whatif', label: 'Simulation' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn('relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all', activeTab === tab.id ? 'text-white' : 'text-black/50 hover:text-black')}
              >
                {activeTab === tab.id && <motion.div layoutId="detailTab" className="absolute inset-0 bg-black rounded-full z-0 shadow-md shadow-black/20" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 relative bg-[#fafafa]">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.3 }} className="h-full w-full absolute inset-0 p-8 overflow-y-auto hide-scrollbar">
                {activeTab === 'chart' && <GlucoseChart history={chartHistory} forecast={liveForecast} whatIfForecast={whatIfForecast} targetLow={patient.target_range.low} targetHigh={patient.target_range.high} />}
                {activeTab === 'explain' && <ExplanationPanel patientId={patientId} />}
                {activeTab === 'whatif' && <WhatIfPanel patientId={patientId} basePeak={liveRisk?.peak_predicted_mgdl ?? 200} baseProb={liveRisk?.probability ?? 0.5} onForecastChange={(f) => { setWhatIfForecast(f); if (f) setActiveTab('chart'); }} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeUp>

        <div className="space-y-8">
          <FadeUp delay={0.6} className="glass-card p-8">
            <h3 className="font-bold text-2xl tracking-tight text-black mb-6">Profile</h3>
            <div className="space-y-4">
              {[
                { label: 'Twin Status', value: patient.twin_status.replace('_', ' ').toUpperCase() },
                { label: 'Confidence', value: `${Math.round(patient.confidence_score * 100)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-4 border-b border-black/5 last:border-0">
                  <span className="text-black/50 text-xs font-semibold uppercase tracking-wider">{label}</span>
                  <span className="font-bold text-black text-sm bg-black/5 rounded-full px-4 py-1">{value}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.7} className="glass-card p-8">
            <h3 className="font-bold text-2xl tracking-tight text-black mb-6">Clinical Labs</h3>
            <div className="space-y-4">
              {[
                { label: 'HbA1c', value: patient.labs.hba1c_pct, unit: '%', alert: patient.labs.hba1c_pct > 7 },
                { label: 'eGFR', value: patient.labs.egfr_ml_min, unit: 'mL/min', alert: patient.labs.egfr_ml_min < 60 },
              ].map(({ label, value, unit, alert }) => (
                <div key={label} className="flex justify-between items-center py-4 border-b border-black/5 last:border-0">
                  <span className="text-black/50 text-xs font-semibold uppercase tracking-wider">{label}</span>
                  <span className={cn('text-2xl font-bold tracking-tight', alert ? 'text-red-500' : 'text-black')}>
                    {value} <span className="text-black/40 text-sm ml-1">{unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
