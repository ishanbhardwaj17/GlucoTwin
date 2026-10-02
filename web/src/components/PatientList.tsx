import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { usePatients } from '@/api/client';
import type { PatientSummary, Severity } from '@/types/schema';
import { cn } from '@/lib/utils';
import { FadeUp, CountUp, Marquee, StaggerContainer, staggerItem, TextReveal } from './Animations';

function SeverityBadge({ severity, confidence }: { severity: Severity; confidence: number }) {
  if (confidence < 0.4) {
    return <div className="border border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black/50">Unstable</div>;
  }
  const config = {
    high: { label: 'Critical', cls: 'bg-black text-[#e8e5df]' },
    moderate: { label: 'Elevated', cls: 'bg-black/10 text-black border border-black' },
    low: { label: 'Nominal', cls: 'bg-transparent text-black border border-black/20' },
  }[severity];

  return <div className={cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest', config.cls)}>{config.label}</div>;
}

function FilterTab({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("relative px-6 py-3 font-bold uppercase tracking-widest text-sm transition-all border-x border-transparent", active ? "text-black bg-black/5 border-black/10" : "text-black/40 hover:text-black")}>
      <span className="flex items-center gap-3">
        {label}
        <span className={cn('text-[10px] px-2 py-0.5 border', active ? 'border-black text-black' : 'border-black/20 text-black/40')}>{count}</span>
      </span>
      {active && <motion.div layoutId="filterUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-black" />}
    </button>
  );
}

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
    list.sort((a, b) => {
      const order = { high: 0, moderate: 1, low: 2 } as Record<Severity, number>;
      if (a.confidence_score < 0.4 && b.confidence_score >= 0.4) return 1;
      if (b.confidence_score < 0.4 && a.confidence_score >= 0.4) return -1;
      return order[a.risk_severity] - order[b.risk_severity];
    });
    if (filter !== 'all') list = list.filter((p) => p.risk_severity === filter && p.confidence_score >= 0.4);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list;
  }, [patients, filter, search]);

  return (
    <div className="relative pb-32">
      <Marquee className="border-b-2 border-black py-3 bg-black text-[#e8e5df]" speed={50}>
        <div className="flex items-center gap-12 font-bold uppercase tracking-widest text-sm">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#e8e5df] animate-pulse"/> SYSTEM ONLINE</span>
          <span>ENSEMBLE AUROC: <span className="font-display text-lg mt-0.5">0.86</span></span>
          <span>LATENCY: 24MS</span>
          <span>HORIZON: 120 MIN</span>
          <span>PREDICTIVE TELEMETRY ACTIVE</span>
        </div>
      </Marquee>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 border-b-2 border-black">
        
        <TextReveal className="font-display text-[12vw] md:text-[9rem] leading-[0.85] tracking-tight text-black uppercase mb-12">
          PREDICTIVE TELEMETRY
        </TextReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <FadeUp delay={0.4}>
            <p className="text-black/60 text-xl leading-relaxed max-w-lg font-medium">
              Real-time metabolic forecasting designed for clinical precision. Identify hyperglycemic risks hours before they manifest.
            </p>
          </FadeUp>
          
          <FadeUp delay={0.6} className="flex gap-16 md:justify-end">
            <div>
              <p className="text-black/50 text-xs font-bold uppercase tracking-widest mb-2 border-b border-black/20 pb-2">Monitored</p>
              <p className="font-display text-6xl text-black"><CountUp to={counts.all} /></p>
            </div>
            <div>
              <p className="text-black/50 text-xs font-bold uppercase tracking-widest mb-2 border-b border-black/20 pb-2">Critical</p>
              <p className="font-display text-6xl text-black"><CountUp to={counts.high} /></p>
            </div>
          </FadeUp>
        </div>
      </div>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }} className="max-w-7xl mx-auto px-6 py-0 sticky top-[108px] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-0">
          <motion.div whileFocus={{ scale: 1.02 }} className="flex items-center gap-3 w-full md:w-96 border-r border-slate-200 px-6 py-4 transition-transform origin-left">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="SEARCH PATIENTS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-black font-bold uppercase tracking-widest placeholder-black/40 focus:outline-none"
            />
          </motion.div>
          <div className="flex items-center overflow-x-auto w-full md:w-auto hide-scrollbar">
            <FilterTab label="All" active={filter === 'all'} count={counts.all} onClick={() => setFilter('all')} />
            <FilterTab label="Critical" active={filter === 'high'} count={counts.high} onClick={() => setFilter('high')} />
            <FilterTab label="Elevated" active={filter === 'moderate'} count={counts.moderate} onClick={() => setFilter('moderate')} />
            <FilterTab label="Nominal" active={filter === 'low'} count={counts.low} onClick={() => setFilter('low')} />
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-black/20 border-t-black animate-spin" />
          </motion.div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            <AnimatePresence mode="popLayout">
              {filtered.map((patient) => (
                <PatientCard key={patient.id} patient={patient} onClick={() => navigate(`/patients/${patient.id}`)} />
              ))}
            </AnimatePresence>
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}

function PatientCard({ patient, onClick }: { patient: PatientSummary; onClick: () => void }) {
  const probPct = Math.round(patient.spike_probability * 100);

  return (
    <motion.div
      layout
      variants={staggerItem}
      onClick={onClick}
      className="relative cursor-pointer group flex flex-col justify-between min-h-[260px] bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-sky-100 hover:-translate-y-1 transition-all duration-300 p-6"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="font-display text-5xl text-black leading-[0.85] tracking-tight uppercase group-hover:underline decoration-4 underline-offset-4">
            {patient.name}
          </h3>
          <p className="text-xs text-black/60 font-bold uppercase tracking-widest mt-4">
            ID: {patient.id} • {patient.age}Y
          </p>
        </div>
        <SeverityBadge severity={patient.risk_severity} confidence={patient.confidence_score} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 border-t border-black/20 pt-6">
        <div>
          <p className="text-black/50 text-[10px] font-bold uppercase tracking-widest mb-1">Live Glucose</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl text-black leading-none tracking-tight">{patient.current_glucose_mgdl}</span>
          </div>
        </div>
        <div>
          <p className="text-black/50 text-[10px] font-bold uppercase tracking-widest mb-1">Spike Risk</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl text-black leading-none tracking-tight">{probPct}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        {patient.estimated_minutes_to_event ? (
          <div className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2 border border-black px-3 py-1 bg-black/5">
            ETA {patient.estimated_minutes_to_event}M
          </div>
        ) : <span/>}
        <div className="w-12 h-12 bg-black text-[#e8e5df] flex items-center justify-center transform -rotate-45 group-hover:rotate-0 transition-transform duration-500 ease-[0.34,1.56,0.64,1]">
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </div>
      </div>
    </motion.div>
  );
}
