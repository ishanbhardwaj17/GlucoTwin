import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Wifi, WifiOff, Clock, ChevronRight, Activity, Users,
  ShieldCheck, Brain
} from 'lucide-react';
import { usePatients } from '@/api/client';
import type { PatientSummary, Severity, Trend } from '@/types/schema';
import { cn } from '@/lib/utils';

// ─── Sub-components ────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-orange-400" />;
  if (trend === 'falling') return <TrendingDown className="w-4 h-4 text-blue-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

function SeverityBadge({ severity, confidence }: { severity: Severity; confidence: number }) {
  if (confidence < 0.4) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600/50">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Low Confidence
      </span>
    );
  }
  const config = {
    high: { label: 'High Risk', dot: 'bg-red-400', cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
    moderate: { label: 'Moderate', dot: 'bg-amber-400', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    low: { label: 'Low Risk', dot: 'bg-emerald-400', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  }[severity];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', config.cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', config.dot)} />
      {config.label}
    </span>
  );
}

function TwinStatusBadge({ status }: { status: PatientSummary['twin_status'] }) {
  const config = {
    personalized: { label: 'Personalized', cls: 'text-indigo-300 bg-indigo-500/10', icon: <Brain className="w-3 h-3" /> },
    collecting: { label: 'Learning', cls: 'text-sky-300 bg-sky-500/10', icon: <Activity className="w-3 h-3" /> },
    not_personalized: { label: 'Not Ready', cls: 'text-slate-400 bg-slate-700/50', icon: <Clock className="w-3 h-3" /> },
    stale: { label: 'Stale Data', cls: 'text-amber-300 bg-amber-500/10', icon: <WifiOff className="w-3 h-3" /> },
  }[status];

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', config.cls)}>
      {config.icon}
      {config.label}
    </span>
  );
}

function GlucoseBar({ value, targetLow = 70, targetHigh = 180 }: { value: number; targetLow?: number; targetHigh?: number }) {
  const maxVal = 350;
  const pct = Math.min((value / maxVal) * 100, 100);
  const lowPct = (targetLow / maxVal) * 100;
  const highPct = (targetHigh / maxVal) * 100;
  const color = value < targetLow ? '#f59e0b' : value <= targetHigh ? '#10b981' : value <= 250 ? '#f97316' : '#ef4444';

  return (
    <div className="relative h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
      <div className="absolute inset-y-0" style={{ left: `${lowPct}%`, right: `${100 - highPct}%`, background: 'rgba(16,185,129,0.2)' }} />
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function RelativeTime({ isoString }: { isoString: string }) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const label = mins < 1 ? 'Just now' : mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
  const isStale = mins > 30;
  return (
    <span className={cn('font-tabular text-xs flex items-center gap-1', isStale ? 'text-amber-400' : 'text-slate-500')}>
      {isStale && <WifiOff className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ─── Filter / Search Bar ──────────────────────────────────────────────────

type Filter = 'all' | 'high' | 'moderate' | 'low' | 'low-confidence';

function FilterChip({ label, active, count, color, onClick }: {
  label: string; active: boolean; count: number; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150',
        active
          ? `bg-slate-700 border-slate-500 text-white`
          : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', color)} />
      {label}
      <span className={cn('text-[10px] px-1 py-0.5 rounded font-mono', active ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-500')}>
        {count}
      </span>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function PatientList() {
  const { data: patients, isLoading, error } = usePatients();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const navigate = useNavigate();

  const counts = useMemo(() => {
    if (!patients) return { all: 0, high: 0, moderate: 0, low: 0, 'low-confidence': 0 };
    return {
      all: patients.length,
      high: patients.filter((p) => p.risk_severity === 'high' && p.confidence_score >= 0.4).length,
      moderate: patients.filter((p) => p.risk_severity === 'moderate' && p.confidence_score >= 0.4).length,
      low: patients.filter((p) => p.risk_severity === 'low' && p.confidence_score >= 0.4).length,
      'low-confidence': patients.filter((p) => p.confidence_score < 0.4).length,
    };
  }, [patients]);

  const filtered = useMemo(() => {
    if (!patients) return [];
    let list = [...patients];

    // Sort: high first, then moderate, then low; stale/low-conf last
    list.sort((a, b) => {
      const order = { high: 0, moderate: 1, low: 2 } as Record<Severity, number>;
      if (a.confidence_score < 0.4 && b.confidence_score >= 0.4) return 1;
      if (b.confidence_score < 0.4 && a.confidence_score >= 0.4) return -1;
      return order[a.risk_severity] - order[b.risk_severity];
    });

    if (filter === 'low-confidence') list = list.filter((p) => p.confidence_score < 0.4);
    else if (filter !== 'all') list = list.filter((p) => p.risk_severity === filter && p.confidence_score >= 0.4);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }

    return list;
  }, [patients, filter, search]);

  return (
    <div className="min-h-screen bg-slate-950 bg-grid">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm sticky top-[40px] z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">Patient Triage</h1>
                <p className="text-xs text-slate-500">Live risk dashboard · Updated every 60s</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="patient-search"
                type="text"
                placeholder="Search name or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <FilterChip label="All" active={filter === 'all'} count={counts.all} color="bg-slate-500" onClick={() => setFilter('all')} />
            <FilterChip label="High Risk" active={filter === 'high'} count={counts.high} color="bg-red-400" onClick={() => setFilter('high')} />
            <FilterChip label="Moderate" active={filter === 'moderate'} count={counts.moderate} color="bg-amber-400" onClick={() => setFilter('moderate')} />
            <FilterChip label="Low Risk" active={filter === 'low'} count={counts.low} color="bg-emerald-400" onClick={() => setFilter('low')} />
            <FilterChip label="Low Confidence" active={filter === 'low-confidence'} count={counts['low-confidence']} color="bg-slate-500" onClick={() => setFilter('low-confidence')} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 animate-fade-in">
        {isLoading && (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading patients…
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            <AlertTriangle className="w-5 h-5" />
            Failed to load patients. Check backend connection.
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              <span>Patient</span>
              <span>Risk Level</span>
              <span>Glucose</span>
              <span>Spike Risk</span>
              <span>ETA</span>
              <span>Twin Status</span>
              <span className="w-8" />
            </div>

            <div className="flex flex-col gap-2">
              {filtered.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-600 text-sm">
                  No patients match your current filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Patient Row ──────────────────────────────────────────────────────────

function PatientRow({ patient, onClick }: { patient: PatientSummary; onClick: () => void }) {
  const isLowConf = patient.confidence_score < 0.4;
  const probPct = Math.round(patient.spike_probability * 100);
  const probColor = probPct >= 70 ? '#ef4444' : probPct >= 40 ? '#f97316' : '#10b981';

  return (
    <button
      id={`patient-row-${patient.id}`}
      onClick={onClick}
      className={cn(
        'w-full text-left grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center',
        'px-4 py-4 rounded-xl border transition-all duration-150 group',
        'bg-slate-900/50 hover:bg-slate-800/70',
        isLowConf
          ? 'border-slate-700/40 opacity-75'
          : patient.risk_severity === 'high'
          ? 'border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]'
          : patient.risk_severity === 'moderate'
          ? 'border-amber-500/20 hover:border-amber-500/30'
          : 'border-slate-700/40 hover:border-slate-600/60'
      )}
    >
      {/* Patient info */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
          isLowConf ? 'bg-slate-800 text-slate-500' :
          patient.risk_severity === 'high' ? 'bg-red-500/15 text-red-300' :
          patient.risk_severity === 'moderate' ? 'bg-amber-500/15 text-amber-300' :
          'bg-emerald-500/15 text-emerald-300'
        )}>
          {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-slate-100 text-sm leading-tight">{patient.name}</p>
          <p className="text-xs text-slate-500 font-tabular">{patient.id} · {patient.age}y {patient.sex}</p>
          <RelativeTime isoString={patient.last_reading_at} />
        </div>
      </div>

      {/* Severity badge */}
      <div className="flex md:justify-start">
        <SeverityBadge severity={patient.risk_severity} confidence={patient.confidence_score} />
      </div>

      {/* Current glucose */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-tabular text-xl font-bold text-slate-100">
            {patient.current_glucose_mgdl}
          </span>
          <span className="text-xs text-slate-500">mg/dL</span>
          <TrendIcon trend={patient.trend} />
        </div>
        <GlucoseBar value={patient.current_glucose_mgdl} />
      </div>

      {/* Spike probability */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-tabular text-lg font-bold" style={{ color: probColor }}>{probPct}%</span>
        </div>
        <div className="h-1.5 w-20 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${probPct}%`, background: probColor }} />
        </div>
      </div>

      {/* ETA */}
      <div className="font-tabular text-sm">
        {patient.estimated_minutes_to_event ? (
          <span className="text-orange-300 font-semibold">
            ~{patient.estimated_minutes_to_event} min
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </div>

      {/* Twin status */}
      <div>
        <TwinStatusBadge status={patient.twin_status} />
        {isLowConf && (
          <p className="text-[10px] text-amber-500 mt-0.5 flex items-center gap-1">
            <WifiOff className="w-3 h-3" /> Sensor dropout
          </p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all hidden md:block" />
    </button>
  );
}
