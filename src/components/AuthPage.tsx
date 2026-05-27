import React, { useState } from "react";
import { useAuth } from "../firebaseContext";
import { Mail, Lock, AlertCircle, ArrowLeft, Loader, ArrowRight } from "lucide-react";

interface AuthPageProps {
  onBackToLanding: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToLanding }) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, isPlayground } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      try {
        // If it was a JSON string error, parse it
        const parsed = JSON.parse(err.message);
        setError(parsed.error || "Authentication failed. Check your password.");
      } catch {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError("Google authentication was aborted or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-transparent p-4 transition-colors duration-200 font-sans relative z-10">
      <div className="w-full max-w-md">
        
        {/* Back navigation */}
        <button
          id="back-to-landing-btn"
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors font-medium self-start cursor-pointer border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pitchcell
        </button>

        {/* Master Glassmorphism Card */}
        <div className="glass-effect rounded-3xl p-8 border border-white/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-slate-950 dark:text-white">
              {isSignUp ? "Build Startup Opportunities" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isSignUp 
                ? "Start transforming raw sketches, ideas, and combinations." 
                : "Log back in to review logs and saved opportunities."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-start gap-2.5 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isPlayground && (
            <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs text-center font-medium backdrop-blur-md">
              Running in Playground Sandbox. Fake emails or bypass credentials will login instantly!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5 dark:text-slate-400 uppercase tracking-widest">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="innovator@pitchcell.ai"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-205 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] backdrop-blur-md focus:border-indigo-500 focus:outline-hidden dark:focus:border-[#818cf8] text-sm text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5 dark:text-slate-400 uppercase tracking-widest">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  id="auth-pass-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-205 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] backdrop-blur-md focus:border-indigo-500 focus:outline-hidden dark:focus:border-[#818cf8] text-sm text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                <>Sign Up Free <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
          </div>

          <button
            id="auth-google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white/70 hover:bg-white/90 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {/* Form Switcher */}
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-400">
              {isSignUp ? "Already have an account? " : "New to Pitchcell? "}
            </span>
            <button
              id="auth-toggle-mode"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="font-semibold text-indigo-600 dark:text-[#818cf8] hover:underline cursor-pointer"
            >
              {isSignUp ? "Sign In" : "Register For Free"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
