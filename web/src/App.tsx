import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { PatientList } from "@/components/PatientList";
import { PatientDetail } from "@/components/PatientDetail";
import { AboutModel } from "@/pages/AboutModel";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

function AppShell() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} className="min-h-screen text-[#111] font-sans selection:bg-black selection:text-white overflow-hidden relative">
      
      {/* Floating Pill Nav */}
      <motion.div className="fixed w-full top-8 z-50 px-6 flex justify-center pointer-events-none" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}>
        <div className="glass-pill px-8 h-16 flex items-center justify-between gap-12 pointer-events-auto w-full max-w-5xl">
          <NavLink to="/" className="font-display font-bold text-2xl tracking-tighter">GlucoTwin</NavLink>
          <div className="flex items-center gap-8 font-medium text-sm text-black/60">
            <NavLink to="/" className={({isActive}) => isActive ? "text-black" : "hover:text-black transition-colors"}>Patients</NavLink>
            <NavLink to="/about" className={({isActive}) => isActive ? "text-black" : "hover:text-black transition-colors"}>Model Architecture</NavLink>
            <div className="w-px h-4 bg-black/10" />
            <a href="#" className="text-black bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full transition-colors">Log In</a>
            <a href="#" className="text-white bg-black hover:bg-black/80 shadow-lg px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95">Book Demo</a>
          </div>
        </div>
      </motion.div>

      {/* Page content */}
      <div className="pt-40 min-h-screen pb-32">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<motion.div key="home" initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}><PatientList /></motion.div>} />
            <Route path="/patients/:id" element={<motion.div key="detail" initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}><PatientDetail /></motion.div>} />
            <Route path="/about" element={<motion.div key="about" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}><AboutModel /></motion.div>} />
          </Routes>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppShell />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
