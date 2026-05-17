"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import { OutputPanel } from "./components/OutputPanel";

// ═══════════════════════════════════════════════════
// 🛸 MISSION INITIALIZATION MODAL
// ═══════════════════════════════════════════════════
function InitializationModal({ isOpen, onClose, onStart }: { isOpen: boolean; onClose: () => void; onStart: (data: any) => void }) {
  const [data, setData] = useState({
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
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.15)]"
      >
        <div className="relative p-10 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-[10px] font-black text-purple-400 tracking-widest uppercase">Phase 01</span>
              <h2 className="text-3xl font-black tracking-tighter">Mission Deployment</h2>
            </div>
            <p className="text-zinc-500 text-sm">Initialize the AI orchestration sequence by providing the mission parameters.</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Video (URL or File)</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  value={data.video_url}
                  onChange={(e) => setData({ ...data, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 p-4 bg-black/40 border border-white/5 rounded-2xl text-sm focus:border-purple-500/50 transition-all outline-none"
                  disabled={!!file}
                />
                <label className="flex items-center justify-center px-6 py-4 sm:py-0 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-2xl cursor-pointer transition-all">
                  <span className="text-xs font-bold uppercase tracking-wider">{file ? "File Selected" : "Upload File"}</span>
                  <input type="file" className="hidden" accept="video/*,audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              {file && <p className="text-xs text-emerald-400 mt-2">Selected: {file.name} <button onClick={() => setFile(null)} className="text-red-400 ml-2 hover:underline">Remove</button></p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CTR (%)</label>
                <input
                  value={data.ctr}
                  onChange={(e) => setData({ ...data, ctr: e.target.value })}
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-sm focus:border-purple-500/50 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Watch Time (s)</label>
                <input
                  value={data.watch_time}
                  onChange={(e) => setData({ ...data, watch_time: e.target.value })}
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-sm focus:border-purple-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Audience</label>
              <input
                value={data.target_audience}
                onChange={(e) => setData({ ...data, target_audience: e.target.value })}
                placeholder="e.g. Gen Z Athletes"
                className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-sm focus:border-purple-500/50 transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ad Platform</label>
                <input
                  value={data.ad_platform}
                  onChange={(e) => setData({ ...data, ad_platform: e.target.value })}
                  placeholder="e.g. TikTok"
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-sm focus:border-purple-500/50 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Marketing Goal</label>
                <input
                  value={data.marketing_goal}
                  onChange={(e) => setData({ ...data, marketing_goal: e.target.value })}
                  placeholder="e.g. Conversion"
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-sm focus:border-purple-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product Category</label>
                <input
                  value={data.product_category}
                  onChange={(e) => setData({ ...data, product_category: e.target.value })}
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-sm focus:border-purple-500/50 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Brand Voice</label>
                <input
                  value={data.brand_voice}
                  onChange={(e) => setData({ ...data, brand_voice: e.target.value })}
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-sm focus:border-purple-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Creative Intent</label>
              <textarea
                value={data.video_description}
                onChange={(e) => setData({ ...data, video_description: e.target.value })}
                className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-sm min-h-[100px] resize-none focus:border-purple-500/50 transition-all outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase text-zinc-500 hover:text-white transition-colors"
            >
              Abort Mission
            </button>
            <button
              onClick={() => onStart({ ...data, file })}
              disabled={!data.video_url && !file}
              className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all duration-500 ${(!data.video_url && !file) ? 'bg-zinc-800 text-zinc-600' : 'bg-white text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                }`}
            >
              Initialize Pipeline
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [pipelineState, setPipelineState] = useState<"idle" | "video" | "transfer" | "marketing" | "complete">("idle");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [reportResult, setReportResult] = useState<any>(null);

  const handleStartPipeline = async (data: any) => {
    setIsModalOpen(false);
    setPipelineData(data);
    setLoading(true);
    setPipelineState("video");

    try {
      // 1. Video Agent Phase
      let videoRes;
      if (data.file) {
        const formData = new FormData();
        formData.append("file", data.file);
        videoRes = await axios.post("http://127.0.0.1:8001/analyze/video/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        videoRes = await axios.post("http://127.0.0.1:8001/analyze/video", {
          video_url: data.video_url,
          video_description: data.video_description,
          metrics: { ctr: Number(data.ctr), watch_time: Number(data.watch_time) },
          target_audience: data.target_audience
        });
      }

      // 2. Transfer Phase
      setPipelineState("transfer");
      await new Promise(r => setTimeout(r, 2000));

      // 3. Marketing Phase
      setPipelineState("marketing");
      const response = await axios.post("http://127.0.0.1:8001/analyze/marketing", {
        video_url: null,
        video_description: videoRes.data.summary || videoRes.data.transcript || data.video_description,
        metrics: { ctr: Number(data.ctr), watch_time: Number(data.watch_time) },
        target_audience: data.target_audience,
        ad_platform: data.ad_platform,
        marketing_goal: data.marketing_goal,
        product_category: data.product_category,
        brand_voice: data.brand_voice
      });

      setReportResult(response.data);
      setPipelineState("complete");
    } catch (error) {
      setPipelineState("idle");
      alert("Pipeline orchestration failed. Check backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-purple-500/30 overflow-hidden font-sans">

      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 min-h-screen flex flex-col items-center justify-center py-20">

        {/* Header Section */}
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            AI Orchestration System Online
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            COMMAND <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-blue-400">CENTER</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium"
          >
            Unified multi-agent workflow for autonomous video transcription and strategic marketing execution.
          </motion.p>
        </div>

        {/* Cinematic Pipeline Layout */}
        <div className="w-full flex flex-col items-center gap-0">

          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 relative">

            {/* PORTAL 1: VIDEO AGENT */}
            <Link href="/video-agent" className="w-full max-w-sm">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`relative p-8 rounded-[40px] border transition-all duration-700 overflow-hidden group ${pipelineState === 'video' ? 'border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] bg-purple-500/5' :
                  pipelineState === 'complete' ? 'border-emerald-500/30 bg-emerald-500/5' :
                    'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
              >
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <span className="text-4xl">🎥</span>
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black tracking-widest uppercase ${pipelineState === 'video' ? 'text-purple-400' : 'text-zinc-500'
                      }`}>Subsystem 01</span>
                    {pipelineState === 'video' && <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Video Intelligence</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Audio extraction, Whisper transcription, and creative analysis agents.</p>
                  <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                    <span>Enter Environment</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* THE BRIDGE / ORCHESTRATOR */}
            <div className="relative flex flex-col items-center justify-center h-48 md:h-0 md:w-64 z-20">

              {/* Connection Beam (Horizontal Desktop) */}
              <div className="hidden md:block absolute left-0 right-0 h-[2px] bg-white/5">
                <AnimatePresence>
                  {(pipelineState === 'transfer' || pipelineState === 'marketing' || pipelineState === 'complete') && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      className={`h-full ${pipelineState === 'complete' ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                        }`}
                    />
                  )}
                </AnimatePresence>

                {/* Flow Particles */}
                {pipelineState === 'transfer' && (
                  <motion.div
                    className="absolute inset-0 hidden md:flex items-center justify-around"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                        animate={{ x: [-50, 200], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Main Execution Button */}
              <motion.button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-700 z-30 ${loading
                  ? 'border-white/20 bg-black/80 scale-110 shadow-[0_0_60px_rgba(168,85,247,0.3)]'
                  : pipelineState === 'complete'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_60px_rgba(16,185,129,0.3)]'
                    : 'border-white/10 bg-black/60 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]'
                  }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black tracking-widest uppercase">Orchestrating</span>
                  </div>
                ) : pipelineState === 'complete' ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">✓</span>
                    <span className="text-[10px] font-black tracking-widest uppercase">Task Success</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-500 mb-2">Initialize</span>
                    <span className="text-sm font-black tracking-widest uppercase">Run Full Pipeline</span>
                  </div>
                )}

                {/* Animated Inner Rings */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 0.1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-purple-400"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* PORTAL 2: MARKETING ENGINE */}
            <Link href="/marketing-agent" className="w-full max-w-sm">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`relative p-8 rounded-[40px] border transition-all duration-700 overflow-hidden group ${pipelineState === 'marketing' ? 'border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.2)] bg-blue-500/5' :
                  pipelineState === 'complete' ? 'border-emerald-500/30 bg-emerald-500/5' :
                    'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
              >
                <div className="absolute top-0 left-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <span className="text-4xl">🧠</span>
                </div>
                <div className="relative z-10 space-y-4 text-right">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <span className={`text-[10px] font-black tracking-widest uppercase ${pipelineState === 'marketing' ? 'text-blue-400' : 'text-zinc-500'
                      }`}>Subsystem 02</span>
                    {pipelineState === 'marketing' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Strategy Engine</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Metrics synthesis, strategy generation, and creative evaluation agents.</p>
                  <div className="pt-4 flex items-center justify-end gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Enter Environment</span>
                  </div>
                </div>
              </motion.div>
            </Link>

          </div>

          {/* Orchestration Status Label */}
          <AnimatePresence>
            {pipelineState !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-12 px-6 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold tracking-widest text-zinc-500 uppercase"
              >
                {pipelineState === 'video' && "Step 01: Extracting Audio & Transcribing Creative Asset"}
                {pipelineState === 'transfer' && "Data Link Active: Transferring Intelligence to Strategy Engine"}
                {pipelineState === 'marketing' && "Step 02: Synthesizing Metrics & Generating Strategy"}
                {pipelineState === 'complete' && "Pipeline Orchestration Successful: All Agents Terminated"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render the Executive Briefing Output Panel */}
          {pipelineState === 'complete' && reportResult && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 w-full max-w-5xl"
            >
               <OutputPanel result={reportResult} missionData={pipelineData} />
            </motion.div>
          )}

        </div>

        {/* INITIALIZATION MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <InitializationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onStart={handleStartPipeline}
            />
          )}
        </AnimatePresence>

      </main>


    </div>
  );
}