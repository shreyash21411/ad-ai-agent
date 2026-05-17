"use client";

import { motion } from "framer-motion";

interface VideoWorkspaceProps {
  url: string;
  onChangeUrl: (val: string) => void;
  description: string;
  onChangeDescription: (val: string) => void;
  status: string;
  transcript?: string;
  summary?: string;
  duration?: number;
  onRun: () => void;
  loading: boolean;
}

export function VideoWorkspace({
  url,
  onChangeUrl,
  description,
  onChangeDescription,
  status,
  transcript,
  summary,
  duration,
  onRun,
  loading
}: VideoWorkspaceProps) {
  const isDone = status === "completed";

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 block">Source Video URL</label>
          <div className="relative group">
            <input
              value={url}
              onChange={(e) => onChangeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full p-4 bg-black/40 border border-zinc-800 rounded-2xl text-sm text-zinc-200 transition-all duration-300 focus:bg-black focus:border-purple-500/50 outline-none group-hover:border-zinc-700"
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              <span className="text-xl opacity-50">🔗</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-3 block">Creative Intent / Description</label>
          <textarea
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="Describe what happens in this video..."
            className="w-full p-4 bg-black/40 border border-zinc-800 rounded-2xl text-sm text-zinc-200 resize-none h-32 transition-all duration-300 focus:bg-black focus:border-purple-500/50 outline-none group-hover:border-zinc-700"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[10px] font-bold text-purple-400">
            AUDIO EXTRACTION
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[10px] font-bold text-purple-400">
            WHISPER OCR
          </div>
        </div>
        <button
          onClick={onRun}
          disabled={loading || !url}
          className={`px-8 py-3 rounded-xl font-black text-xs tracking-widest transition-all duration-300 ${
            loading 
              ? "bg-purple-900/30 text-purple-300 cursor-not-allowed"
              : "bg-purple-500 text-white hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          }`}
        >
          {loading ? "INITIALIZING..." : "EXECUTE WORKSPACE"}
        </button>
      </div>

      {/* Output Section */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 space-y-6"
        >
          <div className="p-6 rounded-2xl bg-black/60 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Master Transcript</h4>
              {duration && <span className="text-[10px] text-zinc-500 font-mono">Length: {duration}s</span>}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed italic">
              &ldquo;{transcript}&rdquo;
            </p>
          </div>

          {summary && (
            <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">AI Context Synthesis</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {summary}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4">
             {['Hook analysis complete', 'Pacing verified', 'Emotional triggers identified'].map((badge, i) => (
               <div key={i} className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                 <span className="text-[9px] font-bold text-emerald-400/80 uppercase">{badge}</span>
               </div>
             ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
