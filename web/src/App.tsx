import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PrototypeBanner } from '@/components/PrototypeBanner';
import { PatientList } from '@/components/PatientList';
import { PatientDetail } from '@/components/PatientDetail';
import { AboutModel } from '@/pages/AboutModel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

// ─── App Shell ─────────────────────────────────────────────────────────────

function AppShell() {
  return (
    <div className="min-h-screen bg-[#e8e5df] text-[#0a0a0a] font-sans selection:bg-black selection:text-[#e8e5df]">
      <PrototypeBanner />

      {/* Editorial Nav */}
      <nav className="sticky top-[28px] z-50 bg-[#e8e5df]/90 backdrop-blur-md border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-4 group hover-target">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-8 h-8 bg-black flex items-center justify-center font-display text-[#e8e5df] text-lg leading-none pt-1"
            >
              GT
            </motion.div>
            <span className="font-display text-4xl tracking-tighter text-black uppercase mt-2 group-hover:tracking-widest transition-all duration-500">
              GlucoTwin
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'text-sm font-bold uppercase tracking-widest transition-colors',
                  isActive ? 'text-black border-b-2 border-black pb-1' : 'text-black/50 hover:text-black'
                )
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                cn(
                  'text-sm font-bold uppercase tracking-widest transition-colors',
                  isActive ? 'text-black border-b-2 border-black pb-1' : 'text-black/50 hover:text-black'
                )
              }
            >
              Methodology
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
