/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./firebaseContext";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import { Loader } from "lucide-react";

function AppContent() {
  const { user, loading } = useAuth();
  
  // Design Mood: Pitchcell runs in an elegant dark mode dashboard
  const darkMode = true;
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // If auth state or profile loading sync is still resolving
  // We render the background container immediately to prevent any white flashes or jarring transition, and present a micro-loader
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-slate-200 transition-colors duration-200 relative overflow-hidden">
      
      {/* Mesh Gradient Background Decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-600/15 dark:bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Screen layout routing wrapped in z-10 index */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            <Loader className="w-8 h-8 animate-spin text-indigo-500 dark:text-indigo-400" />
          </div>
        ) : user ? (
          <Dashboard />
        ) : showAuthScreen ? (
          <AuthPage onBackToLanding={() => setShowAuthScreen(false)} />
        ) : (
          <LandingPage 
            onGetStarted={() => setShowAuthScreen(true)} 
            onLogin={() => setShowAuthScreen(true)} 
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
