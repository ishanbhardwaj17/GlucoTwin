import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TextReveal, FadeUp, CountUp, AnimatedLine, Marquee, StaggerContainer, staggerChild, GlowOrb, SpinningRing } from '@/components/Animations';
import { ParticleField } from '@/components/ParticleField';
import { cn } from '@/lib/utils';

export function AboutModel() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-32">
      <ParticleField />

      {/* ── Hero ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-20">
        <FadeUp>
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#d4ff00] mb-6">
            System Specifications
          </p>
        </FadeUp>

        <TextReveal className="font-grotesk text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.9] tracking-tighter text-white mb-8">
          Correctness is a design choice.
        </TextReveal>

        <FadeUp delay={0.4}>
          <p className="max-w-2xl text-zinc-500 text-lg leading-relaxed">
            GlucoTwin is a probabilistic ensemble that forecasts hyperglycemic
            spikes 2 hours into the future. Every prediction ships with calibrated
            uncertainty — because a number without confidence is just noise.
          </p>
        </FadeUp>
      </div>

      <AnimatedLine className="h-px max-w-6xl mx-auto" />

      {/* ── Performance Numbers ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        <FadeUp>
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-12">
            Benchmark Results
          </p>
        </FadeUp>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900">
          {[
            { label: 'AUROC', value: 86, suffix: '%', desc: 'Spike classification' },
            { label: 'MAE', value: 10, suffix: ' mg/dL', desc: '120-min horizon' },
            { label: 'Lead Time', value: 72, suffix: 'min', desc: 'Avg advance warning' },
            { label: '±30 Accuracy', value: 94, suffix: '%', desc: 'Within 30mg/dL' },
          ].map((m, i) => (
            <FadeUp key={m.label} delay={i * 0.1}>
              <div className="bg-black p-8 h-full">
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-4">{m.label}</p>
                <p className="font-grotesk text-6xl font-bold tracking-tighter leading-none text-white">
                  <CountUp to={m.value} suffix={m.suffix} />
                </p>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-4">{m.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      {/* Marquee Banner */}
      <div className="relative z-10 py-6 border-y border-zinc-900 overflow-hidden">
        <Marquee speed={25}>
          {['AUROC 86%', 'MAE 10mg/dL', 'LATENCY <50ms', 'LEAD TIME 72min', '±30 ACCURACY 94%', 'PERSONALIZED AFTER 7 DAYS'].map((text) => (
            <span key={text} className="font-mono text-[10px] text-zinc-700 uppercase tracking-[0.4em] mx-12">{text}</span>
          ))}
        </Marquee>
      </div>

      <AnimatedLine className="h-px max-w-6xl mx-auto" delay={0.2} />

      {/* ── Architecture Section ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <FadeUp>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#d4ff00] mb-6">
                02 · Architecture
              </p>
            </FadeUp>

            <TextReveal className="font-grotesk text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-white mb-8">
              Four models. One prediction.
            </TextReveal>

            <FadeUp delay={0.3}>
              <p className="text-zinc-500 leading-relaxed mb-8">
                The ensemble fuses temporal convolutions for CGM patterns, gradient-boosted
                trees for structured clinical features, a Gaussian Process for uncertainty
                calibration, and a Bayesian online update for per-patient personalization.
              </p>
            </FadeUp>
          </div>

          <FadeUp delay={0.2}>
            <motion.div
              className="bg-zinc-950 border border-zinc-800 p-6 font-mono text-[11px] text-zinc-400 leading-loose relative overflow-hidden group"
              whileHover={{ borderColor: 'rgba(212,255,0,0.15)' }}
            >
              {/* Ambient glow */}
              <GlowOrb size={200} color="from-[#d4ff00]/5 to-emerald-500/5" className="-top-20 -right-20" delay={1} />

              <motion.p
                className="text-[#d4ff00] mb-4"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                $ glucotwin --describe-architecture
              </motion.p>
              <p className="text-zinc-600">┌────────────────────────────────┐</p>
              {[
                { name: 'Temporal Conv Network', abbr: 'TCN', desc: '→ long-range CGM deps' },
                { name: 'XGBoost', abbr: 'GBT', desc: '→ structured features' },
                { name: 'Gaussian Process', abbr: 'GP', desc: '→ P10/P50/P90 intervals' },
                { name: 'Bayesian Online', abbr: 'BOL', desc: '→ per-patient weights' },
              ].map((row, i) => (
                <motion.p
                  key={row.abbr}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  │ <span className="text-white">{row.name.padEnd(20)}</span> ({row.abbr}){'   '}│ {row.desc}
                </motion.p>
              ))}
              <p className="text-zinc-600">└────────────────────────────────┘</p>
              <p className="mt-4">Inference latency .... <span className="text-[#d4ff00]">&lt;50ms</span> (CPU)</p>
              <p>Personalization .... after <span className="text-white">7 days</span> of data</p>
              <p>Input window ........ <span className="text-white">8h</span> (32 CGM readings)</p>
              <motion.p
                className="mt-4 text-zinc-600"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                status ........... <span className="text-[#d4ff00]">stable</span>
              </motion.p>
              <motion.span
                className="text-zinc-600"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >_</motion.span>
            </motion.div>
          </FadeUp>
        </div>
      </div>

      <AnimatedLine className="h-px max-w-6xl mx-auto" delay={0.2} />

      {/* ── Data Sources ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        <FadeUp>
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#d4ff00] mb-6">
            03 · Data Provenance
          </p>
        </FadeUp>

        <TextReveal className="font-grotesk text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-white mb-12">
          Trust starts with the data.
        </TextReveal>

        <StaggerContainer className="space-y-0">
          {[
            { name: 'OhioT1DM', desc: '12 patients · 8 weeks CGM + context · open-access', tag: 'EXT' },
            { name: 'MIMIC-IV Derived', desc: '4,200 T2DM admissions · glucose + medication records', tag: 'EXT' },
            { name: 'Synthetic Cohort', desc: '10,000 augmented trajectories for class balance', tag: 'SYN' },
            { name: 'Internal Pilot', desc: '48 T2DM subjects · 30-day CGM + wearables · IRB#2024-042', tag: 'INT' },
          ].map((d) => (
            <motion.div key={d.name} variants={staggerChild} className="flex items-center justify-between py-5 border-b border-zinc-900 group hover:pl-4 transition-all duration-300">
              <div>
                <p className="font-grotesk text-xl font-bold text-white group-hover:text-[#d4ff00] transition-colors">{d.name}</p>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-1">{d.desc}</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest border border-zinc-800 px-3 py-1">{d.tag}</span>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>

      <AnimatedLine className="h-px max-w-6xl mx-auto" delay={0.2} />

      {/* ── Limitations ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <FadeUp>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-red-500 mb-6">
                04 · Known Limitations
              </p>
            </FadeUp>

            <TextReveal className="font-grotesk text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-white mb-8">
              What the model cannot do.
            </TextReveal>

            <FadeUp delay={0.3}>
              <p className="text-zinc-500 leading-relaxed">
                No model is complete. These are the boundaries we know about — and the ones
                we haven't found yet are the ones that matter most.
              </p>
            </FadeUp>
          </div>

          <StaggerContainer delay={0.2} className="space-y-0">
            {[
              'Not validated for T1DM, paediatric, or closed-loop insulin populations',
              'Degrades below 60% CGM sensor coverage',
              'Does not account for acute illness, steroids, or surgery',
              'What-If scenarios use simplified metabolic models',
              'Trained on South Asian + Caucasian cohorts — generalisation unknown',
              'Not FDA/CE cleared. Not for clinical use.',
            ].map((text) => (
              <motion.div key={text} variants={staggerChild} className="flex items-start gap-4 py-4 border-b border-zinc-900">
                <span className="font-mono text-red-500 text-sm leading-none mt-1">!</span>
                <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </div>

      <AnimatedLine className="h-px max-w-6xl mx-auto" delay={0.2} />

      {/* ── Disclaimer ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        <FadeUp>
          <div className="bg-zinc-950 border border-red-900/30 p-8">
            <p className="font-mono text-[10px] text-red-500 uppercase tracking-widest mb-4">Regulatory Disclaimer</p>
            <p className="text-zinc-400 leading-relaxed max-w-3xl">
              GlucoTwin is a research prototype. All patient data is synthetic. This system has not
              been approved by any regulatory body and must not influence clinical decisions. Always
              consult a qualified healthcare professional.
            </p>
          </div>
        </FadeUp>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-12 border-t border-zinc-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-12">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full border border-zinc-700 border-t-[#d4ff00]"
            />
            <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
              © 2026 GlucoTwin · Built for the parts that fail.
            </p>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="font-mono text-[10px] text-zinc-600 hover:text-[#d4ff00] uppercase tracking-widest transition-colors animated-underline">Triage →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
