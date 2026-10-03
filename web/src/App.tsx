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

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppShell() {
  const location = useLocation();

  // Catch-all redirect is handled by Routes
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} className="min-h-screen text-[#111] font-sans selection:bg-black selection:text-white overflow-hidden relative">
      <ScrollToTop />
      <AmbientCursor />

      {/* Premium Floating Nav */}
      <motion.div 
        className="fixed w-full top-6 z-50 px-6 flex justify-center pointer-events-none" 
        initial={{ y: -100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
      >
        <div className="glass-pill px-4 h-16 flex items-center justify-between gap-8 pointer-events-auto w-full max-w-5xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-black/10 bg-white/80 backdrop-blur-xl">
          
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 pl-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 rounded-full border-2 border-black/20 border-t-black"
            />
            <span className="font-black text-sm tracking-tight text-black">GlucoTwin</span>
          </motion.div>

          {/* Links */}
          <div className="flex items-center gap-2 bg-black/[0.04] p-1 rounded-full border border-black/5">
            <NavLink to="/">
              {({ isActive }) => (
                <motion.div
                  className={`relative px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive ? 'text-white' : 'text-black/50 hover:text-black hover:bg-black/5'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navBubble"
                      className="absolute inset-0 bg-black rounded-full shadow-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Patients</span>
                </motion.div>
              )}
            </NavLink>
            <NavLink to="/about">
              {({ isActive }) => (
                <motion.div
                  className={`relative px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive ? 'text-white' : 'text-black/50 hover:text-black hover:bg-black/5'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navBubble"
                      className="absolute inset-0 bg-black rounded-full shadow-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Architecture</span>
                </motion.div>
              )}
            </NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pr-2">
            <motion.a href="#" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-black hover:bg-black/5 px-4 py-2 rounded-full transition-colors font-bold text-sm">Log In</motion.a>
            <motion.a href="#" whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }} whileTap={{ scale: 0.95 }} className="text-white bg-black px-6 py-2 rounded-full transition-all font-bold text-sm">Book Demo</motion.a>
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
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 blur-[2px]">
          <img
            src="/assets/cell.jpg"
            alt="Abstract Cell"
            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] object-cover mix-blend-multiply floating-element shadow-2xl"
          />
          <img
            src="/assets/dna.jpg"
            alt="Abstract DNA"
            className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] object-cover mix-blend-multiply floating-element-delayed shadow-2xl"
          />
          <img
            src="/assets/cross.jpg"
            alt="Medical Cross"
            className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] object-cover rounded-full mix-blend-multiply floating-element-fast shadow-2xl"
          />
          <img
            src="/assets/brain.jpg"
            alt="Holographic Brain"
            className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] object-cover rounded-full mix-blend-multiply floating-element-delayed shadow-2xl"
          />
        </div>
        <div className="relative z-10">
          <AppShell />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
