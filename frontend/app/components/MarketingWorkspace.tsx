"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AgentPipeline } from "./AgentPipeline";
import { OutputPanel } from "./OutputPanel";

interface MarketingWorkspaceProps {
  form: {
    ctr: string;
    watch_time: string;
    target_audience: string;
    video_description: string;
  };
  setForm: (f: any) => void;
  status: string;
  agents: any[];
  result: any;
  onRun: () => void;
  loading: boolean;
  digitalAgent: any;
}

export function MarketingWorkspace({
  form,
  setForm,
  status,
  agents,
  result,
  onRun,
  loading,
  digitalAgent
}: MarketingWorkspaceProps) {
  const isDone = status === "completed";
  const isWorking = status === "working";

  return (
    <div className="space-y-8">
      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div>
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 block">Performance Metrics</label>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">CTR %</span>
                <input
                  value={form.ctr}
                  onChange={(e) => setForm({ ...form, ctr: e.target.value })}
                  className="w-full pl-16 pr-4 py-3 bg-black/40 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:border-blue-500/50 outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">WATCH S</span>
                <input
                  value={form.watch_time}
                  onChange={(e) => setForm({ ...form, watch_time: e.target.value })}
                  className="w-full pl-16 pr-4 py-3 bg-black/40 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:border-blue-500/50 outline-none"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 block">Target Segment</label>
            <input
              value={form.target_audience}
              onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
              placeholder="e.g. Gen Z Athletes"
              className="w-full p-3 bg-black/40 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:border-blue-500/50 outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 block">Analysis Context (Optional if Video linked)</label>
          <textarea
            value={form.video_description}
            onChange={(e) => setForm({ ...form, video_description: e.target.value })}
            placeholder="Provide context for the ad content if not using the Video Agent..."
            className="w-full p-4 bg-black/40 border border-zinc-800 rounded-2xl text-sm text-zinc-200 resize-none h-full min-h-[140px] focus:border-blue-500/50 outline-none"
          />
        </div>
      </div>

      {/* Execution Control */}
      <div className="flex justify-between items-center py-4 border-y border-zinc-800/30">
        <div className="flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">Engine Version</span>
              <span className="text-[10px] font-bold text-blue-400">MARKETING-AI V2.4</span>
           </div>
           {isWorking && digitalAgent?.currentAgent && (
             <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
               <span className="animate-pulse w-2 h-2 rounded-full bg-blue-400" />
               <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">{digitalAgent.currentAgent}</span>
             </div>
           )}
        </div>
        <button
          onClick={onRun}
          disabled={loading}
          className={`px-10 py-3 rounded-xl font-black text-xs tracking-widest transition-all duration-300 ${
            loading 
              ? "bg-blue-900/30 text-blue-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          }`}
        >
          {loading ? "PROCESSING PIPELINE..." : "INITIALIZE MARKETING ENGINE"}
        </button>
      </div>

      {/* Execution Detail */}
      {(isWorking || isDone) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="glass p-6 rounded-2xl border border-zinc-800/50">
            <h3 className="text-[10px] font-black mb-6 flex items-center gap-2 text-zinc-500 tracking-widest uppercase">
              Pipeline Execution Sequence
            </h3>
            <AgentPipeline agents={agents} />
          </div>

          <AnimatePresence>
            {isDone && result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <OutputPanel result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
