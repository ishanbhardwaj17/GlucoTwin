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
    <button onClick={onClick} className={cn("relative px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-all border border-transparent rounded-full", active ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "text-white/40 hover:text-white hover:border-white/20")}>
      <span className="flex items-center gap-3">
        {label}
        <span className={cn('text-[10px] px-2 py-0.5 border rounded-full', active ? 'border-black/20 text-black' : 'border-white/20 text-white/40')}>{count}</span>
      </span>
    </button>
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
        
        <TextReveal className="font-display text-[12vw] md:text-[9rem] leading-[0.85] tracking-tight text-white uppercase mb-12">
          PREDICTIVE TELEMETRY
        </TextReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <FadeUp delay={0.4}>
            <p className="text-white/60 text-xl leading-relaxed max-w-lg font-medium mix-blend-difference">
              Real-time metabolic forecasting designed for clinical precision. Identify hyperglycemic risks hours before they manifest.
            </p>
          </FadeUp>
          
          <FadeUp delay={0.6} className="flex gap-16 md:justify-end mix-blend-difference">
            <div>
              <p className="text-white/50 text-xs font-mono uppercase tracking-widest mb-2 border-b border-white/20 pb-2">Monitored</p>
              <p className="font-display text-6xl text-white"><CountUp to={counts.all} /></p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-mono uppercase tracking-widest mb-2 border-b border-white/20 pb-2">Critical</p>
              <p className="font-display text-6xl text-white"><CountUp to={counts.high} /></p>
            </div>
          </FadeUp>
        </div>
      </div>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }} className="max-w-[1800px] mx-auto px-12 py-4 relative z-40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div whileFocus={{ scale: 1.02 }} className="flex items-center gap-3 w-full md:w-96 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 transition-transform origin-left">
            <Search className="w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="SEARCH PATIENTS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-white font-mono uppercase tracking-widest placeholder-white/40 focus:outline-none"
            />
          </motion.div>
          <div className="flex items-center overflow-x-auto gap-4 w-full md:w-auto hide-scrollbar">
            <FilterTab label="All" active={filter === 'all'} count={counts.all} onClick={() => setFilter('all')} />
            <FilterTab label="Critical" active={filter === 'high'} count={counts.high} onClick={() => setFilter('high')} />
            <FilterTab label="Elevated" active={filter === 'moderate'} count={counts.moderate} onClick={() => setFilter('moderate')} />
            <FilterTab label="Nominal" active={filter === 'low'} count={counts.low} onClick={() => setFilter('low')} />
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1800px] mx-auto px-12 pt-12 pb-32">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-16 h-16 border-t-2 border-white rounded-full" />
          </div>
        ) : (
          <StaggerContainer className="flex overflow-x-auto pb-24 pt-12 gap-12 hide-scrollbar items-center perspective-[1500px]" delay={0.2}>
            <AnimatePresence mode="popLayout">
              {filtered.map((patient) => (
                <motion.div 
                  key={patient.id} 
                  className="shrink-0 w-[450px]"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5, zIndex: 50 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <PatientCard patient={patient} onClick={() => navigate(`/patients/${patient.id}`)} />
                </motion.div>
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
      className="s-tier-card cursor-pointer group flex flex-col justify-between min-h-[500px] p-8"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="font-display text-5xl text-white leading-[0.85] tracking-tight uppercase">
            {patient.name}
          </h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest mt-4">
            ID: {patient.id} • {patient.age}Y
          </p>
        </div>
        <SeverityBadge severity={patient.risk_severity} confidence={patient.confidence_score} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 border-t border-white/20 pt-6">
        <div>
          <p className="text-white/50 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">Live Glucose</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-5xl text-white leading-none tracking-tight">{patient.current_glucose_mgdl}</span>
          </div>
        </div>
        <div>
          <p className="text-white/50 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">Spike Risk</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-5xl text-white leading-none tracking-tight">{probPct}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="w-full h-px bg-white/20 my-6 relative overflow-hidden">
          <motion.div className="absolute inset-0 bg-white" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-white/50">
        <span>{patient.mrn}</span>
        <span>ENTER SIMULATION ↗</span>
      </div>
    </motion.div>
  );
}
