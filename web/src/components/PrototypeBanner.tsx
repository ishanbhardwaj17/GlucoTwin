import { ShieldAlert } from 'lucide-react';

export function PrototypeBanner() {
  return (
    <div
      role="banner"
      aria-label="Research prototype warning"
      className="w-full bg-amber-950/80 border-b border-amber-500/40 backdrop-blur-sm z-50 sticky top-0"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center justify-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs font-medium text-amber-300 tracking-wide text-center">
          <span className="font-semibold text-amber-200">Research Prototype.</span>{' '}
          Synthetic data only · Model predictions are not validated for clinical use ·{' '}
          <span className="font-semibold text-amber-200">Not for clinical use.</span>
        </p>
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
      </div>
    </div>
  );
}
