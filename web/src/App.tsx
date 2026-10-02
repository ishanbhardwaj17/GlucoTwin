import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PrototypeBanner } from '@/components/PrototypeBanner';
import { PatientList } from '@/components/PatientList';
import { PatientDetail } from '@/components/PatientDetail';
import { AboutModel } from '@/pages/AboutModel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

// ─── App Shell ─────────────────────────────────────────────────────────────

function AppShell() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="min-h-screen animated-bg text-[#0a0a0a] font-sans selection:bg-white selection:text-black overflow-hidden">
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <PrototypeBanner />
      </motion.div>

      {/* Editorial Nav */}
      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
        className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b-2 border-black shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
      >
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
      </motion.nav>

      {/* Page content */}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}><PatientList /></motion.div>} />
          <Route path="/patients/:id" element={<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}><PatientDetail /></motion.div>} />
          <Route path="/about" element={<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}><AboutModel /></motion.div>} />
        </Routes>
      </AnimatePresence>
    </motion.div>
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
