import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingModalProps {
  onComplete: (username: string) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps = [
    {
      id: 'intro',
      target: null,
      title: "INITIATING RAMEN...",
      message: "Beep boop! I am Ramen. Welcome to Spam. Before we begin, what is your Pilot Name?",
      showInput: true
    },
    {
      id: 'dashboard',
      target: 'nav-dashboard',
      title: "THE COMMAND CENTER",
      message: "This is your Dashboard. It's split into 'Now', 'Next', and 'Later'. Keep your immediate focus here.",
      showInput: false
    },
    {
      id: 'goals',
      target: 'nav-goals',
      title: "GOALS & METRICS",
      message: "Every task belongs to a Goal. Track your progress, completion trends, and keep your life categorized here.",
      showInput: false
    },
    {
      id: 'calendar',
      target: 'nav-calendar',
      title: "CALENDAR VIEW",
      message: "Plan ahead. Tasks with deadlines will automatically appear here so you can visualize your workload.",
      showInput: false
    },
    {
      id: 'modus',
      target: 'nav-modus',
      title: "AI SCHEDULER",
      message: "Your strategic engine. Get AI-powered suggestions on what to tackle next based on your current workload.",
      showInput: false
    },
    {
      id: 'add-task',
      target: 'nav-add-task',
      title: "ADD TASK",
      message: "Ready to execute? Click here to add your first task to the system.",
      showInput: false
    },
    {
      id: 'outro',
      target: null,
      title: "SYSTEM READY",
      message: "You are all set, Pilot! The system is yours. Good luck out there.",
      showInput: false
    }
  ];

  const currentStep = steps[step];

  const updateTargetRect = () => {
    if (currentStep.target) {
      const el = document.getElementById(currentStep.target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [step]);

  const handleNext = () => {
    if (step === 0) {
      if (!username.trim()) {
        setError('Please enter a pilot name');
        return;
      }
      if (username.trim().length > 10) {
        setError('Pilot name must be 10 characters or less');
        return;
      }
      setError('');
    }
    
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-auto">
      {/* Spotlight Overlay */}
      {targetRect ? (
        <motion.div 
          className="absolute rounded-xl border-2 border-blue-400 pointer-events-none"
          animate={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.85)'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm transition-opacity duration-500" />
      )}

      {/* DVD Bot and Dialog */}
      <motion.div
        className="absolute bottom-8 left-1/2 flex flex-col items-center md:items-start md:flex-row gap-6 w-full max-w-2xl px-4"
        initial={{ y: 100, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
      >
        {/* DVD Bot Avatar */}
        <div className="relative shrink-0 hidden md:block">
          <div className="w-20 h-20 rounded-full bg-emerald-600 shadow-xl shadow-emerald-500/30 flex items-center justify-center text-4xl text-white relative z-10 border-4 border-slate-900">
            <i className="fa-solid fa-robot animate-bounce"></i>
          </div>
          {/* Antenna */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-6 bg-slate-400 z-0">
            <div className="absolute -top-2 -left-1 w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
          </div>
        </div>

        {/* Dialog Bubble */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full shadow-2xl border border-slate-200 dark:border-slate-700 relative">
          {/* Arrow pointing to bot */}
          <div className="absolute hidden md:block w-4 h-4 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-slate-700 transform -rotate-45 top-1/2 -translate-y-1/2 -left-2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="md:hidden w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">
                <i className="fa-solid fa-robot"></i>
              </div>
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                {currentStep.title}
              </h3>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  {currentStep.message}
                </p>

                {currentStep.showInput && (
                  <div className="space-y-2 mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilot Name (Max 10 chars)</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError('');
                      }}
                      maxLength={10}
                      placeholder="e.g. Maverick"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
                      autoFocus
                    />
                    {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
                  />
                ))}
              </div>
              <button 
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700 hover:border-blue-600 active:border-b-0 active:translate-y-[4px] font-bold py-2 px-6 rounded-xl text-sm transition-all"
              >
                {step === steps.length - 1 ? "Start Mission" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;