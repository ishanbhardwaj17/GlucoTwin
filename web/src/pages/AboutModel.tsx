import { useNavigate } from 'react-router-dom';
import {
  Brain, BarChart3, Database, AlertTriangle, CheckCircle2,
  ArrowLeft, Cpu, Target, Clock, FlaskConical, BookOpen
} from 'lucide-react';
import { useModelInfo } from '@/api/client';
import { cn } from '@/lib/utils';

function MetricCard({ label, value, unit, icon, color, description }: {
  label: string; value: string | number; unit?: string; icon: React.ReactNode; color: string; description: string;
}) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div>
        <span className="font-tabular text-3xl font-black text-slate-100">{value}</span>
        {unit && <span className="text-sm text-slate-500 ml-1.5">{unit}</span>}
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function LimitationItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-800/40 last:border-0">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-800/40 last:border-0">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}

export function AboutModel() {
  const navigate = useNavigate();
  const { data: model, isLoading } = useModelInfo();

  const metrics = [
    {
      label: 'AUROC',
      value: model?.auroc ?? 0.86,
      description: 'Area Under ROC Curve for hyperglycemia spike classification (>180 mg/dL). Industry benchmark: >0.80.',
      icon: <BarChart3 className="w-5 h-5" style={{ color: '#818cf8' }} />,
      color: '#818cf8',
    },
    {
      label: 'MAE',
      value: model?.mae_mgdl ?? 10.3,
      unit: 'mg/dL',
      description: 'Mean Absolute Error for glucose forecast at 120-minute horizon. Clinical acceptability threshold: <15 mg/dL.',
      icon: <Target className="w-5 h-5" style={{ color: '#10b981' }} />,
      color: '#10b981',
    },
    {
      label: 'MARD',
      value: `${model?.mard_pct ?? 7.2}%`,
      description: 'Mean Absolute Relative Difference. ISO 15197 threshold for CGM devices: <15%. Model exceeds this.',
      icon: <FlaskConical className="w-5 h-5" style={{ color: '#f97316' }} />,
      color: '#f97316',
    },
    {
      label: 'Lead Time',
      value: `~${model?.lead_time_avg_min ?? 72}`,
      unit: 'min',
      description: 'Average advance warning time before clinically significant hyperglycemic events (>180 mg/dL).',
      icon: <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />,
      color: '#f59e0b',
    },
    {
      label: '±30 Accuracy',
      value: `${model?.accuracy_within_30 ?? 94.6}%`,
      description: 'Percentage of predictions within ±30 mg/dL of actual glucose at the 120-minute horizon.',
      icon: <CheckCircle2 className="w-5 h-5" style={{ color: '#34d399' }} />,
      color: '#34d399',
    },
    {
      label: 'Version',
      value: model?.model_version ?? 'v3.4.1',
      description: `Model last retrained: ${model ? new Date(model.retrained_at).toLocaleString() : 'N/A'}. Continuous online learning from new patient data.`,
      icon: <Cpu className="w-5 h-5" style={{ color: '#a78bfa' }} />,
      color: '#a78bfa',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 bg-grid">
      {/* Header */}
      <div className="sticky top-[40px] z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
            id="about-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Triage
          </button>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">About the Model</h1>
              <p className="text-xs text-slate-500">Architecture, metrics, and clinical limitations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8 animate-fade-in">

        {/* Model metrics grid */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Performance Metrics</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-5 h-36 animate-pulse bg-slate-800/40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {metrics.map((m) => (
                <MetricCard key={m.label} {...m} />
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Architecture */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Model Architecture</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
              <p>
                GlucoTwin is a{' '}
                <strong className="text-slate-200">probabilistic ensemble</strong> combining:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  'Temporal Convolutional Network (TCN) — captures long-range CGM dependencies',
                  'Gradient Boosted Trees (XGBoost) — encodes structured clinical features (labs, meds, demographics)',
                  'Gaussian Process posterior — calibrates prediction intervals (P10/P50/P90)',
                  'Bayesian online update — personalises per-patient weights from ≥7 days of data',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                Input features include 8-hour CGM window (32 readings × 15-min), meal logs, insulin on board, 
                heart rate variability, sleep quality index, HbA1c, eGFR, BMI, and circadian phase.
              </p>
              <p>
                The digital twin is <strong className="text-slate-200">personalized</strong> only after 7+ days of continuous data.
                During the learning phase, predictions fall back to population-level priors.
              </p>
            </div>
          </div>

          {/* Datasets */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Data Provenance</h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'OhioT1DM Dataset', desc: '12 T1DM patients, 8 weeks CGM+context, open-access', tag: 'External' },
                { name: 'MIMIC-IV Derived', desc: '4,200 T2DM admissions, processed glucose + medication records', tag: 'External' },
                { name: 'Synthetic Cohort', desc: '10,000 GPT-augmented patient trajectories for class balance', tag: 'Synthetic' },
                { name: 'Internal Pilot', desc: '48 T2DM subjects, 30-day CGM + activity wearables (IRB#2024-042)', tag: 'Proprietary' },
              ].map(({ name, desc, tag }) => (
                <div key={name} className="flex items-start justify-between gap-3 py-2 border-b border-slate-800/40 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border',
                    tag === 'External' ? 'bg-sky-500/10 text-sky-300 border-sky-500/20' :
                    tag === 'Synthetic' ? 'bg-violet-500/10 text-violet-300 border-violet-500/20' :
                    'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  )}>
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What it does well */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Model Strengths</h2>
            </div>
            <div>
              {[
                'Early-warning lead time of ~72 minutes outperforms rule-based CGM alarms (~15 min)',
                'Probabilistic intervals (P10–P90) enable risk-aware clinical decision support',
                'Handles missing sensor data via Gaussian imputation with explicit uncertainty inflation',
                'Personalizes to individual patient metabolic phenotype after 7 days',
                'Robust to common T2DM medications (SGLT2i, GLP-1, insulin, metformin)',
                'Real-time inference <50ms on CPU — no GPU required for edge deployment',
              ].map((t) => <FeatureItem key={t} text={t} />)}
            </div>
          </div>

          {/* Clinical limitations */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Clinical Limitations</h2>
            </div>
            <div>
              {[
                'Not validated in T1DM, paediatric populations, or patients on closed-loop insulin systems',
                'Performance degrades with <60% CGM coverage — sensor dropout elevates uncertainty significantly',
                'Does not account for acute illness, corticosteroid administration, or surgery',
                'What-If scenarios are simplistic models — actual glucose response varies significantly per individual',
                'Model was trained on predominantly South Asian and Caucasian cohorts — generalisation to other ethnicities is unknown',
                'This prototype has NOT undergone clinical validation trials. Regulatory clearance (CE/FDA) has NOT been sought.',
              ].map((t) => <LimitationItem key={t} text={t} />)}
            </div>
          </div>
        </div>

        {/* References */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60 mb-4">
            <div className="w-7 h-7 rounded-lg bg-slate-700/50 border border-slate-600/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Key References</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Marling & Bunescu (2020). The OhioT1DM Dataset. ECAI Workshop.',
              'Martinsson et al. (2020). Automatic blood glucose prediction with confidence using recurrent neural networks. KDD Workshop.',
              'Woldaregay et al. (2019). Data-driven blood glucose pattern classification. Journal of Medical Internet Research.',
              'Lago et al. (2023). Probabilistic glucose forecasting using deep ensembles. npj Digital Medicine.',
            ].map((ref, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-500 p-3 bg-slate-900/40 rounded-lg">
                <span className="font-tabular text-slate-600 shrink-0">[{i + 1}]</span>
                {ref}
              </div>
            ))}
          </div>
        </div>

        {/* Ethical disclaimer */}
        <div className="p-5 bg-red-950/30 border border-red-500/20 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-red-300">Ethical & Regulatory Disclaimer</p>
            <p className="text-sm text-red-300/70 leading-relaxed">
              GlucoTwin is a research prototype developed for demonstration purposes only. All patient data displayed is fully synthetic.
              This system has not been approved by any regulatory body for clinical use and must not be used to make or influence 
              actual clinical decisions. Always consult a qualified healthcare professional for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
