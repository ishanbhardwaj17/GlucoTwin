import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Activity, Brain, Pill, Heart, FlaskConical, Clock, User,
  ChevronDown, ChevronUp, Wifi, WifiOff, Shield, Zap
} from 'lucide-react';
import { usePatient, usePrediction, useCGMHistory } from '@/api/client';
import { usePatientStream } from '@/hooks/usePatientStream';
import { GlucoseChart } from './GlucoseChart';
import { ReplayControls } from './ReplayControls';
import { ExplanationPanel } from './ExplanationPanel';
import { WhatIfPanel } from './WhatIfPanel';
import type { PatientDetail as PatientDetailType, ForecastPoint, Trend } from '@/types/schema';
import { cn } from '@/lib/utils';

// ─── Helpers ───────────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'rising') return <TrendingUp className="w-5 h-5 text-orange-400" />;
  if (trend === 'falling') return <TrendingDown className="w-5 h-5 text-blue-400" />;
  return <Minus className="w-5 h-5 text-slate-400" />;
}

function formatGlucoseStatus(g: number) {
  if (g < 70) return { label: 'Hypoglycemia', cls: 'text-amber-300 bg-amber-500/10 border-amber-500/30' };
  if (g <= 180) return { label: 'In Range', cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' };
  if (g <= 250) return { label: 'Hyperglycemia', cls: 'text-orange-300 bg-orange-500/10 border-orange-500/30' };
  return { label: 'Critical High', cls: 'text-red-300 bg-red-500/10 border-red-500/30' };
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function SectionCard({ title, icon, children, className }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('glass-card p-5 space-y-4', className)}>
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function LabRow({ label, value, unit, normal }: { label: string; value: number; unit: string; normal: [number, number] }) {
  const isNormal = value >= normal[0] && value <= normal[1];
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-tabular text-sm font-semibold text-slate-200">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold', isNormal ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
          {isNormal ? '✓' : '!'}
        </span>
      </div>
    </div>
  );
}

function CompletenessBar({ label, pct }: { label: string; pct: number }) {
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-tabular font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function RiskMeter({ probability }: { probability: number }) {
  const pct = Math.round(probability * 100);
  const angle = pct * 1.8; // 0–180 deg
  const color = pct >= 70 ? '#ef4444' : pct >= 40 ? '#f97316' : '#10b981';

  return (
    <div className="flex flex-col items-center">
      {/* Semi-circle meter */}
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full border-4 border-slate-800" />
        <div
          className="absolute bottom-0 left-1/2 w-28 h-14 rounded-t-full border-4 transition-all duration-700"
          style={{
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${angle - 90}deg)`,
            borderColor: color,
          }}
        />
        <div className="absolute bottom-0 inset-x-0 flex justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-600" />
        </div>
      </div>
      <span className="font-tabular text-3xl font-black mt-1" style={{ color }}>{pct}%</span>
      <span className="text-xs text-slate-500">Spike Probability</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id ?? '';

  const { data: patient, isLoading: pLoading } = usePatient(patientId);
  const { data: prediction, isLoading: predLoading } = usePrediction(patientId);
  const { data: history, isLoading: hLoading } = useCGMHistory(patientId);

  const { state: stream, play, pause, setSpeed, injectMeal } = usePatientStream(patientId);

  const [whatIfForecast, setWhatIfForecast] = useState<ForecastPoint[] | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'explain' | 'whatif'>('chart');
  const [medsExpanded, setMedsExpanded] = useState(false);

  const isLoading = pLoading || predLoading || hLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Loading patient data…</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3 p-8">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <p className="text-slate-300">Patient not found</p>
          <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 text-sm underline">
            Back to triage
          </button>
        </div>
      </div>
    );
  }

  const liveGlucose = stream.isPlaying ? stream.currentGlucose : patient.current_glucose_mgdl;
  const liveTrend = stream.isPlaying ? stream.trend : patient.trend;
  const liveForecast = stream.isPlaying ? stream.forecast : (prediction?.forecast ?? []);
  const liveRisk = stream.isPlaying ? stream.eventRisk : prediction?.event_risk;
  const glucoseStatus = formatGlucoseStatus(liveGlucose);

  // Merge history with live readings during replay
  const chartHistory = stream.isPlaying && stream.recentReadings.length > 0
    ? stream.recentReadings.map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        timestamp: r.timestamp,
        glucose: r.glucose,
      }))
    : (history ?? []);

  return (
    <div className="min-h-screen bg-slate-950 bg-grid">
      {/* Top Nav */}
      <div className="sticky top-[40px] z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
              id="back-to-triage"
            >
              <ArrowLeft className="w-4 h-4" />
              Triage
            </button>
            <span className="text-slate-700">/</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <span className="font-semibold text-slate-200">{patient.name}</span>
              <span className="text-xs text-slate-500 font-tabular">{patient.id}</span>
            </div>
          </div>

          {/* Replay controls */}
          <ReplayControls
            isPlaying={stream.isPlaying}
            speed={stream.speed}
            simulatedTime={stream.simulatedTime}
            isConnected={stream.isConnected}
            currentGlucose={liveGlucose}
            onPlay={play}
            onPause={pause}
            onSetSpeed={setSpeed}
            onInjectMeal={injectMeal}
          />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 animate-fade-in">

        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Hero glucose card */}
          <div className={cn(
            'glass-card p-6 border',
            liveGlucose > 250 ? 'border-red-500/30 glow-danger' :
            liveGlucose > 180 ? 'border-orange-500/25' :
            liveGlucose < 70 ? 'border-amber-500/25' :
            'border-emerald-500/20 glow-success'
          )}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              {/* Glucose value */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Current Glucose</p>
                <div className="flex items-end gap-3">
                  <span
                    id="current-glucose-value"
                    className="font-tabular text-7xl font-black leading-none"
                    style={{ color: liveGlucose > 250 ? '#ef4444' : liveGlucose > 180 ? '#f97316' : liveGlucose < 70 ? '#f59e0b' : '#10b981' }}
                  >
                    {liveGlucose}
                  </span>
                  <div className="pb-2">
                    <span className="text-slate-400 text-lg">mg/dL</span>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendIcon trend={liveTrend} />
                      <span className="text-sm text-slate-400 capitalize">{liveTrend}</span>
                    </div>
                  </div>
                </div>
                <span className={cn('mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold border', glucoseStatus.cls)}>
                  {glucoseStatus.label}
                </span>
              </div>

              {/* Risk meter */}
              {liveRisk && <RiskMeter probability={liveRisk.probability} />}

              {/* Risk details */}
              {liveRisk && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Severity</p>
                    <span className={cn(
                      'text-sm font-bold capitalize px-3 py-1 rounded-lg border',
                      liveRisk.severity === 'high' ? 'bg-red-500/15 text-red-300 border-red-500/30' :
                      liveRisk.severity === 'moderate' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                      'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    )}>
                      {liveRisk.severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Predicted Peak</p>
                    <span className="font-tabular text-xl font-black text-slate-100">
                      {liveRisk.peak_predicted_mgdl}
                      <span className="text-sm font-normal text-slate-500 ml-1">mg/dL</span>
                    </span>
                  </div>
                  {liveRisk.estimated_minutes_to_event && (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Time to spike
                      </p>
                      <span className="font-tabular text-xl font-black text-orange-300">
                        ~{liveRisk.estimated_minutes_to_event} min
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TIR summary */}
              <div className="space-y-2 min-w-[140px]">
                <p className="text-xs text-slate-500 uppercase tracking-widest">24h Overview</p>
                {[
                  { label: 'In Range', pct: 52, color: '#10b981' },
                  { label: 'Above 180', pct: 44, color: '#f97316' },
                  { label: 'Below 70', pct: 4, color: '#f59e0b' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="font-tabular text-xs text-slate-300 font-semibold ml-auto">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sensor dropout warning */}
            {patient.confidence_score < 0.4 && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-amber-950/40 border border-amber-500/25 rounded-xl">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300">
                  <strong>Sensor dropout detected.</strong> Only {Math.round(patient.data_completeness.cgm_pct)}% CGM data available.
                  Predictions are based on heavily imputed data — confidence is LOW.
                </p>
              </div>
            )}
          </div>

          {/* Chart + Tabs */}
          <div className="glass-card overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b border-slate-800/60 px-2">
              {[
                { id: 'chart', label: 'Glucose Chart', icon: <Activity className="w-4 h-4" /> },
                { id: 'explain', label: 'Why This Prediction?', icon: <Brain className="w-4 h-4" /> },
                { id: 'whatif', label: 'What-If', icon: <Zap className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all',
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-300'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'chart' && (
                <GlucoseChart
                  history={chartHistory}
                  forecast={liveForecast}
                  whatIfForecast={whatIfForecast}
                  targetLow={patient.target_range.low}
                  targetHigh={patient.target_range.high}
                  currentGlucose={liveGlucose}
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
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Patient card */}
          <SectionCard title="Patient" icon={<User className="w-4 h-4 text-indigo-400" />}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Age / Sex', value: `${patient.age}y ${patient.sex}` },
                { label: 'DM Type', value: patient.diabetes_type },
                { label: 'Diagnosed', value: new Date(patient.diagnose_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                { label: 'Clinician', value: patient.clinician.split(',')[0] },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="text-slate-200 font-medium text-sm leading-tight">{value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Vitals */}
          <SectionCard title="Vitals" icon={<Heart className="w-4 h-4 text-red-400" />}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'BMI', value: patient.vitals.bmi.toFixed(1), unit: 'kg/m²', normal: patient.vitals.bmi <= 25 },
                { label: 'SBP', value: patient.vitals.sbp_mmhg, unit: 'mmHg', normal: patient.vitals.sbp_mmhg <= 130 },
                { label: 'DBP', value: patient.vitals.dbp_mmhg, unit: 'mmHg', normal: patient.vitals.dbp_mmhg <= 80 },
                { label: 'HR', value: patient.vitals.heart_rate_bpm, unit: 'bpm', normal: patient.vitals.heart_rate_bpm >= 60 && patient.vitals.heart_rate_bpm <= 100 },
              ].map(({ label, value, unit, normal }) => (
                <div key={label} className="bg-slate-900/50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="font-tabular text-base font-bold text-slate-100">{value}
                    <span className="text-xs text-slate-500 ml-1">{unit}</span>
                  </p>
                  <span className={cn('text-[10px] font-semibold', normal ? 'text-emerald-400' : 'text-amber-400')}>
                    {normal ? '✓ Normal' : '⚠ Elevated'}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Labs */}
          <SectionCard title="Labs" icon={<FlaskConical className="w-4 h-4 text-violet-400" />}>
            <LabRow label="HbA1c" value={patient.labs.hba1c_pct} unit="%" normal={[0, 7]} />
            <LabRow label="Fasting Glucose" value={patient.labs.fasting_glucose_mgdl} unit="mg/dL" normal={[70, 100]} />
            <LabRow label="eGFR" value={patient.labs.egfr_ml_min} unit="mL/min" normal={[60, 120]} />
            <LabRow label="LDL" value={patient.labs.ldl_mgdl} unit="mg/dL" normal={[0, 100]} />
            <LabRow label="Triglycerides" value={patient.labs.triglycerides_mgdl} unit="mg/dL" normal={[0, 150]} />
            <p className="text-[10px] text-slate-600 pt-1">
              Labs from {new Date(patient.labs.last_updated).toLocaleDateString()}
            </p>
          </SectionCard>

          {/* Medications */}
          <SectionCard title="Medications" icon={<Pill className="w-4 h-4 text-pink-400" />}>
            <div className="space-y-1.5">
              {patient.current_medications.slice(0, medsExpanded ? undefined : 3).map((med) => (
                <div key={med} className="flex items-center gap-2 py-1.5 border-b border-slate-800/40 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400/60 shrink-0" />
                  <span className="text-sm text-slate-300">{med}</span>
                </div>
              ))}
            </div>
            {patient.current_medications.length > 3 && (
              <button
                onClick={() => setMedsExpanded(!medsExpanded)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
              >
                {medsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {medsExpanded ? 'Show less' : `+${patient.current_medications.length - 3} more`}
              </button>
            )}
          </SectionCard>

          {/* Data Completeness */}
          <SectionCard title="Data Completeness" icon={<Shield className="w-4 h-4 text-sky-400" />}>
            <div className="space-y-3">
              <CompletenessBar label="CGM Coverage" pct={patient.data_completeness.cgm_pct} />
              <CompletenessBar label="Heart Rate" pct={patient.data_completeness.hr_pct} />
              <CompletenessBar label="Sleep Data" pct={patient.data_completeness.sleep_pct} />
              <CompletenessBar label="Activity" pct={patient.data_completeness.activity_pct} />
            </div>
            <div className="pt-2 border-t border-slate-800/40">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-semibold">Overall</span>
                <span className="font-tabular font-bold text-slate-200">{patient.data_completeness.overall_pct}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${patient.data_completeness.overall_pct}%`,
                    background: patient.data_completeness.overall_pct >= 80
                      ? '#10b981'
                      : patient.data_completeness.overall_pct >= 60
                      ? '#f59e0b'
                      : '#ef4444',
                  }}
                />
              </div>
            </div>
          </SectionCard>

          {/* Active conditions */}
          <SectionCard title="Active Conditions" icon={<Activity className="w-4 h-4 text-orange-400" />}>
            <div className="flex flex-wrap gap-2">
              {patient.active_conditions.map((cond) => (
                <span key={cond} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50">
                  {cond}
                </span>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
