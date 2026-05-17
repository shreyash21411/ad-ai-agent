"use client";

import { motion, AnimatePresence } from "framer-motion";

export type PipelineCardStatus = "idle" | "working" | "completed" | "error";

export interface VideoAgentState {
  status: PipelineCardStatus;
  time?: number;
  transcript?: string;
  summary?: string;
  duration?: number;
}

export interface DigitalAgentState {
  status: PipelineCardStatus;
  time?: number;
  iteration?: number;
  maxIterations?: number;
  currentAgent?: string;
  terminationType?: string;
  approvalReason?: string;
}

interface PipelineCardsProps {
  videoAgent: VideoAgentState;
  digitalAgent: DigitalAgentState;
  hasVideoUrl: boolean;
  selectedMode: "full" | "video" | "marketing";
  onSelect: (mode: "full" | "video" | "marketing") => void;
}

/* ─── Animated dots for the flow connection ─── */
function FlowDots({ active, completed }: { active: boolean; completed: boolean }) {
  if (!active && !completed) return null;

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${
            completed
              ? "bg-emerald-400"
              : "bg-purple-400"
          }`}
          initial={{ opacity: 0.2, scale: 0.5 }}
          animate={
            completed
              ? { opacity: 0.8, scale: 1 }
              : {
                  opacity: [0.2, 1, 0.2],
                  scale: [0.5, 1.2, 0.5],
                }
          }
          transition={
            completed
              ? { duration: 0.3, delay: i * 0.05 }
              : {
                  duration: 1.2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}

/* ─── Pulsing ring effect for active cards ─── */
function PulsingRing() {
  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-purple-500/30"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl border border-purple-400/10"
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
    </>
  );
}

/* ─── Status badge ─── */
function StatusBadge({ status, time, label }: { status: PipelineCardStatus; time?: number; label?: string }) {
  const config = {
    idle: { bg: "bg-zinc-800/80", border: "border-zinc-700/50", text: "text-zinc-500", label: "STANDBY" },
    working: { bg: "bg-purple-500/15", border: "border-purple-500/40", text: "text-purple-400", label: label || "PROCESSING" },
    completed: { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400", label: "COMPLETE" },
    error: { bg: "bg-red-500/15", border: "border-red-500/40", text: "text-red-400", label: "ERROR" },
  };
  const c = config[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${c.bg} border ${c.border} transition-all duration-500`}>
      {status === "working" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
        </span>
      )}
      {status === "completed" && (
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === "error" && <span className="text-red-400 text-xs">✕</span>}
      <span className={`text-[10px] font-bold tracking-widest ${c.text}`}>{c.label}</span>
      {time !== undefined && status === "completed" && (
        <span className="text-[10px] text-zinc-500 font-mono">{time.toFixed(1)}s</span>
      )}
    </div>
  );
}

/* ─── Mini agent steps inside Digital Agent card ─── */
function MiniAgentStep({ name, icon, active, done }: { name: string; icon: string; active: boolean; done: boolean }) {
  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-500 ${
        active
          ? "bg-purple-500/10 border border-purple-500/30"
          : done
          ? "bg-emerald-500/5 border border-emerald-500/15"
          : "bg-zinc-900/50 border border-zinc-800/50"
      }`}
      animate={active ? { scale: [1, 1.02, 1] } : {}}
      transition={active ? { duration: 1.5, repeat: Infinity } : {}}
    >
      <span className="text-sm">{icon}</span>
      <span className={`text-[11px] font-medium ${active ? "text-purple-300" : done ? "text-emerald-400/80" : "text-zinc-600"}`}>
        {name}
      </span>
      {active && (
        <motion.div
          className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {done && (
        <svg className="ml-auto w-3 h-3 text-emerald-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </motion.div>
  );
}

export function PipelineCards({ videoAgent, digitalAgent, hasVideoUrl, selectedMode, onSelect }: PipelineCardsProps) {
  const videoActive = videoAgent.status === "working";
  const videoDone = videoAgent.status === "completed";
  const digitalActive = digitalAgent.status === "working";
  const digitalDone = digitalAgent.status === "completed";

  const isVideoSelected = selectedMode === "video";
  const isMarketingSelected = selectedMode === "marketing";
  const isFullSelected = selectedMode === "full";

  // Flow is active when video is done and digital is working (data is being transferred)
  const flowActive = videoDone && (digitalActive || digitalDone);
  const flowTransferring = videoDone && digitalActive;

  const MINI_AGENTS = [
    { name: "Metrics Analyst", icon: "📊" },
    { name: "Creative Strategist", icon: "🎭" },
    { name: "Root Cause Engine", icon: "🧠" },
    { name: "Strategy Maker", icon: "🎯" },
    { name: "Ad Creator", icon: "✨" },
    { name: "Quality Control", icon: "⚖️" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col lg:flex-row items-stretch gap-0">

        {/* ═══════════════════════════════════════ */}
        {/* VIDEO AGENT CARD */}
        {/* ═══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => onSelect("video")}
          className={`relative flex-1 rounded-2xl p-6 overflow-hidden transition-all duration-700 cursor-pointer group ${
            !hasVideoUrl && !isVideoSelected
              ? "opacity-40"
              : videoActive
              ? "shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              : videoDone
              ? "shadow-[0_0_30px_rgba(16,185,129,0.1)]"
              : ""
          } ${isVideoSelected ? "ring-2 ring-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]" : ""}`}
          style={{
            background: videoActive || isVideoSelected
              ? "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(17,24,39,0.8) 100%)"
              : videoDone
              ? "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(17,24,39,0.7) 100%)"
              : "rgba(17,24,39,0.55)",
            border: videoActive || isVideoSelected
              ? "1px solid rgba(168,85,247,0.4)"
              : videoDone
              ? "1px solid rgba(16,185,129,0.2)"
              : "1px solid rgba(75,85,99,0.2)",
            backdropFilter: "blur(20px)",
          }}
        >
          {videoActive && <PulsingRing />}
          
          {/* Selection indicator */}
          {isVideoSelected && (
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          )}

          {/* Background glow */}
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl transition-all duration-1000 ${
            videoActive ? "bg-purple-500/10" : videoDone ? "bg-emerald-500/5" : "bg-transparent"
          }`} />

          <div className="relative z-10">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    videoActive
                      ? "bg-purple-500/20 shadow-lg shadow-purple-500/10"
                      : videoDone
                      ? "bg-emerald-500/15"
                      : "bg-zinc-800/80"
                  }`}
                  animate={videoActive ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={videoActive ? { duration: 2, repeat: Infinity } : {}}
                >
                  🎥
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Video Agent</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Audio Extraction & Transcription</p>
                </div>
              </div>
              <StatusBadge status={hasVideoUrl ? videoAgent.status : "idle"} time={videoAgent.time} label="TRANSCRIBING" />
            </div>

            {/* Processing Steps */}
            {hasVideoUrl && (videoActive || videoDone) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4 }}
                className="space-y-2 mb-4"
              >
                {[
                  { label: "Download Audio Stream", icon: "📥" },
                  { label: "Whisper Transcription", icon: "🎙️" },
                  { label: "AI Summarization", icon: "📝" },
                ].map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${
                      videoDone
                        ? "bg-emerald-500/5 border border-emerald-500/10"
                        : "bg-purple-500/5 border border-purple-500/10"
                    }`}
                  >
                    <span className="text-sm">{step.icon}</span>
                    <span className={`text-[11px] font-medium ${videoDone ? "text-emerald-400/80" : "text-purple-300/80"}`}>
                      {step.label}
                    </span>
                    {videoDone && (
                      <svg className="ml-auto w-3 h-3 text-emerald-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {videoActive && (
                      <motion.div
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Transcript Preview */}
            <AnimatePresence>
              {videoDone && videoAgent.transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="mt-4 p-4 bg-black/40 rounded-xl border border-zinc-800/80"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Transcript</p>
                    {videoAgent.duration && (
                      <span className="text-[10px] text-zinc-600 font-mono">{videoAgent.duration}s video</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-3 italic leading-relaxed">
                    &ldquo;{videoAgent.transcript}&rdquo;
                  </p>
                  {videoAgent.summary && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/50">
                      <p className="text-[10px] text-purple-400/80 font-mono uppercase tracking-widest mb-1">AI Summary</p>
                      <p className="text-xs text-zinc-400">{videoAgent.summary}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No URL message */}
            {!hasVideoUrl && (
              <div className="mt-2 p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30">
                <p className="text-xs text-zinc-600 text-center">
                  Provide a Video URL above to activate transcription
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════ */}
        {/* FLOW CONNECTION */}
        {/* ═══════════════════════════════════════ */}
        <div 
          className="flex lg:flex-col items-center justify-center py-4 lg:py-0 lg:px-4 shrink-0 cursor-pointer group"
          onClick={() => onSelect("full")}
        >
          {/* Vertical line (mobile) / Horizontal line (desktop) */}
          <div className={`relative flex items-center justify-center ${
            hasVideoUrl || isFullSelected ? "" : "opacity-30"
          } ${isFullSelected ? "scale-110" : ""}`}>
            {/* The connection bar */}
            <div className="hidden lg:block w-20 relative">
              <div className={`h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden transition-all ${isFullSelected ? "h-[3px] bg-purple-500/50" : ""}`}>
                {(flowActive || isFullSelected) && (
                  <motion.div
                    className={`absolute inset-0 ${
                      flowTransferring || isFullSelected
                        ? "bg-gradient-to-r from-purple-500/0 via-purple-400 to-purple-500/0"
                        : "bg-gradient-to-r from-emerald-500/30 via-emerald-400/60 to-emerald-500/30"
                    }`}
                    animate={flowTransferring || isFullSelected ? { x: ["-100%", "100%"] } : {}}
                    transition={flowTransferring || isFullSelected ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  />
                )}
              </div>
              {/* Arrow */}
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 ${
                flowActive || isFullSelected ? "text-purple-400" : "text-zinc-700"
              } transition-colors duration-500`}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M2 1 L8 5 L2 9 Z" />
                </svg>
              </div>
            </div>

            {/* Mobile vertical connector */}
            <div className="lg:hidden h-16 relative flex flex-col items-center">
              <div className={`w-[2px] h-full bg-zinc-800 rounded-full overflow-hidden transition-all ${isFullSelected ? "w-[3px] bg-purple-500/50" : ""}`}>
                {(flowActive || isFullSelected) && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-400 to-purple-500/0"
                    animate={flowTransferring || isFullSelected ? { y: ["-100%", "100%"] } : {}}
                    transition={flowTransferring || isFullSelected ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  />
                )}
              </div>
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 ${
                flowActive || isFullSelected ? "text-purple-400" : "text-zinc-700"
              }`}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M1 2 L5 8 L9 2 Z" />
                </svg>
              </div>
            </div>

            {/* Flow label */}
            <AnimatePresence>
              {isFullSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-8 lg:-top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <span className="text-[9px] font-black tracking-widest text-purple-400 bg-purple-500/20 border border-purple-500/50 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    FULL PIPELINE
                  </span>
                </motion.div>
              )}
              {flowTransferring && !isFullSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-8 lg:-top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <span className="text-[9px] font-bold tracking-widest text-purple-400/80 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    SENDING TRANSCRIPT
                  </span>
                </motion.div>
              )}
              {videoDone && digitalDone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-8 lg:-top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <span className="text-[9px] font-bold tracking-widest text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    DATA LINKED ✓
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Animated dots in the middle */}
          <div className="hidden lg:flex absolute">
            <FlowDots active={flowTransferring || isFullSelected} completed={videoDone && digitalDone} />
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* DIGITAL MARKETING AGENT CARD */}
        {/* ═══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          onClick={() => onSelect("marketing")}
          className={`relative flex-1 rounded-2xl p-6 overflow-hidden transition-all duration-700 cursor-pointer group ${
            digitalActive
              ? "shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              : digitalDone
              ? "shadow-[0_0_30px_rgba(16,185,129,0.1)]"
              : ""
          } ${isMarketingSelected ? "ring-2 ring-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]" : ""}`}
          style={{
            background: digitalActive || isMarketingSelected
              ? "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(168,85,247,0.08) 50%, rgba(17,24,39,0.8) 100%)"
              : digitalDone
              ? "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(17,24,39,0.7) 100%)"
              : "rgba(17,24,39,0.55)",
            border: digitalActive || isMarketingSelected
              ? "1px solid rgba(168,85,247,0.4)"
              : digitalDone
              ? "1px solid rgba(16,185,129,0.2)"
              : "1px solid rgba(75,85,99,0.2)",
            backdropFilter: "blur(20px)",
          }}
        >
          {digitalActive && <PulsingRing />}
          
          {/* Selection indicator */}
          {isMarketingSelected && (
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          )}

          {/* Background glow */}
          <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl transition-all duration-1000 ${
            digitalActive ? "bg-blue-500/8" : digitalDone ? "bg-emerald-500/5" : "bg-transparent"
          }`} />

          <div className="relative z-10">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    digitalActive
                      ? "bg-purple-500/20 shadow-lg shadow-purple-500/10"
                      : digitalDone
                      ? "bg-emerald-500/15"
                      : "bg-zinc-800/80"
                  }`}
                  animate={digitalActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={digitalActive ? { duration: 2, repeat: Infinity } : {}}
                >
                  🧠
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Digital Marketing Agent</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Analysis • Strategy • Generation • Evaluation</p>
                </div>
              </div>
              <StatusBadge
                status={digitalAgent.status}
                time={digitalAgent.time}
                label={digitalAgent.currentAgent ? `${digitalAgent.currentAgent}` : "ANALYZING"}
              />
            </div>

            {/* Iteration badge */}
            {digitalActive && digitalAgent.iteration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 flex items-center gap-2"
              >
                <span className="text-[10px] font-bold tracking-widest text-blue-400/70 uppercase">
                  Iteration {digitalAgent.iteration}/{digitalAgent.maxIterations || 2}
                </span>
                <div className="flex-1 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500/50 to-purple-500/50"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}

            {/* Mini Agent Steps */}
            <div className="grid grid-cols-2 gap-2">
              {MINI_AGENTS.map((agent, i) => {
                const isCurrentAgent = digitalAgent.currentAgent === agent.name;
                const isDone = digitalDone;

                return (
                  <MiniAgentStep
                    key={i}
                    name={agent.name}
                    icon={agent.icon}
                    active={digitalActive && isCurrentAgent}
                    done={isDone}
                  />
                );
              })}
            </div>

            {/* Termination info */}
            <AnimatePresence>
              {digitalDone && digitalAgent.terminationType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      digitalAgent.terminationType === "success" ? "bg-emerald-400" :
                      digitalAgent.terminationType === "stalled" ? "bg-yellow-400" :
                      digitalAgent.terminationType === "low_confidence" ? "bg-orange-400" :
                      "bg-blue-400"
                    }`} />
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      {digitalAgent.terminationType.replace(/_/g, " ")}
                    </span>
                  </div>
                  {digitalAgent.approvalReason && (
                    <span className="text-[10px] text-zinc-500 italic">{digitalAgent.approvalReason}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
