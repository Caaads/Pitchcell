import React from "react";
import { jsPDF } from "jspdf";
import { motion } from "motion/react";
import { Opportunity } from "../types";
import { 
  Bookmark, 
  Trash2, 
  AlertTriangle, 
  Flame, 
  CircleDot, 
  Layers, 
  TrendingUp, 
  Coins, 
  Target, 
  AlertOctagon,
  Copy,
  Check,
  Calendar,
  Share2,
  Download,
  Edit2
} from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onToggleSave: (id: string, currentState: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (opp: Opportunity) => void;
  isSaving: boolean;
}

export const getCategoryTags = (opp: Opportunity): string[] => {
  const content = `${opp.title} ${opp.inputPrompt} ${opp.solution} ${opp.problem}`.toLowerCase();
  const tags: string[] = [];

  if (content.includes("ai") || content.includes("artificial") || content.includes("gpt") || content.includes("intelligence") || content.includes("model") || content.includes("llm")) {
    tags.push("AI & Automation");
  }
  if (content.includes("school") || content.includes("student") || content.includes("college") || content.includes("learn") || content.includes("education") || content.includes("academic") || content.includes("study")) {
    tags.push("EdTech");
  }
  if (content.includes("fitness") || content.includes("health") || content.includes("medical") || content.includes("clinic") || content.includes("doctor") || content.includes("workout")) {
    tags.push("Health & Fitness");
  }
  if (content.includes("sustainability") || content.includes("green") || content.includes("climate") || content.includes("waste") || content.includes("recycle") || content.includes("clean")) {
    tags.push("GreenTech");
  }
  if (content.includes("food") || content.includes("recipe") || content.includes("restaurant") || content.includes("eat") || content.includes("kitchen")) {
    tags.push("FoodTech");
  }
  if (content.includes("b2b") || content.includes("enterprise") || content.includes("saas") || content.includes("business") || content.includes("workspace") || content.includes("workflow")) {
    tags.push("B2B SaaS");
  }
  if (content.includes("fintech") || content.includes("finance") || content.includes("money") || content.includes("pay") || content.includes("credit") || content.includes("wallet")) {
    tags.push("FinTech");
  }
  if (content.includes("creator") || content.includes("video") || content.includes("youtube") || content.includes("music") || content.includes("content") || content.includes("design")) {
    tags.push("Creator Economy");
  }
  if (content.includes("local") || content.includes("community") || content.includes("social") || content.includes("friend") || content.includes("events")) {
    tags.push("Social & Local");
  }

  // Fallback defaults
  if (tags.length === 0) {
    if (opp.executionDifficulty === "High") {
      tags.push("Enterprise Tech");
    } else if (opp.executionDifficulty === "Low") {
      tags.push("Lean Startup");
    } else {
      tags.push("Digital Product");
    }
    tags.push("Innovation");
  }

  if (tags.length === 1) {
    tags.push("FutureTech");
  }

  return tags.slice(0, 3);
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onToggleSave,
  onDelete,
  onEdit,
  isSaving
}) => {
  const [copied, setCopied] = React.useState(false);
  const [sharing, setSharing] = React.useState(false);
  const [shareFallback, setShareFallback] = React.useState(false);

  const handleCopy = () => {
    const textToCopy = `
=== PITCHCELL STARTUP OPPORTUNITY REPORT ===
Startup: ${opportunity.title}
Feasibility: ${opportunity.feasibilityScore}/10 | Build Difficulty: ${opportunity.executionDifficulty}

[PROBLEM] 
${opportunity.problem}

[SOLUTION]
${opportunity.solution}

[TARGET USERS]
${opportunity.targetUsers.map((u, i) => `${i + 1}. ${u}`).join("\n")}

[CORE MVP FEATURES]
${opportunity.features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

[SUGGESTED MONETIZATION]
${opportunity.monetization.map((m, i) => `${i + 1}. ${m}`).join("\n")}

[GROWTH OPPORTUNITIES]
${opportunity.opportunities.map((o, i) => `${i + 1}. ${o}`).join("\n")}

[CRITICAL RISKS]
${opportunity.risks.map((r, i) => `${i + 1}. ${r}`).join("\n")}

[CO-FOUNDER SKEPTIC FEEDBACK]
"${opportunity.skepticFeedback}"
===========================================
Generations analyzed securely via Pitchcell.
    `;
    navigator.clipboard.writeText(textToCopy.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2050);
  };

  const handleShare = async () => {
    const shareText = `Pitchcell Startup Opportunity: *${opportunity.title}*\nFeasibility Score: ${opportunity.feasibilityScore}/10\nExecution Difficulty: ${opportunity.executionDifficulty}\n\nCore Solution:\n${opportunity.solution}`;
    
    if (navigator.share) {
      try {
        setSharing(true);
        await navigator.share({
          title: `Pitchcell - ${opportunity.title}`,
          text: shareText,
          url: window.location.href,
        });
        setSharing(false);
      } catch (err) {
        console.log("Error sharing:", err);
        setSharing(false);
      }
    } else {
      // Fallback
      handleCopy();
      setShareFallback(true);
      setTimeout(() => setShareFallback(false), 2500);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2); // 170mm
      let y = margin;

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          drawPageBackground();
        }
      };

      const drawPageBackground = () => {
        // Subtle indicator bar on top
        doc.setFillColor(99, 102, 241); // indigo-500
        doc.rect(margin, 10, contentWidth, 1.5, "F");
        
        // Footer text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("PITCHCELL OPPORTUNITY REPORT", margin, pageHeight - 10);
        doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 15, pageHeight - 10);
      };

      drawPageBackground();

      // Top Tag
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(99, 102, 241);
      doc.text("PITCHCELL INSIGHT FEEDBACK REPORT", margin, y);
      y += 6;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      const splitTitle = doc.splitTextToSize(opportunity.title, contentWidth);
      doc.text(splitTitle, margin, y);
      y += (splitTitle.length * 8) + 4;

      // Date of analysis
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Date Analyzed: ${new Date(opportunity.createdAt).toLocaleDateString()}`, margin, y);
      y += 6;

      // Input Prompt
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      const splitPrompt = doc.splitTextToSize(`Input thoughts: "${opportunity.inputPrompt}"`, contentWidth);
      doc.text(splitPrompt, margin, y);
      y += (splitPrompt.length * 5) + 8;

      // Feasibility & Difficulty Score boxes
      checkPageOverflow(26);
      doc.setFillColor(248, 250, 252); // slate-50 bg
      doc.rect(margin, y, contentWidth, 18, "F");
      doc.setDrawColor(226, 232, 240); // slate-200 border
      doc.rect(margin, y, contentWidth, 18, "S");

      // Feasibility Score text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("FEASIBILITY SCORE", margin + 6, y + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`${opportunity.feasibilityScore} / 10`, margin + 6, y + 13);

      // Execution Difficulty text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("EXECUTION DIFFICULTY", margin + 86, y + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241); // indigo-500
      doc.text(opportunity.executionDifficulty, margin + 86, y + 13);

      y += 26;

      // Draw standard single paragraph section
      const drawSectionParagraph = (header: string, contentText: string, headerColor = [99, 102, 241]) => {
        checkPageOverflow(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.text(header.toUpperCase(), margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85); // slate-700
        const lines = doc.splitTextToSize(contentText, contentWidth);
        checkPageOverflow(lines.length * 5 + 4);
        doc.text(lines, margin, y);
        y += (lines.length * 5) + 8;
      };

      // Draw list items
      const drawListItems = (header: string, itemsList: string[], headerColor = [99, 102, 241]) => {
        checkPageOverflow(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.text(header.toUpperCase(), margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85); // slate-700

        itemsList.forEach((item) => {
          const splitLines = doc.splitTextToSize(`• ${item}`, contentWidth - 4);
          checkPageOverflow(splitLines.length * 5 + 1);
          doc.text(splitLines, margin + 4, y);
          y += (splitLines.length * 5) + 2;
        });
        y += 5;
      };

      // 1. Problem Statement
      drawSectionParagraph("Core Problem Statement", opportunity.problem, [217, 119, 6]); // amber

      // 2. Co-founder solution
      drawSectionParagraph("Proposed Co-Founder Solution", opportunity.solution, [79, 70, 229]); // indigo

      // 3. Target Users
      drawListItems("Target Users", opportunity.targetUsers, [14, 165, 233]); // sky

      // 4. Core Features
      drawListItems("Core Features (MVP)", opportunity.features, [139, 92, 246]); // violet

      // 5. Sustainable Monetization
      drawListItems("Sustainable Monetization", opportunity.monetization, [16, 185, 129]); // emerald

      // 6. Strategic Growth & Opportunities
      drawListItems("Strategic Growth & Opportunities", opportunity.opportunities, [79, 70, 229]); // indigo

      // 7. Critical Bottlenecks & Risks
      drawListItems("Critical Bottlenecks & Risks", opportunity.risks, [225, 29, 72]); // rose

      // 8. AI Skeptic feedback styled block
      const skepticLines = doc.splitTextToSize(`"${opportunity.skepticFeedback}"`, contentWidth - 10);
      const containerHeight = (skepticLines.length * 5) + 16;
      
      checkPageOverflow(containerHeight);
      
      doc.setFillColor(254, 242, 242); // very soft red bg
      doc.rect(margin, y, contentWidth, containerHeight, "F");
      
      doc.setDrawColor(248, 113, 113); // red-400 border lines
      doc.rect(margin, y, contentWidth, containerHeight, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(185, 28, 28); // deep crimson red
      doc.text("AI SKEPTIC CRITIQUE (WHY IT MIGHT FAIL)", margin + 5, y + 6);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(127, 29, 29); // slate darker red text
      doc.text(skepticLines, margin + 5, y + 12);
      
      // Save PDF
      doc.save(`${opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-pitchcell-report.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
    }
  };

  // Determine feasibility score accent colors
  const getScoreColor = (score: number) => {
    if (score >= 8) return { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", lightBg: "bg-emerald-50 dark:bg-emerald-950/20" };
    if (score >= 5) return { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", lightBg: "bg-amber-50 dark:bg-amber-950/20" };
    return { bg: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", lightBg: "bg-rose-50 dark:bg-rose-950/20" };
  };

  const scoreTheme = getScoreColor(opportunity.feasibilityScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/10 dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-gray-200/30 dark:border-white/[0.08] shadow-2xl overflow-hidden mb-8 transition-all hover:shadow-white/5 font-sans relative"
    >
      
      {/* Upper header section */}
      <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/[0.05] bg-white/20 dark:bg-white/[0.01] backdrop-blur-md relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 pr-14">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-indigo-600 dark:text-cyan-400 px-2.5 py-1 rounded-lg bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/20 dark:border-cyan-500/20">
                PITCHCELL INSIGHT
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5" /> {new Date(opportunity.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {opportunity.title}
            </h2>
            <p className="text-sm mt-1.5 text-slate-500 dark:text-slate-400">
              Input: <span className="italic font-medium">"{opportunity.inputPrompt}"</span>
            </p>
            {/* Category Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {getCategoryTags(opportunity).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/5 dark:bg-slate-850/65 dark:text-[#22d3ee] text-indigo-600 border border-indigo-500/10 dark:border-white/[0.05] transition-all"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center z-10">
            <button
              id={`copy-opp-${opportunity.id}`}
              onClick={handleCopy}
              className="p-2.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/40 hover:bg-white/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
              title="Copy analysis details"
            >
              {copied ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
            </button>

            <button
              id={`share-opp-${opportunity.id}`}
              onClick={handleShare}
              disabled={sharing}
              className="p-2.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/40 hover:bg-white/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer relative"
              title="Share startup opportunity"
            >
              <Share2 className="w-4.5 h-4.5" />
              {shareFallback && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap z-50 shadow-md">
                  Copied share link!
                </span>
              )}
            </button>

            <button
              id={`download-opp-${opportunity.id}`}
              onClick={handleDownloadPDF}
              className="p-2.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/40 hover:bg-white/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
              title="Download neat PDF Report"
            >
              <Download className="w-4.5 h-4.5" />
            </button>

            <button
              id={`save-opp-${opportunity.id}`}
              onClick={() => onToggleSave(opportunity.id, opportunity.isSaved)}
              disabled={isSaving}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                opportunity.isSaved
                  ? "bg-indigo-600/95 border-indigo-600/20 text-white dark:bg-white dark:text-[#020617] dark:hover:bg-white/90"
                  : "border-gray-200/60 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300"
              }`}
              title={opportunity.isSaved ? "Saved Opportunity" : "Save Opportunity"}
            >
              <Bookmark className={`w-4.5 h-4.5 ${opportunity.isSaved && !document.documentElement.classList.contains("dark") ? "fill-current" : ""}`} />
            </button>

            {onEdit && (
              <button
                id={`edit-opp-${opportunity.id}`}
                onClick={() => onEdit(opportunity)}
                className="p-2.5 rounded-xl border border-gray-200/60 hover:border-indigo-300 hover:bg-indigo-50/20 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-indigo-500/10 dark:hover:border-indigo-500/30 text-slate-705 dark:text-slate-305 hover:text-indigo-600 dark:hover:text-[#22d3ee] transition-all flex items-center justify-center cursor-pointer"
                title="Edit and Rename Opportunity"
              >
                <Edit2 className="w-4.5 h-4.5" />
              </button>
            )}
            <button
              id={`delete-opp-${opportunity.id}`}
              onClick={() => onDelete(opportunity.id)}
              className="p-2.5 rounded-xl border border-gray-200/60 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-rose-500/10 dark:hover:border-rose-500/30 dark:text-slate-300 dark:hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer"
              title="Delete Opportunity"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Frosted Specification Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white/30 dark:bg-white/[0.02] border border-gray-200/30 dark:border-white/[0.08] backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">FEASIBILITY SCORE</span>
              <span className={`text-sm font-mono font-extrabold ${scoreTheme.text}`}>
                {opportunity.feasibilityScore} / 10
              </span>
            </div>
            <div className="w-full bg-slate-200/70 dark:bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${scoreTheme.bg} transition-all duration-500 rounded-full`}
                style={{ width: `${opportunity.feasibilityScore * 10}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/30 dark:bg-white/[0.02] border border-gray-200/30 dark:border-white/[0.08] backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">EXECUTION DIFFICULTY</span>
              <span className="font-sans font-extrabold text-[#6366f1] dark:text-[#22d3ee] text-lg">
                {opportunity.executionDifficulty}
              </span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
              opportunity.executionDifficulty === "High" 
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                : opportunity.executionDifficulty === "Medium"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            }`}>
              {opportunity.executionDifficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Main core grids */}
      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Row 1: Problem and Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Core Problem Statement
            </h3>
            <p className="text-slate-705 dark:text-slate-300 text-sm leading-relaxed p-5 rounded-2xl bg-white/30 dark:bg-white/[0.02] border border-gray-200/30 dark:border-white/[0.06] backdrop-blur-md">
              {opportunity.problem}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Flame className="w-4 h-4 text-indigo-500" /> Proposed Co-Founder Solution
            </h3>
            <p className="text-slate-705 dark:text-slate-300 text-sm leading-relaxed p-5 rounded-2xl bg-indigo-500/[0.03] dark:bg-indigo-500/[0.02] border border-indigo-500/10 dark:border-white/[0.06] backdrop-blur-md">
              {opportunity.solution}
            </p>
          </div>
        </div>

        {/* Row 2: Target Users, Features, and Monetization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-white/[0.05]">
          
          {/* Target users */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Target className="w-4 h-4 text-sky-500" /> Target Users
            </h3>
            <ul className="space-y-2.5">
              {opportunity.targetUsers.map((user, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-cyan-400 mt-2 shrink-0"></span>
                  <span>{user}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Layers className="w-4 h-4 text-violet-500" /> Core Features (MVP)
            </h3>
            <ul className="space-y-2.5">
              {opportunity.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] mt-2 shrink-0"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Monetization */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Coins className="w-4 h-4 text-emerald-500" /> Sustainable monetization
            </h3>
            <ul className="space-y-2.5">
              {opportunity.monetization.map((model, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  <span>{model}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Row 3: Opportunities and Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-white/[0.05]">
          
          <div className="p-5 rounded-2xl bg-white/20 dark:bg-white/[0.01] border border-gray-200/30 dark:border-white/[0.06] backdrop-blur-md">
            <h4 className="text-xs font-bold text-indigo-700 dark:text-[#818cf8] uppercase tracking-widest flex items-center gap-1.5 mb-3 font-mono">
              <TrendingUp className="w-4 h-4" /> Strategic Opportunities
            </h4>
            <ul className="space-y-2.5">
              {opportunity.opportunities.map((opt, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-mono text-indigo-600 dark:text-[#818cf8] font-bold shrink-0">+{idx+1}</span>
                  <span className="leading-relaxed">{opt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white/20 dark:bg-white/[0.01] border border-gray-200/30 dark:border-white/[0.06] backdrop-blur-md">
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-3 font-mono">
              <AlertOctagon className="w-4 h-4" /> Critical Bottlenecks & Risks
            </h4>
            <ul className="space-y-2.5">
              {opportunity.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-bold shrink-0">-{idx+1}</span>
                  <span className="leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Row 4: Skeptic Mode critique */}
        <div className="p-6 rounded-2xl bg-rose-500/[0.03] dark:bg-rose-500/5 backdrop-blur-xl border border-rose-500/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <AlertTriangle className="w-24 h-24 text-rose-500" />
          </div>
          <div className="flex items-center gap-2 mb-3 text-rose-700 dark:text-rose-400">
            <AlertOctagon className="w-4.5 h-4.5" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono">
              AI SKEPTIC MODE CRITIQUE
            </h3>
          </div>
          <p className="text-slate-700 dark:text-rose-200/70 italic text-sm leading-relaxed pl-3 border-l-2 border-rose-500">
            "{opportunity.skepticFeedback}"
          </p>
          <div className="mt-3 text-[10px] text-rose-500/50 uppercase font-bold tracking-widest font-mono">
            Likely Failure Point: Market Adoption & User Retention
          </div>
        </div>

      </div>

    </motion.div>
  );
};
