"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import { AgentPipeline, AgentNode } from "../components/AgentPipeline";
import { OutputPanel } from "../components/OutputPanel";
import { Settings, Play, ChevronLeft } from "lucide-react";

const INITIAL_AGENTS: AgentNode[] = [
  { id: "metrics", name: "Metrics Analyst", icon: "📊", status: "idle" },
  { id: "creative", name: "Creative Strategist", icon: "🎭", status: "idle" },
  { id: "insight", name: "Root Cause", icon: "🧠", status: "idle" },
  { id: "strategy", name: "Strategy Maker", icon: "🎯", status: "idle" },
  { id: "gen", name: "Ad Creator", icon: "✨", status: "idle" },
  { id: "eval", name: "Quality Control", icon: "⚖️", status: "idle" },
  { id: "brain", name: "Main Brain", icon: "👑", status: "idle" }
];

const MINI_AGENT_NAMES = [
  "Metrics Analyst",
  "Creative Strategist",
  "Root Cause Engine",
  "Strategy Maker",
  "Ad Creator",
  "Quality Control",
];

export default function MarketingAgentPage() {
  const [form, setForm] = useState({
    video_url: "",
    video_description: "",
    ctr: "",
    watch_time: "",
    target_audience: "",
    ad_platform: "",
    marketing_goal: "",
    product_category: "",
    brand_voice: ""
  });

  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<AgentNode[]>(INITIAL_AGENTS);
  const [result, setResult] = useState<any>(null);
  const [currentAgent, setCurrentAgent] = useState("");
  const [iteration, setIteration] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const simulateProgress = () => {
    let currentIndex = 0;
    setAgents(INITIAL_AGENTS);
    setIteration(1);

    timerRef.current = setInterval(() => {
      currentIndex++;
      const miniIdx = Math.min(currentIndex - 1, MINI_AGENT_NAMES.length - 1);
      setCurrentAgent(MINI_AGENT_NAMES[miniIdx % MINI_AGENT_NAMES.length]);

      if (currentIndex >= INITIAL_AGENTS.length) {
        currentIndex = 3;
        setIteration(2);
      }

      setAgents(prev => prev.map((a, i) => {
        if (i < currentIndex) return { ...a, status: "completed" };
        if (i === currentIndex) return { ...a, status: "working" };
        return a;
      }));
    }, 2000);
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    simulateProgress();

    try {
      const response = await axios.post("http://127.0.0.1:8001/analyze/marketing", {
        video_url: null,
        video_description: form.video_description,
        metrics: {
          ctr: Number(form.ctr),
          watch_time: Number(form.watch_time)
        },
        target_audience: form.target_audience,
        ad_platform: form.ad_platform,
        marketing_goal: form.marketing_goal,
        product_category: form.product_category,
        brand_voice: form.brand_voice
      });

      const data = response.data;
      if (timerRef.current) clearInterval(timerRef.current);

      const timings = data.meta?.timings || {};
      setAgents(prev => prev.map(a => ({
        ...a,
        status: "completed",
        time: timings[a.id === 'brain' ? 'total' : a.id === 'gen' ? 'creative_gen_agent' : a.id === 'eval' ? 'evaluation_agent' : `${a.id}_agent`]
      })));

      setResult(data);
    } catch (error) {
      if (timerRef.current) clearInterval(timerRef.current);
      setAgents(prev => prev.map(a => a.status === 'working' ? { ...a, status: 'error' } : a));
    } finally {
      setLoading(false);
    }
  };

  const isExecuting = loading || result;

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-blue-500/30 font-sans">

      {/* Navigation Header */}
      <nav className="border-b border-zinc-900 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all group-hover:border-blue-500/50">
              <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="hidden sm:block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Return to Dashboard</p>
              <h1 className="text-sm font-bold text-white tracking-tight">AI COMMAND CENTER</h1>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {loading && (
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/40">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Iteration {iteration}/2</span>
                <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </div>
            )}
            <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-widest transition-all duration-500 ${loading ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' :
                result ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
                  'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}>
              {loading ? 'ANALYZING' : result ? 'EXECUTION COMPLETE' : 'SYSTEM STANDBY'}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* State 1: Mission Setup (Cinematic Layout) */}
        {!isExecuting && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-4xl mx-auto"
          >
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
                <Settings className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Mission Parameters</h2>
              <p className="text-zinc-500 text-base max-w-xl mx-auto leading-relaxed">
                Configure the strategic inputs for the AI Market Strategy Engine. The system will analyze these parameters to generate actionable root causes and a highly optimized creative concept.
              </p>
            </div>

            <div className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] p-8 md:p-12 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Operational Metrics
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#030712] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase block mb-2">CTR (%)</span>
                        <input
                          value={form.ctr}
                          onChange={(e) => setForm({ ...form, ctr: e.target.value })}
                          className="w-full bg-transparent text-lg font-medium text-white outline-none"
                        />
                      </div>
                      <div className="bg-[#030712] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase block mb-2">WATCH (S)</span>
                        <input
                          value={form.watch_time}
                          onChange={(e) => setForm({ ...form, watch_time: e.target.value })}
                          className="w-full bg-transparent text-lg font-medium text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Target Audience Segment
                    </label>
                    <div className="bg-[#030712] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                      <input
                        value={form.target_audience}
                        onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                        placeholder="e.g. Urban Runners 18-35"
                        className="w-full bg-transparent text-sm text-white outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Platform
                      </label>
                      <div className="bg-[#030712] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                        <input
                          value={form.ad_platform}
                          onChange={(e) => setForm({ ...form, ad_platform: e.target.value })}
                          className="w-full bg-transparent text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Goal
                      </label>
                      <div className="bg-[#030712] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                        <input
                          value={form.marketing_goal}
                          onChange={(e) => setForm({ ...form, marketing_goal: e.target.value })}
                          className="w-full bg-transparent text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Category
                      </label>
                      <div className="bg-[#030712] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                        <input
                          value={form.product_category}
                          onChange={(e) => setForm({ ...form, product_category: e.target.value })}
                          className="w-full bg-transparent text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Voice
                      </label>
                      <div className="bg-[#030712] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                        <input
                          value={form.brand_voice}
                          onChange={(e) => setForm({ ...form, brand_voice: e.target.value })}
                          className="w-full bg-transparent text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Creative Intent Baseline
                    </label>
                    <div className="bg-[#030712] border border-zinc-800/80 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                      <textarea
                        value={form.video_description}
                        onChange={(e) => setForm({ ...form, video_description: e.target.value })}
                        className="w-full min-h-[160px] bg-transparent text-sm text-zinc-300 resize-none outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-8 border-t border-zinc-800/80 flex justify-center">
                <button
                  onClick={handleRun}
                  className="group flex items-center gap-4 px-12 py-5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95"
                >
                  <span className="font-black tracking-widest uppercase text-xs">Execute Protocol</span>
                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* State 2: Execution & Output (Cinematic Briefing) */}
        {isExecuting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col w-full max-w-5xl mx-auto gap-8"
          >
            {/* Orchestration Pipeline */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-6 lg:p-10 relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Execution Orchestration</h3>
                 {loading && (
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-zinc-500 uppercase">Active Node:</span>
                     <span className="text-[10px] font-black text-white uppercase px-2 py-1 bg-zinc-800 rounded animate-pulse">{currentAgent}</span>
                   </div>
                 )}
               </div>
               <AgentPipeline agents={agents} />
            </div>

            {/* Output Panel (Passes form state as missionData) */}
            {result && (
              <OutputPanel result={result} missionData={form} />
            )}
          </motion.div>
        )}

      </main>
    </div>
  );
}
