"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Link from "next/link";

export default function VideoAgentPage() {
  const [form, setForm] = useState({
    video_url: "",
    video_description: "A 15-second shoe ad showing someone running in the park with slow motion shots",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "working" | "completed" | "error">("idle");
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    if (!form.video_url && !file) return;
    setLoading(true);
    setStatus("working");
    setResult(null);

    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        response = await axios.post("http://127.0.0.1:8001/analyze/video/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        response = await axios.post("http://127.0.0.1:8001/analyze/video", {
          video_url: form.video_url,
          video_description: form.video_description,
          metrics: { ctr: 0.5, watch_time: 2.0 },
          target_audience: "General"
        });
      }

      setResult(response.data);
      setStatus("completed");
    } catch (error) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-purple-500/30 font-sans">
      
      {/* Navigation Header */}
      <nav className="border-b border-zinc-900 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all group-hover:border-purple-500/50">
               <span className="text-zinc-400 group-hover:text-white transition-colors">←</span>
            </div>
            <div>
              <p className="hidden sm:block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Return to Dashboard</p>
              <h1 className="text-sm font-bold text-white tracking-tight">AI COMMAND CENTER</h1>
            </div>
          </Link>

          <div className="flex items-center gap-4">
             <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-widest transition-all duration-500 ${
               status === 'working' ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' :
               status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
               'bg-zinc-900 border-zinc-800 text-zinc-500'
             }`}>
               {status === 'idle' ? 'SYSTEM STANDBY' : status.toUpperCase()}
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-6">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-2">Video Intelligence</h2>
                <p className="text-zinc-500 text-sm">Deploy audio extraction and AI transcription agents to analyze creative assets.</p>
              </div>

              <div className="space-y-6 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 glass">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Video Asset (URL or File)</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      value={form.video_url}
                      onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                      placeholder="Enter YouTube URL..."
                      className="flex-1 p-4 bg-black/40 border border-zinc-800 rounded-2xl text-sm transition-all focus:border-purple-500/50 outline-none"
                      disabled={!!file}
                    />
                    <label className="flex items-center justify-center px-6 py-4 sm:py-0 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-2xl cursor-pointer transition-all">
                      <span className="text-xs font-bold uppercase tracking-wider">{file ? "File Selected" : "Upload File"}</span>
                      <input type="file" className="hidden" accept="video/*,audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  {file && <p className="text-xs text-emerald-400 mt-2">Selected: {file.name} <button onClick={() => setFile(null)} className="text-red-400 ml-2 hover:underline">Remove</button></p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Creative Intent</label>
                  <textarea
                    value={form.video_description}
                    onChange={(e) => setForm({ ...form, video_description: e.target.value })}
                    className="w-full p-4 bg-black/40 border border-zinc-800 rounded-2xl text-sm min-h-[120px] resize-none outline-none focus:border-purple-500/50"
                  />
                </div>

                <button
                  onClick={handleRun}
                  disabled={loading || (!form.video_url && !file)}
                  className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 ${
                    loading 
                      ? "bg-purple-900/30 text-purple-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-95"
                  }`}
                >
                  {loading ? "INITIALIZING AGENTS..." : "DEPLOY INTELLIGENCE"}
                </button>
              </div>
            </section>

            {/* Sub-Agent Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { name: "Audio Extraction", status: status === 'working' ? 'active' : status === 'completed' ? 'done' : 'idle' },
                 { name: "Whisper OCR", status: status === 'working' ? 'active' : status === 'completed' ? 'done' : 'idle' },
                 { name: "Semantic Analysis", status: status === 'working' ? 'active' : status === 'completed' ? 'done' : 'idle' },
                 { name: "Report Gen", status: status === 'working' ? 'active' : status === 'completed' ? 'done' : 'idle' },
               ].map((agent, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{agent.name}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-purple-500 animate-pulse' :
                      agent.status === 'done' ? 'bg-emerald-500' : 'bg-zinc-800'
                    }`} />
                 </div>
               ))}
            </div>
          </div>

          {/* Right Column: Intelligence Reports */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {status === 'idle' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-3xl bg-zinc-900/10"
                >
                  <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                     <span className="text-3xl grayscale opacity-50">🎥</span>
                  </div>
                  <p className="text-zinc-500 text-sm font-medium">Awaiting mission parameters...</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Master Transcript */}
                  <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 glass">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Master Intelligence Transcript</h3>
                       {result?.duration && <span className="text-[10px] font-mono text-zinc-500">Duration: {result.duration}s</span>}
                    </div>
                    {status === 'working' ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-zinc-800/50 rounded-full w-full animate-pulse" />
                        <div className="h-4 bg-zinc-800/50 rounded-full w-[90%] animate-pulse" />
                        <div className="h-4 bg-zinc-800/50 rounded-full w-[95%] animate-pulse" />
                      </div>
                    ) : result?.error ? (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                         <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Agent Error</p>
                         <p className="text-sm text-red-300/80">{result.error}</p>
                      </div>
                    ) : (
                      <p className="text-lg text-zinc-200 leading-relaxed italic font-serif">
                        &ldquo;{result?.transcript || "No speech detected in this asset."}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Analysis Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 glass">
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">AI Context Synthesis</h4>
                       <p className="text-sm text-zinc-400 leading-relaxed">
                         {result?.summary || "Analyzing creative narrative flow and key thematic elements..."}
                       </p>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 glass">
                       <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Creative Recommendations</h4>
                       <ul className="space-y-3">
                         {['Optimize hook within first 2s', 'Enhance emotional resolution', 'Stronger CTA visual contrast'].map((rec, i) => (
                           <li key={i} className="flex items-center gap-3 text-xs text-zinc-300">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             {rec}
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>

                  {/* Execution Timeline */}
                  <div className="bg-black/40 border border-zinc-800/80 rounded-3xl p-8">
                     <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8">Agent Log Hierarchy</h4>
                     <div className="space-y-6">
                        {[
                          { time: "0.4s", task: "Audio stream detached from container", icon: "🔉" },
                          { time: "1.2s", task: "VAD (Voice Activity Detection) active", icon: "📊" },
                          { time: "2.8s", task: "Whisper-Large-v3 model inference complete", icon: "⚡" },
                        ].map((log, i) => (
                          <div key={i} className="flex items-center gap-4 group">
                             <span className="text-[10px] font-mono text-zinc-600 w-10">{log.time}</span>
                             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm">
                               {log.icon}
                             </div>
                             <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{log.task}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .glass {
          background: rgba(17, 24, 39, 0.4);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
