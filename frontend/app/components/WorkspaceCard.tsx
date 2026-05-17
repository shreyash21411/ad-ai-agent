"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface WorkspaceCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  status: "idle" | "working" | "completed" | "error";
  children: ReactNode;
  headerRight?: ReactNode;
  accentColor?: string;
}

export function WorkspaceCard({
  id,
  title,
  subtitle,
  icon,
  isExpanded,
  onToggle,
  status,
  children,
  headerRight,
  accentColor = "purple",
}: WorkspaceCardProps) {
  const isWorking = status === "working";
  const isDone = status === "completed";

  const colorMap = {
    purple: {
      border: "border-purple-500/30",
      glow: "bg-purple-500/10",
      text: "text-purple-400",
      ring: "border-purple-500/50",
    },
    blue: {
      border: "border-blue-500/30",
      glow: "bg-blue-500/10",
      text: "text-blue-400",
      ring: "border-blue-500/50",
    },
    emerald: {
      border: "border-emerald-500/30",
      glow: "bg-emerald-500/10",
      text: "text-emerald-400",
      ring: "border-emerald-500/50",
    },
  };

  const colors = colorMap[accentColor as keyof typeof colorMap] || colorMap.purple;

  return (
    <motion.div
      layout
      className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${
        isExpanded ? "flex-[2] z-20" : "flex-1 cursor-pointer hover:bg-white/5"
      } ${isWorking ? "shadow-[0_0_50px_rgba(168,85,247,0.15)]" : ""}`}
      onClick={() => !isExpanded && onToggle()}
      initial={false}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        background: isWorking
          ? `linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(17,24,39,0.8) 100%)`
          : "rgba(17,24,39,0.55)",
        border: isExpanded ? `2px solid ${isWorking ? "rgba(168,85,247,0.4)" : "rgba(75,85,99,0.3)"}` : `1px solid rgba(75,85,99,0.2)`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl transition-all duration-1000 ${
        isWorking ? colors.glow : "bg-transparent"
      }`} />

      {/* Pulsing Ring for Active State */}
      {isWorking && (
        <motion.div
          className={`absolute inset-0 rounded-3xl border-2 ${colors.ring}`}
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              layout
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                isWorking ? "bg-purple-500/20 shadow-lg" : "bg-zinc-800/80"
              }`}
            >
              {icon}
            </motion.div>
            <div>
              <motion.h3 layout className="text-xl font-bold text-white tracking-tight">
                {title}
              </motion.h3>
              <motion.p layout className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                {subtitle}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {headerRight}
            {isExpanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="h-full overflow-y-auto pr-2 custom-scrollbar"
              >
                {children}
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {/* Collapsed Stats/Overview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Status</p>
                    <p className={`text-xs mt-1 font-bold ${isWorking ? "text-purple-400" : isDone ? "text-emerald-400" : "text-zinc-400"}`}>
                      {status.toUpperCase()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/50">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Activity</p>
                    <p className="text-xs mt-1 text-zinc-300 font-medium">Ready for deployment</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-4 italic">Click to expand workspace</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
