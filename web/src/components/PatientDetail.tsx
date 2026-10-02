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
import { FadeUp, CountUp, TextReveal } from './Animations';
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
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin rounded-full" />
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

  return (
    <div className="relative pb-32">
      {/* ── Sticky Header ── */}
      <div className="sticky top-[108px] z-40 bg-[#e8e5df]/90 backdrop-blur-md border-b-2 border-black">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="w-12 h-12 bg-black text-[#e8e5df] flex items-center justify-center hover:bg-[#e8e5df] hover:text-black hover:border-2 hover:border-black transition-colors">
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </Link>
            <div>
              <h1 className="font-display text-5xl tracking-tight text-black uppercase leading-none">{patient.name}</h1>
              <p className="text-xs text-black/50 font-bold uppercase tracking-widest mt-1">
                ID:{patient.id} • {patient.age}Y
              </p>
            </div>
          </div>
          <ReplayControls
            isPlaying={stream.isPlaying} speed={stream.speed} simulatedTime={stream.simulatedTime}
            isConnected={stream.isConnected}
            onPlay={play} onPause={pause} onSetSpeed={setSpeed} onInjectMeal={() => injectMeal(60)}
          />
        </div>
      </div>

      {/* ── Hero Stats ── */}
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-12 border-b-2 border-black">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          <FadeUp delay={0.1} className="relative">
            <p className="text-black/50 text-xs font-bold uppercase tracking-widest mb-4 border-b border-black/20 pb-2">Live Glucose</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[6rem] text-black leading-none tracking-tighter">{liveGlucose}</span>
            </div>
            <div className="mt-4 border border-black text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 inline-block">{liveTrend}</div>
          </FadeUp>

          <FadeUp delay={0.2} className="relative">
            <p className="text-black/50 text-xs font-bold uppercase tracking-widest mb-4 border-b border-black/20 pb-2">Spike Risk</p>
            <span className={cn('font-display text-[6rem] leading-none tracking-tighter', riskPct >= 70 ? 'text-black' : 'text-black')}>
              <CountUp to={riskPct} suffix="%" />
            </span>
            <div className="mt-6 h-1 w-full bg-black/10 overflow-hidden">
               <motion.div className="absolute inset-y-0 left-0 bg-black" initial={{ width: 0 }} animate={{ width: `${riskPct}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </FadeUp>

          <FadeUp delay={0.3} className="relative">
            <p className="text-black/50 text-xs font-bold uppercase tracking-widest mb-4 border-b border-black/20 pb-2">Peak Est.</p>
            <span className="font-display text-[6rem] text-black leading-none tracking-tighter">{liveRisk?.peak_predicted_mgdl ?? '--'}</span>
          </FadeUp>

          <FadeUp delay={0.4} className="relative">
            <p className="text-black/50 text-xs font-bold uppercase tracking-widest mb-4 border-b border-black/20 pb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> ETA</p>
            <span className="font-display text-[6rem] text-black leading-none tracking-tighter">{liveRisk?.estimated_minutes_to_event ?? '--'}</span>
            <p className="text-black/50 text-xs font-bold uppercase tracking-widest mt-2">Minutes</p>
          </FadeUp>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
        <FadeUp delay={0.5} className="flex flex-col min-h-[600px] border-2 border-black">
          <div className="flex items-center gap-0 border-b-2 border-black">
            {[
              { id: 'chart', label: 'Forecast' },
              { id: 'explain', label: 'Attribution' },
              { id: 'whatif', label: 'Simulation' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn('relative flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border-r-2 border-black last:border-r-0', activeTab === tab.id ? 'text-[#e8e5df] bg-black' : 'text-black hover:bg-black/5')}
              >
                {activeTab === tab.id && <motion.div layoutId="detailTabEditorial" className="absolute inset-0 bg-black -z-10" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 p-8 relative bg-white/50">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="h-full w-full absolute inset-0 p-8">
                {activeTab === 'chart' && <GlucoseChart history={chartHistory} forecast={liveForecast} whatIfForecast={whatIfForecast} targetLow={patient.target_range.low} targetHigh={patient.target_range.high} />}
                {activeTab === 'explain' && <ExplanationPanel patientId={patientId} />}
                {activeTab === 'whatif' && <WhatIfPanel patientId={patientId} basePeak={liveRisk?.peak_predicted_mgdl ?? 200} baseProb={liveRisk?.probability ?? 0.5} onForecastChange={(f) => { setWhatIfForecast(f); if (f) setActiveTab('chart'); }} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeUp>

        <div className="space-y-12">
          <FadeUp delay={0.6} className="relative">
            <h3 className="font-display text-4xl text-black uppercase tracking-tight mb-6">Profile</h3>
            <div className="space-y-0 border-y-2 border-black">
              {[
                { label: 'Twin Status', value: patient.twin_status.replace('_', ' ').toUpperCase() },
                { label: 'Confidence', value: `${Math.round(patient.confidence_score * 100)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-4 border-b border-black/20 last:border-0">
                  <span className="text-black/60 text-xs font-bold uppercase tracking-widest">{label}</span>
                  <span className="font-bold text-black text-sm bg-black/5 border border-black/10 px-3 py-1 rounded-sm">{value}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.7} className="relative">
            <h3 className="font-display text-4xl text-black uppercase tracking-tight mb-6">Clinical Labs</h3>
            <div className="space-y-0 border-y-2 border-black">
              {[
                { label: 'HbA1c', value: patient.labs.hba1c_pct, unit: '%', alert: patient.labs.hba1c_pct > 7 },
                { label: 'eGFR', value: patient.labs.egfr_ml_min, unit: 'mL/min', alert: patient.labs.egfr_ml_min < 60 },
              ].map(({ label, value, unit, alert }) => (
                <div key={label} className="flex justify-between items-center py-4 border-b border-black/20 last:border-0">
                  <span className="text-black/60 text-xs font-bold uppercase tracking-widest">{label}</span>
                  <span className={cn('text-3xl font-display', alert ? 'text-black' : 'text-black')}>
                    {value} <span className="text-black/40 font-sans text-sm ml-1 font-bold">{unit}</span>
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
