import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { usePatients } from '@/api/client';
import type { PatientSummary, Severity } from '@/types/schema';
import { cn } from '@/lib/utils';
import { StaggerContainer, staggerItem } from './Animations';

function FilterPill({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("px-5 py-2 font-medium text-sm transition-all rounded-full flex items-center gap-2 border", active ? "bg-black text-white border-black shadow-lg shadow-black/10 scale-105" : "bg-transparent text-black/60 border-transparent hover:bg-black/5 hover:text-black")}>
      {label}
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full', active ? 'bg-white/20 text-white' : 'bg-black/10 text-black/60')}>{count}</span>
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
    if (filter !== 'all') list = list.filter((p) => p.risk_severity === filter && p.confidence_score >= 0.4);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list;
  }, [patients, filter, search]);

  return (
    <div className="relative pb-32 max-w-7xl mx-auto px-6">
      
      {/* Massive Butter-style Hero */}
      <div className="py-24 md:py-40 text-center max-w-6xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-[100px] leading-[0.9] tracking-tighter font-medium text-black"
        >
          Engineered for <span className="inline-pill bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-600/30 -translate-y-2 lg:-translate-y-4">Precision</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-3xl text-black/50 mt-12 font-medium tracking-tight"
        >
          GlucoTwin, the first forecasting engine <br className="hidden md:block"/> where clinicians can see the future <span className="inline-pill bg-black !px-3 !py-0 !text-xl !mx-1 animate-pulse text-white">⚡</span> right on the timeline.
        </motion.p>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }} className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3 w-full md:w-96 glass-pill px-6 py-3">
          <Search className="w-5 h-5 text-black/40" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-black font-medium tracking-wide placeholder-black/40 focus:outline-none"
          />
        </div>
        <div className="flex items-center overflow-x-auto gap-2 w-full md:w-auto hide-scrollbar p-1 glass-pill">
          <FilterPill label="All Patients" active={filter === 'all'} count={counts.all} onClick={() => setFilter('all')} />
          <FilterPill label="Critical Risk" active={filter === 'high'} count={counts.high} onClick={() => setFilter('high')} />
          <FilterPill label="Elevated" active={filter === 'moderate'} count={counts.moderate} onClick={() => setFilter('moderate')} />
          <FilterPill label="Nominal" active={filter === 'low'} count={counts.low} onClick={() => setFilter('low')} />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
           <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" delay={0.5}>
          <AnimatePresence mode="popLayout">
            {filtered.map((patient) => (
              <motion.div key={patient.id} variants={staggerItem} layout>
                <PatientCard patient={patient} onClick={() => navigate(`/patients/${patient.id}`)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </StaggerContainer>
      )}
    </div>
  );
}

function PatientCard({ patient, onClick }: { patient: PatientSummary; onClick: () => void }) {
  const probPct = Math.round(patient.spike_probability * 100);
  const isCritical = patient.risk_severity === 'high' && patient.confidence_score >= 0.4;

  return (
    <div onClick={onClick} className="glass-card cursor-pointer group flex flex-col justify-between min-h-[380px] p-8 overflow-hidden relative">
      {isCritical && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
      )}
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-black group-hover:text-blue-600 transition-colors">
            {patient.name}
          </h3>
          <p className="text-sm text-black/50 font-medium mt-1">
            MRN: {patient.mrn} • {patient.age}Y
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/5 rounded-2xl p-4">
            <p className="text-black/50 text-xs font-semibold uppercase tracking-wider mb-2">Live Glucose</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter text-black">{patient.current_glucose_mgdl}</span>
              <span className="text-sm font-medium text-black/50">mg/dL</span>
            </div>
          </div>
          <div className={cn("rounded-2xl p-4 transition-colors duration-500", isCritical ? "bg-red-500/10" : "bg-black/5")}>
            <p className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isCritical ? "text-red-600" : "text-black/50")}>Spike Risk</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-4xl font-bold tracking-tighter", isCritical ? "text-red-600" : "text-black")}>{probPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between relative z-10">
        {patient.estimated_minutes_to_event ? (
          <div className="text-xs font-bold bg-black text-white px-4 py-2 rounded-full shadow-lg shadow-black/20">
            ETA {patient.estimated_minutes_to_event} MIN
          </div>
        ) : <span/>}
        <div className="text-sm font-semibold text-black/40 group-hover:text-black transition-colors flex items-center gap-2">
          View Profile <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </div>
  );
}
