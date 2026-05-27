import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../firebaseContext";
import { Opportunity } from "../types";
import { 
  generateAIOpportunity, 
  saveOpportunityToDatabase, 
  fetchUserOpportunities, 
  updateOpportunitySaveState,
  deleteOpportunityFromDatabase,
  updateOpportunityInDatabase
} from "../opportunityService";
import { OpportunityCard, getCategoryTags } from "./OpportunityCard";
import { LogCarousel } from "./LogCarousel";
import { 
  Home, 
  Bookmark, 
  History, 
  Crown, 
  User as UserIcon, 
  LogOut, 
  PlusCircle, 
  Search, 
  Sparkles, 
  Loader, 
  Menu, 
  X, 
  HelpCircle,
  Activity,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Mic,
  MicOff,
  Edit2,
  Check,
  Filter
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { 
    user, 
    profile, 
    dailyUsageCount, 
    incrementUsage, 
    togglePremium, 
    logout, 
    isPlayground 
  } = useAuth();

  // Sidebar navigation toggles
  const [activeTab, setActiveTab] = useState<"home" | "saved" | "history" | "profile">("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states
  const [thoughts, setThoughts] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Web Speech API / dictation states
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Editing states
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editProblem, setEditProblem] = useState("");
  const [editSolution, setEditSolution] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Set up Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setThoughts((prev) => (prev ? prev + " " + transcript : transcript));
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Stop recording if user switches views or starts generation
  useEffect(() => {
    if (isRecording && recognition) {
      recognition.stop();
    }
  }, [activeTab, isGenerating]);

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Reset category filter when changing active view tabs
  useEffect(() => {
    setSelectedCategory("");
  }, [activeTab]);

  // Open edit form helper
  const handleEditOpen = (opp: Opportunity) => {
    setEditingOpp(opp);
    setEditTitle(opp.title);
    setEditProblem(opp.problem);
    setEditSolution(opp.solution);
  };

  // Save edited opportunity to database
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp) return;
    if (!editTitle.trim()) {
      alert("Title is required.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const updatedFields = {
        title: editTitle.trim(),
        problem: editProblem.trim(),
        solution: editSolution.trim()
      };

      await updateOpportunityInDatabase(editingOpp.id, updatedFields, isPlayground);

      // Instantly update the state list
      setOpportunities(prev => 
        prev.map(item => item.id === editingOpp.id ? { ...item, ...updatedFields } : item)
      );

      // Instantly update the latest generated if active
      if (latestGenerated && latestGenerated.id === editingOpp.id) {
        setLatestGenerated(prev => prev ? { ...prev, ...updatedFields } : null);
      }

      setEditingOpp(null);
    } catch (err) {
      console.error("Failed to edit:", err);
      alert("Failed to save changes.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Data history lists
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Temporary active generated output reference
  const [latestGenerated, setLatestGenerated] = useState<Opportunity | null>(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  // Prepopulate examples
  const examples = [
    "AI + campus + fitness",
    "Food waste solution",
    "Hackathon healthcare idea",
    "School + sustainability + rewards"
  ];

  // Load history list upon sign in
  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, activeTab]);

  const loadHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const data = await fetchUserOpportunities(user.uid, isPlayground);
      setOpportunities(data);
    } catch (err) {
      console.error("Failed to load history list:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Generate opportunity
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!thoughts.trim()) {
      setError("Please put some raw thoughts or combinations to analyze.");
      return;
    }

    // Limit assessment
    const isPremium = profile.isPremium;
    if (!isPremium && dailyUsageCount >= 5) {
      setError("Free Tier daily limit reached! Upgrade to Premium for unconstrained generations, advanced validation models, and co-founder strategies.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setLatestGenerated(null);

    // Sequential fake steps to create high immersion loading
    const steps = [
      "Securing analytical model parameters...",
      "Mapping product-market combinations...",
      "Analyzing user personas and core features...",
      "Simulating sustainable monetization models...",
      "Spinning up the co-founder AI Critic Mode..."
    ];

    let currentStep = 0;
    setGenStep(steps[currentStep]);
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setGenStep(steps[currentStep]);
      }
    }, 1500);

    try {
      const payload = await generateAIOpportunity(thoughts, isPremium);
      
      const completeOpportunity: Opportunity = {
        id: "opp_" + Math.floor(Math.random() * 90000000) + "_" + Date.now(),
        userId: user.uid,
        inputPrompt: thoughts.trim(),
        title: payload.title || "Untitled Opportunity",
        problem: payload.problem || "N/A",
        solution: payload.solution || "N/A",
        targetUsers: payload.targetUsers || [],
        features: payload.features || [],
        monetization: payload.monetization || [],
        feasibilityScore: payload.feasibilityScore || 5,
        executionDifficulty: payload.executionDifficulty || "Medium",
        opportunities: payload.opportunities || [],
        risks: payload.risks || [],
        skepticFeedback: payload.skepticFeedback || "No criticism generated.",
        isSaved: false,
        createdAt: new Date().toISOString()
      };

      // Persist to DB or localStorage
      await saveOpportunityToDatabase(completeOpportunity, isPlayground);
      await incrementUsage();
      
      setLatestGenerated(completeOpportunity);
      setThoughts(""); // Reset thoughts
      loadHistory(); // Reload history logs
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during generation. Please try again.");
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenStep("");
    }
  };

  // Toggle save
  const handleToggleSave = async (id: string, currentState: boolean) => {
    setIsSavingRecord(true);
    try {
      await updateOpportunitySaveState(id, !currentState, isPlayground);
      
      // Update local state arrays quickly
      setOpportunities(prev => 
        prev.map(item => item.id === id ? { ...item, isSaved: !currentState } : item)
      );
      if (latestGenerated && latestGenerated.id === id) {
        setLatestGenerated(prev => prev ? { ...prev, isSaved: !currentState } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Delete opportunity
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this opportunity from your analysis history?")) {
      return;
    }
    try {
      await deleteOpportunityFromDatabase(id, isPlayground);
      setOpportunities(prev => prev.filter(item => item.id !== id));
      if (latestGenerated && latestGenerated.id === id) {
        setLatestGenerated(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter list
  const getFilteredOpportunities = () => {
    let list = [...opportunities];
    if (activeTab === "saved") {
      list = list.filter(item => item.isSaved);
    }
    
    if (selectedCategory !== "") {
      list = list.filter(item => getCategoryTags(item).includes(selectedCategory));
    }
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.problem.toLowerCase().includes(q) || 
        item.inputPrompt.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const getAvailableCategories = () => {
    const list = activeTab === "saved" ? opportunities.filter(o => o.isSaved) : opportunities;
    const allTags = list.flatMap(opp => getCategoryTags(opp));
    return Array.from(new Set(allTags)).sort();
  };

  const availableCategories = getAvailableCategories();

  const filteredOpportunities = getFilteredOpportunities();

  return (
    <div className="min-h-screen flex bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans relative z-10">
      
      {/* Mobile Drawer navbar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/20 dark:bg-white/[0.02] backdrop-blur-xl border-b border-gray-200/30 dark:border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg p-1.5 flex items-center justify-center text-white">
            <Cpu className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            Pitchcell
          </span>
        </div>
        <button
          id="mobile-drawer-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-700 hover:bg-white/40 dark:text-slate-200 dark:hover:bg-white/5 border border-slate-205/30 dark:border-white/[0.08] backdrop-blur-md flex items-center justify-center"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION with pristine spec border and transparent glass finish */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 w-72 bg-white/35 dark:bg-white/[0.01] border-r border-gray-200/30 dark:border-white/[0.05] backdrop-blur-2xl flex flex-col justify-between p-6 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          
          {/* Brand logo details */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg p-2 flex items-center justify-center shadow-lg text-white">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                Pitchcell
              </span>
              <span className="text-[10px] font-bold block text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                Opportunity Engine
              </span>
            </div>
          </div>

          {/* Connected state status */}
          <div className="p-3.5 rounded-2xl bg-white/20 dark:bg-white/[0.02] border border-gray-205/30 dark:border-white/[0.06] backdrop-blur-md text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${isPlayground ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`}></span>
              <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                {isPlayground ? "Playground Sandbox" : "Live Firestore Link"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isPlayground ? "Temporary storage active" : "Secure database synchronization enabled"}
            </p>
          </div>

          {/* Top Tabs */}
          <nav className="space-y-2">
            
            <button
              id="sidebar-tab-home"
              onClick={() => { setActiveTab("home"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-white/85 text-indigo-700 dark:bg-white/10 dark:text-white border border-gray-200/30 dark:border-white/10 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/[0.04]"
              }`}
            >
              <Home className="w-5 h-5" /> Opportunity Creator
            </button>

            <button
              id="sidebar-tab-saved"
              onClick={() => { setActiveTab("saved"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === "saved"
                  ? "bg-white/85 text-indigo-700 dark:bg-white/10 dark:text-white border border-gray-200/30 dark:border-white/10 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/[0.04]"
              }`}
            >
              <Bookmark className="w-5 h-5" /> Saved Opportunities
            </button>

            <button
              id="sidebar-tab-history"
              onClick={() => { setActiveTab("history"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-white/85 text-indigo-700 dark:bg-white/10 dark:text-white border border-gray-200/30 dark:border-white/10 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/[0.04]"
              }`}
            >
              <History className="w-5 h-5" /> Generation History
            </button>

            <button
              id="sidebar-tab-profile"
              onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white/85 text-indigo-700 dark:bg-white/10 dark:text-white border border-gray-200/30 dark:border-white/10 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/[0.04]"
              }`}
            >
              <UserIcon className="w-5 h-5" /> User Settings
            </button>

          </nav>
        </div>

        {/* Sidebar Freemium status / Upgrade and accounts */}
        <div className="space-y-4">
          
          {/* Daily limit gauge card */}
          {profile && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/15 border border-indigo-500/20 dark:from-white/[0.02] dark:to-white/[0.01] dark:border-white/10 relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                    YOUR TIER
                  </span>
                  <span className="font-extrabold text-sm flex items-center gap-1.5 leading-none">
                    {profile.isPremium ? (
                      <>
                        <Crown className="w-4 h-4 text-emerald-500 fill-emerald-500/20" /> Premium Active
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-slate-400" /> Free Plan
                      </>
                    )}
                  </span>
                </div>
              </div>

              {!profile.isPremium ? (
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>Daily Analyses:</span>
                    <span className="font-mono font-bold">{dailyUsageCount} / 5</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((dailyUsageCount / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  <button
                    id="upgrade-trigger-btn"
                    onClick={togglePremium}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200"
                  >
                    <Crown className="w-3.5 h-3.5" /> Unlock Premium Unlimited
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Co-founder Depth Activated
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">Enjoy infinite, depth-analyses sandbox validation models!</p>
                  
                  <button
                    id="premium-toggle-back"
                    onClick={togglePremium}
                    className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold text-[10px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    Downgrade simulation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Logout footer block */}
          <div className="flex items-center justify-between border-t border-gray-150/40 pt-4 dark:border-slate-800/40">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0 uppercase select-none">
                {user?.email?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-sm block truncate leading-none mb-0.5">{user?.displayName || "Startup Founder"}</span>
                <span className="text-[11px] text-slate-400 block truncate leading-none">{user?.email}</span>
              </div>
            </div>
            
            <button
              id="sidebar-logout"
              onClick={logout}
              className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-45 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-200"
        ></div>
      )}

      {/* MAIN BODY AREA */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 lg:py-8 pt-20 lg:pt-8 max-w-5xl mx-auto w-full">
        
        {/* TOP GREETING AREA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Hello, {user?.displayName || user?.email?.split("@")[0] || "Innovator"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Let's convert raw fragments, thoughts, or combinations of tech into viable start-up models.
            </p>
          </div>
          
          {/* Search bar inside header toolbar */}
          {(activeTab === "saved" || activeTab === "history" || activeTab === "home") && (
            <div className="relative max-w-xs w-full self-start sm:self-auto">
              <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                id="search-opportunity-bar"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas or problems..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200/40 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md focus:border-indigo-500 focus:outline-hidden dark:focus:border-[#22d3ee] text-slate-900 dark:text-white transition-all"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-start gap-2.5 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
            <span>{error}</span>
          </div>
        )}

        {/* ACTIVE MAIN VIEW CONDITIONAL SWITCH */}
        {activeTab === "home" && (
          <div className="space-y-8">
            
            {/* INPUT CARD */}
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
                <Sparkles className="w-48 h-48 text-indigo-500" />
              </div>

              <h2 className="text-xl font-bold tracking-tight mb-2 text-slate-950 dark:text-white">What startup idea is in your mind?</h2>
              <p className="text-xs text-slate-400 mb-4 font-semibold uppercase tracking-widest">
                Type messy thoughts, problems, keywords, or core concept combinations.
              </p>

              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="relative">
                  <textarea
                    id="generator-thoughts-input"
                    rows={4}
                    value={thoughts}
                    onChange={(e) => setThoughts(e.target.value)}
                    placeholder='e.g., "AI + student + fitness" or "People forget assignments" or "Hackathon healthcare database"'
                    className="w-full p-4 pr-12 text-sm rounded-xl border border-gray-200/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md focus:border-indigo-505 dark:focus:border-[#818cf8] focus:outline-hidden transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans leading-relaxed"
                  />
                  <button
                    id="mic-dictation-btn"
                    type="button"
                    onClick={toggleRecording}
                    className={`absolute right-3.5 bottom-4 p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                      isRecording 
                        ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 animate-pulse" 
                        : "border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#22d3ee] dark:hover:bg-white/5"
                    }`}
                    title={isRecording ? "Stop voice dictation (recording is active)" : "Dictate your messy thoughts (Web Speech API)"}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                {/* Example pre-fill chips */}
                <div className="space-y-3">
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-widest">Or test load a concept combination:</span>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((ex, idx) => (
                      <button
                        id={`example-chip-${idx}`}
                        key={idx}
                        type="button"
                        onClick={() => {
                          setThoughts(ex);
                          setError(null);
                        }}
                        className="text-xs px-3.5 py-2 cursor-pointer rounded-xl bg-white/70 hover:bg-white/90 text-slate-700 hover:text-indigo-600 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] dark:text-slate-300 dark:hover:text-white transition-colors border border-gray-200/20 dark:border-white/5 font-semibold"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate CTA Button */}
                <button
                  id="start-analyze-btn"
                  type="submit"
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed hover:shadow-2xl hover:translate-y-[-1px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" /> Analyzing Opportunity...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5" /> Generate Idea Matrix
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* AI IMMERSED PROGRESS VIEW */}
            {isGenerating && (
              <div className="glass-effect rounded-3xl p-8 border border-gray-200/50 dark:border-slate-800/80 text-center space-y-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-xl shadow-inner">
                  <Cpu className="w-8 h-8 text-indigo-600 dark:text-[#22d3ee] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Deep Assessment in Progress</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-1 font-bold italic">
                    {genStep}
                  </p>
                </div>
                <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full animate-infinite-loading w-[60%]"></div>
                </div>
                <p className="text-xs text-slate-400">This validation scan typically resolves in 3-8 seconds.</p>
              </div>
            )}

            {/* GENERATED DISPLAY CARD */}
            {latestGenerated && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest pl-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" /> Newly Generated Co-Founder Report
                </div>
                <OpportunityCard
                  opportunity={latestGenerated}
                  onToggleSave={handleToggleSave}
                  onDelete={handleDelete}
                  onEdit={handleEditOpen}
                  isSaving={isSavingRecord}
                />
              </div>
            )}

            {/* QUICK PREVIEW / HISTORIES ACCORDION */}
            {opportunities.length > 0 && !latestGenerated && !isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-150/40 pb-3 dark:border-slate-800/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {searchQuery.trim() !== "" ? "Matching Analyses Logs" : "Revisited Analyses Logs"}
                  </span>
                  <button
                    id="view-all-history-toggle"
                    onClick={() => setActiveTab("history")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All Logs <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Category tag filter dropdown */}
                <div className="flex items-center justify-between gap-3 bg-white/10 dark:bg-white/[0.01] border border-gray-200/20 dark:border-white/[0.05] p-3 rounded-2xl mb-2 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                    <Filter className="w-4 h-4 text-indigo-500" />
                    <span>Category Tag Filter:</span>
                  </div>
                  <select
                    id="category-tag-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-900 focus:border-indigo-505 dark:focus:border-[#22d3ee] focus:outline-hidden text-slate-705 dark:text-slate-300 cursor-pointer transition-all"
                  >
                    <option value="">All Categories ({opportunities.length})</option>
                    {availableCategories.map((cat) => {
                      const count = opportunities.filter(o => getCategoryTags(o).includes(cat)).length;
                      return (
                        <option key={cat} value={cat}>
                          {cat} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <LogCarousel
                  items={filteredOpportunities}
                  onToggleSave={handleToggleSave}
                  onDelete={handleDelete}
                  onEdit={handleEditOpen}
                  isSaving={isSavingRecord}
                  emptyState={
                    <div className="text-center py-8 text-sm text-slate-400 font-mono">
                      No matching analyses found for current filters
                    </div>
                  }
                />
              </div>
            )}

          </div>
        )}

        {/* TAB 2: SAVED OPPORTUNITIES */}
        {activeTab === "saved" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1 font-mono">
                FLAGGED DIRECTORIES
              </span>
              <h2 className="text-xl font-bold tracking-tight">Saved Startup Opportunities</h2>
            </div>

            {isLoadingHistory ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin mx-auto text-slate-400" />
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="glass-effect rounded-3xl p-12 border border-gray-200/50 dark:border-slate-800/80 text-center">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-base">No Saved Opportunities Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Analyze combinations in the creator dashboard. Click on the bookmark icon on any card to save it here for reference.
                </p>
                <button
                  id="go-back-creator-saved"
                  onClick={() => setActiveTab("home")}
                  className="mt-6 px-4 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl cursor-pointer"
                >
                  Spin Up a New analysis
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Category tag filter dropdown */}
                <div className="flex items-center justify-between gap-3 bg-white/10 dark:bg-white/[0.01] border border-gray-200/20 dark:border-white/[0.05] p-3 rounded-2xl mb-2 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                    <Filter className="w-4 h-4 text-indigo-505" />
                    <span>Category Tag Filter:</span>
                  </div>
                  <select
                    id="category-tag-filter-saved"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-900 focus:border-indigo-505 dark:focus:border-[#22d3ee] focus:outline-hidden text-slate-705 dark:text-slate-300 cursor-pointer transition-all"
                  >
                    <option value="">All Saved Categories ({opportunities.filter(o => o.isSaved).length})</option>
                    {availableCategories.map((cat) => {
                      const count = opportunities.filter(o => o.isSaved).filter(o => getCategoryTags(o).includes(cat)).length;
                      return (
                        <option key={cat} value={cat}>
                          {cat} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <LogCarousel
                  items={filteredOpportunities}
                  onToggleSave={handleToggleSave}
                  onDelete={handleDelete}
                  onEdit={handleEditOpen}
                  isSaving={isSavingRecord}
                  emptyState={
                    <div className="text-center py-8 text-sm text-slate-400 font-mono">
                      No matching saved analyses found for current filters
                    </div>
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPLETE GENERATION HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 font-mono">
                COMPLETE LOG SYSTEM
              </span>
              <h2 className="text-xl font-bold tracking-tight">Generation History</h2>
            </div>

            {isLoadingHistory ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin mx-auto text-slate-400" />
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="glass-effect rounded-3xl p-12 border border-gray-200/50 dark:border-slate-800/80 text-center">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-base">No Generation Logs Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You haven't analyzed any combination recipes yet. Run your first messy idea on the workspace home!
                </p>
                <button
                  id="go-back-creator-history"
                  onClick={() => setActiveTab("home")}
                  className="mt-6 px-4 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl cursor-pointer"
                >
                  Go to Creator Workspace
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Category tag filter dropdown */}
                <div className="flex items-center justify-between gap-3 bg-white/10 dark:bg-white/[0.01] border border-gray-200/20 dark:border-white/[0.05] p-3 rounded-2xl mb-2 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                    <Filter className="w-4 h-4 text-indigo-505" />
                    <span>Category Tag Filter:</span>
                  </div>
                  <select
                    id="category-tag-filter-history"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-900 focus:border-indigo-505 dark:focus:border-[#22d3ee] focus:outline-hidden text-slate-705 dark:text-slate-300 cursor-pointer transition-all"
                  >
                    <option value="">All Categories ({opportunities.length})</option>
                    {availableCategories.map((cat) => {
                      const count = opportunities.filter(o => getCategoryTags(o).includes(cat)).length;
                      return (
                        <option key={cat} value={cat}>
                          {cat} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <LogCarousel
                  items={filteredOpportunities}
                  onToggleSave={handleToggleSave}
                  onDelete={handleDelete}
                  onEdit={handleEditOpen}
                  isSaving={isSavingRecord}
                  emptyState={
                    <div className="text-center py-8 text-sm text-slate-400 font-mono">
                      No matching history analyses found for current filters
                    </div>
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MEMBER PROFILE & SETTINGS */}
        {activeTab === "profile" && profile && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1 font-mono">
                CONSOLE METRIC SETTINGS
              </span>
              <h2 className="text-xl font-bold tracking-tight">Active User Console</h2>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-white/[0.08] pb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 font-extrabold flex items-center justify-center text-xl uppercase select-none shrink-0 border border-indigo-500/20">
                  {user?.email?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{user?.displayName || "Startup Founder"}</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">{user?.email}</span>
                  <span className="text-[11px] font-mono text-[#22d3ee] font-medium block uppercase tracking-widest mt-1">ID: {user?.uid}</span>
                </div>
              </div>

              {/* Freemium tier description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="p-5 rounded-2xl bg-white/20 dark:bg-white/[0.02] border border-gray-200/30 dark:border-white/[0.06] backdrop-blur-md space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">Account Tier Plan</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      {profile.isPremium ? "Premium co-founder" : "Standard Free Tier"}
                    </span>
                    {profile.isPremium ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-405 dark:text-slate-350 leading-relaxed">
                    {profile.isPremium 
                      ? "You have unlocked unconstrained opportunity analysis, customizable co-founder templates, and complete skeptic critiques." 
                      : "Free plan accounts are limited to exactly 5 validation reports per 24 hours."}
                  </p>
                  
                  <button
                    id="profile-toggle-plan"
                    onClick={togglePremium}
                    className="mt-4 inline-flex items-center gap-1.5 font-bold text-xs text-indigo-600 dark:text-[#818cf8] hover:underline cursor-pointer"
                  >
                    {profile.isPremium ? "Downgrade back to Free Plan" : "Toggle Simulator Upgrade to Premium"}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white/20 dark:bg-white/[0.02] border border-gray-200/30 dark:border-white/[0.06] backdrop-blur-md space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">Active Session Status</span>
                  <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="flex justify-between">
                      <span>Database Engine:</span>
                      <span className="text-[11px] font-mono">{isPlayground ? "LocalStorage Fallback" : "Cloud Firestore"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Server status:</span>
                      <span className="text-[11px] text-emerald-500 font-bold uppercase">Online / Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Generations Used today:</span>
                      <span className="text-[11px] font-mono font-bold text-indigo-500 dark:text-[#818cf8]">{dailyUsageCount} generations</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Help box */}
              <div className="p-4 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/20 font-medium text-xs text-slate-500 dark:text-slate-400 flex gap-2">
                <HelpCircle className="w-5 h-5 shrink-0 text-indigo-500" />
                <span>
                  The Premium plan upgrade is fully simulated for testing and demonstration purposes only. No actual payment methods are integrated, and users can freely toggle premium features on or off as desired.
                </span>
              </div>

              {/* Global Signout Call */}
              <button
                id="profile-signout-trigger"
                onClick={logout}
                className="w-full sm:w-auto px-6 py-3 border border-rose-500/20 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 rounded-xl font-bold text-sm cursor-pointer transition-colors text-center"
              >
                Sign Out Account
              </button>

            </div>
          </div>
        )}

      </main>

      {/* PROFESSIONAL EDIT SLIDE-OVER OR MODAL FOR RENAMING & EDITING DETAILS */}
      <AnimatePresence>
        {editingOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-indigo-505" /> Edit Opportunity
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">Refine and adapt custom details for renaming and small changes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingOpp(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer bg-transparent border-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Startup Title</label>
                  <input
                    id="edit-title-input"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white/20 dark:bg-white/[0.02] focus:border-indigo-505 dark:focus:border-[#22d3ee] focus:outline-hidden text-slate-900 dark:text-white transition-colors"
                    placeholder="Enter descriptive title"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Core Problem Statement</label>
                  <textarea
                    id="edit-problem-input"
                    rows={4}
                    value={editProblem}
                    onChange={(e) => setEditProblem(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white/20 dark:bg-white/[0.02] focus:border-indigo-505 dark:focus:border-[#22d3ee] focus:outline-hidden text-slate-900 dark:text-white transition-colors font-sans leading-relaxed"
                    placeholder="Describe the core problem statement"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Proposed Co-Founder Solution</label>
                  <textarea
                    id="edit-solution-input"
                    rows={4}
                    value={editSolution}
                    onChange={(e) => setEditSolution(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white/20 dark:bg-white/[0.02] focus:border-indigo-505 dark:focus:border-[#22d3ee] focus:outline-hidden text-slate-900 dark:text-white transition-colors font-sans leading-relaxed"
                    placeholder="Describe your co-founder solution approach"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingOpp(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-gray-150 dark:hover:bg-white/5 transition-all cursor-pointer bg-transparent border-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed border-none"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" /> Saving Changes
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Save Pitch Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
