import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Opportunity } from "../types";
import { OpportunityCard } from "./OpportunityCard";
import { ChevronLeft, ChevronRight, CornerDownRight, Keyboard } from "lucide-react";

interface LogCarouselProps {
  items: Opportunity[];
  onToggleSave: (id: string, currentState: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (opp: Opportunity) => void;
  isSaving: boolean;
  emptyState?: React.ReactNode;
}

export const LogCarousel: React.FC<LogCarouselProps> = ({
  items,
  onToggleSave,
  onDelete,
  onEdit,
  isSaving,
  emptyState
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Keep index within bounds if active list shrinks (e.g. items deleted or unsaved)
  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, activeIndex]);

  // Support Arrow keys for seamless navigation between opportunity analyses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (items.length <= 1) return;
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, items.length]);

  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  const handlePrev = () => {
    setDirection("left");
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection("right");
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const currentItem = items[activeIndex];

  // Motion variants for responsive sliding layout
  const slideVariants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "right" ? 120 : -120,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: "left" | "right") => ({
      x: dir === "right" ? -120 : 120,
      opacity: 0
    })
  };

  return (
    <div className="space-y-4">
      {/* Navigation Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/20 dark:bg-white/[0.01] border border-gray-200/30 dark:border-white/[0.05] p-3 sm:p-4 rounded-2xl backdrop-blur-md">
        
        <div className="flex items-center gap-2">
          <CornerDownRight className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">
            Viewing log <span className="text-indigo-600 dark:text-[#22d3ee] font-black">{activeIndex + 1}</span> of <span className="font-extrabold">{items.length}</span>
          </span>
        </div>

        {/* Keyboard Tip & Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Use Left/Right arrow keys</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="carousel-btn-prev"
              onClick={handlePrev}
              className="p-2 cursor-pointer rounded-xl border border-gray-200/50 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center"
              title="Previous opportunity log (ArrowLeft)"
              disabled={items.length <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination track dots */}
            <div className="flex items-center gap-1.5 px-3">
              {items.map((_, idx) => (
                <button
                  id={`carousel-dot-${idx}`}
                  key={idx}
                  onClick={() => {
                    setDirection(idx > activeIndex ? "right" : "left");
                    setActiveIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    idx === activeIndex 
                      ? "bg-indigo-600 dark:bg-[#22d3ee] w-4" 
                      : "bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400"
                  }`}
                  title={`Go to log ${idx + 1}`}
                />
              ))}
            </div>

            <button
              id="carousel-btn-next"
              onClick={handleNext}
              className="p-2 cursor-pointer rounded-xl border border-gray-200/50 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center"
              title="Next opportunity log (ArrowRight)"
              disabled={items.length <= 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Slide Transition Area */}
      <div className="relative overflow-hidden w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentItem.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="w-full"
          >
            <OpportunityCard
              opportunity={currentItem}
              onToggleSave={onToggleSave}
              onDelete={onDelete}
              onEdit={onEdit}
              isSaving={isSaving}
            />
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};
