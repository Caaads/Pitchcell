import React from "react";
import { ArrowRight, Lightbulb, Zap, HelpCircle, ShieldAlert, Cpu, GraduationCap } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 transition-colors duration-200">
      {/* Navbar overlay */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/20 dark:bg-white/[0.02] backdrop-blur-xl border-b border-gray-200/30 dark:border-white/[0.08] px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg p-2 flex items-center justify-center shadow-lg text-white">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              Pitchcell
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              id="landing-signin-btn"
              onClick={onLogin}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              id="landing-cta-navbar"
              onClick={onGetStarted}
              className="text-sm font-semibold bg-white text-slate-950 hover:bg-slate-200 dark:bg-white dark:hover:bg-slate-200 px-4 py-2 rounded-xl shadow-lg shadow-white/5 cursor-pointer transition-all duration-200 hover:translate-y-[-1px]"
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero section padding */}
      <main className="pt-24 pb-16 px-4 sm:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mt-12 sm:mt-20">
          <div className="inline-flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border border-indigo-150/40 dark:border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Next-Gen AI Opportunity Validation Engine
          </div>
          
          <h1 className="font-sans font-extrabold text-4xl sm:text-6xl tracking-tight leading-[1.1] mb-6 bg-gradient-to-b from-gray-950 to-gray-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Turn random thoughts into structured startup opportunities.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop losing random sparks of genius. Pitchcell analyzes messy ideas, fitness plans, or market combinations and generates robust business formulas instant co-founder critiques.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
            <button
              id="hero-get-started-btn"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-lg shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-2xl hover:translate-y-[-2px] duration-200"
            >
              Analyze Your Idea <ArrowRight className="w-5 h-5" />
            </button>
            <button
              id="hero-secondary-btn"
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-slate-700 bg-white/40 hover:bg-white/60 dark:text-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200/50 dark:border-white/10 font-semibold text-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              Explore Sandbox
            </button>
          </div>

          {/* Prompt illustration widget */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto text-left relative overflow-hidden mb-24">
            <div className="absolute top-0 right-0 bg-indigo-500/10 w-48 h-48 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              Pitchcell Core Model Active
            </div>

            {/* Simulated chat container */}
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/40 dark:border-white/10 p-4 rounded-2xl max-w-[85%]">
                <span className="text-xs font-semibold text-indigo-500 block mb-1">Your Messy Thought:</span>
                <span className="italic text-slate-700 dark:text-slate-300">"people forget assignments + rewards for finishing school challenges"</span>
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-5 rounded-2xl ml-auto max-w-[90%] shadow-lg border border-white/15">
                <span className="text-xs font-mono opacity-80 uppercase tracking-widest block mb-2 font-bold font-sans">ANALYZING OPPORTUNITY</span>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-5 h-5 text-[#22d3ee] shrink-0" /> StudyQuest: Gamified Learning Dashboard
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs select-none border-t border-indigo-400/40 pt-3">
                  <div>
                    <span className="opacity-80 block">FEASIBILITY</span>
                    <span className="font-mono text-base font-extrabold text-amber-300">8.4 / 10</span>
                  </div>
                  <div>
                    <span className="opacity-80 block">DIFFICULTY</span>
                    <span className="font-sans text-base font-extrabold">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* App Features / Grid section */}
          <div className="mt-16 text-left">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12 bg-gradient-to-r from-gray-950 to-indigo-950 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              How Pitchcell Helps You Succeed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xs flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Uncover Hidden Formulas</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    AI synthesizes monetization structures, problem statements, core features, and expansion pathways tailored to any raw input combination.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xs flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Immediate Feasibility Score</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Instantly gauge implementation viability and build complexity. Sort out standard bad ideas and lock in on highly scalable combinations.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xs flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">AI Skeptic mode</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Get tough, direct feedback from a critical simulated co-founder. Discover fatal threats, developer pitfalls, and validation requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Pitchcell Corp. All-in-one startup co-founder workspace.
      </footer>
    </div>
  );
};
