import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Brain, Users, Info, Activity } from 'lucide-react';
import { PrototypeBanner } from '@/components/PrototypeBanner';
import { PatientList } from '@/components/PatientList';
import { PatientDetail } from '@/components/PatientDetail';
import { AboutModel } from '@/pages/AboutModel';
import { cn } from '@/lib/utils';

// ─── Query client ──────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── App Shell ─────────────────────────────────────────────────────────────

function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Non-dismissible prototype banner */}
      <PrototypeBanner />

      {/* Navigation */}
      <nav className="border-b border-slate-800/60 bg-slate-950/95 backdrop-blur-sm z-30 sticky top-[40px]">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-100 tracking-tight">Gluco</span>
              <span className="font-black text-lg text-gradient-brand tracking-tight">Twin</span>
            </div>
            <span className="hidden sm:inline-block text-xs text-slate-600 border border-slate-700/50 px-2 py-0.5 rounded-full font-tabular">
              T2D Digital Twin
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              id="nav-triage"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                )
              }
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Triage</span>
            </NavLink>

            <NavLink
              to="/about"
              id="nav-about"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                )
              }
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">About Model</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <Routes>
        <Route path="/" element={<PatientList />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/about" element={<AboutModel />} />
      </Routes>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
