import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { usePatients } from '@/api/client';
import type { PatientSummary } from '@/types/schema';
import { cn } from '@/lib/utils';
import { StaggerContainer, staggerItem } from './Animations';

function FilterPill({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick} 
      className={cn("px-5 py-2 font-bold text-sm transition-all rounded-full flex items-center gap-2 border", active ? "bg-black text-white border-black shadow-[0_10px_20px_rgba(0,0,0,0.2)]" : "bg-white/50 text-black/60 border-black/5 hover:bg-white hover:text-black shadow-sm")}
    >
      {label}
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-black', active ? 'bg-white/20 text-white' : 'bg-black/10 text-black/60')}>{count}</span>
    </motion.button>
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
    <div className="relative pb-32 max-w-[1600px] mx-auto px-6">
      
      {/* Insane Hyper-Animated Hero */}
      <div className="py-24 md:py-40 text-center max-w-6xl mx-auto relative perspective-[1000px]">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl -z-10 rounded-full floating-element" />
        
        <motion.h1 
          initial={{ opacity: 0, y: 100, rotateX: 45, scale: 0.8 }} 
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} 
          transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
          className="text-6xl md:text-[8rem] lg:text-[140px] leading-[0.8] tracking-tighter font-black text-black drop-shadow-2xl"
        >
          <span className="floating-element inline-block mr-4">Motion</span>
          <span className="floating-element-delayed inline-block">Graphics</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }} 
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
          transition={{ duration: 1.5, delay: 0.3, type: "spring" }}
          className="text-2xl md:text-5xl text-black/60 mt-16 font-bold tracking-tight max-w-4xl mx-auto leading-tight"
        >
          GlucoTwin, the first forecasting engine where clinicians can see the future right on the timeline.
        </motion.p>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: 'spring', bounce: 0.5 }} className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 floating-element-fast">
        <motion.div whileFocus={{ scale: 1.05 }} className="flex items-center gap-3 w-full md:w-96 glass-pill px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.06)] bg-white border border-black/5">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}><Search className="w-6 h-6 text-black/40" /></motion.div>
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

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
           <motion.div animate={{ rotate: 360, borderRadius: ["20%", "50%", "20%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 border-8 border-black/5 border-t-black shadow-[0_0_50px_rgba(0,0,0,0.2)]" />
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" delay={0.8}>
          <AnimatePresence mode="popLayout">
            {filtered.map((patient, i) => (
              <motion.div 
                key={patient.id} 
                variants={staggerItem} 
                layout 
                className={cn("floating-element", i % 2 === 0 ? "floating-element" : "floating-element-delayed")}
              >
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
    <motion.div 
      whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick} 
      className="glass-card cursor-pointer group flex flex-col justify-between min-h-[420px] p-8 overflow-hidden relative bg-white border border-white"
    >
      {/* Animated Gradient Orb in Card */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
        className={cn("absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl z-0", isCritical ? "bg-red-500" : "bg-blue-400")} 
      />

      {isCritical && (
        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
      )}
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-4xl font-black tracking-tighter text-black group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {patient.name}
          </h3>
          <p className="text-sm text-black/50 font-bold mt-2 tracking-wide uppercase">
            MRN: {patient.mrn} • {patient.age}Y
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/[0.03] rounded-3xl p-5 border border-black/5 shadow-inner">
            <p className="text-black/40 text-xs font-bold uppercase tracking-widest mb-3">Live Glucose</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter text-black">{patient.current_glucose_mgdl}</span>
            </div>
          </div>
          <div className={cn("rounded-3xl p-5 border border-black/5 shadow-inner transition-colors duration-500", isCritical ? "bg-red-500/10 border-red-500/20" : "bg-black/[0.03]")}>
            <p className={cn("text-xs font-bold uppercase tracking-widest mb-3", isCritical ? "text-red-600" : "text-black/40")}>Spike Risk</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-5xl font-black tracking-tighter", isCritical ? "text-red-600" : "text-black")}>{probPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between relative z-10">
        {patient.estimated_minutes_to_event ? (
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xs font-black bg-black text-white px-5 py-3 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] tracking-widest uppercase">
            ETA {patient.estimated_minutes_to_event} MIN
          </motion.div>
        ) : <span/>}
        <motion.div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform">
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-2xl font-black">→</motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
