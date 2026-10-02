import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PatientList } from "@/components/PatientList";
import { PatientDetail } from "@/components/PatientDetail";
import { AboutModel } from "@/pages/AboutModel";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

// A floating orb in the background that follows the mouse slowly
function AmbientCursor() {
  useEffect(() => {
    const cursor = document.getElementById('ambient-cursor');
    const moveCursor = (e: MouseEvent) => {
      if (cursor) {
        cursor.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);
  
  return (
    <div 
      id="ambient-cursor" 
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 blur-3xl pointer-events-none z-[-1] transition-transform duration-1000 ease-out will-change-transform"
    />
  );
}

function AppShell() {
  const location = useLocation();
  
  // Catch-all redirect is handled by Routes
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} className="min-h-screen text-[#111] font-sans selection:bg-black selection:text-white overflow-hidden relative">
      <AmbientCursor />
      
      {/* Floating Pill Nav */}
      <motion.div className="absolute w-full top-8 z-50 px-6 flex justify-center pointer-events-none floating-element-fast" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}>
        <div className="glass-pill px-8 h-16 flex items-center justify-between gap-12 pointer-events-auto w-full max-w-5xl shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-8 font-semibold text-sm text-black/60 w-full justify-center">
            <NavLink to="/" className={({isActive}) => isActive ? "text-black drop-shadow-md scale-105 transition-all" : "hover:text-black hover:scale-105 transition-all"}>Patients</NavLink>
            <NavLink to="/about" className={({isActive}) => isActive ? "text-black drop-shadow-md scale-105 transition-all" : "hover:text-black hover:scale-105 transition-all"}>Architecture</NavLink>
            <div className="w-px h-4 bg-black/10" />
            <motion.a href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-black bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full transition-colors font-bold">Log In</motion.a>
            <motion.a href="#" whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }} whileTap={{ scale: 0.95 }} className="text-white bg-black px-6 py-2 rounded-full transition-all font-bold">Book Demo</motion.a>
          </div>
        </div>
      </motion.div>

      {/* Page content */}
      <div className="pt-40 min-h-screen pb-32">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<motion.div initial={{ opacity: 0, y: 100, filter: 'blur(20px)', scale: 0.9 }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }} exit={{ opacity: 0, y: -100, filter: 'blur(20px)', scale: 1.1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}><PatientList /></motion.div>} />
            <Route path="/patients/:id" element={<motion.div initial={{ opacity: 0, y: 100, filter: 'blur(20px)', scale: 0.9 }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }} exit={{ opacity: 0, y: -100, filter: 'blur(20px)', scale: 1.1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}><PatientDetail /></motion.div>} />
            <Route path="/about" element={<motion.div initial={{ opacity: 0, y: 100, filter: 'blur(20px)', scale: 0.9 }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }} exit={{ opacity: 0, y: -100, filter: 'blur(20px)', scale: 1.1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}><AboutModel /></motion.div>} />
            <Route path="*" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><PatientList /></motion.div>} />
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
        {/* Truly Fixed Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden">
          <img 
            src="/assets/cell.jpg" 
            alt="Abstract Cell" 
            className="absolute top-20 left-10 w-64 h-64 object-cover rounded-full opacity-80 blur-sm floating-element-delayed shadow-2xl"
          />
          <img 
            src="/assets/dna.jpg" 
            alt="Abstract DNA" 
            className="absolute bottom-10 right-10 w-96 h-96 object-cover rounded-3xl opacity-80 blur-sm floating-element shadow-2xl"
          />
          <img 
            src="/assets/cross.jpg" 
            alt="Abstract Cross" 
            className="absolute top-1/3 right-1/4 w-72 h-72 object-cover rounded-full opacity-70 blur-sm floating-element-fast shadow-2xl"
          />
        </div>
        <AppShell />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
