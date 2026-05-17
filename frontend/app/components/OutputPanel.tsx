"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { Download, ChevronDown, ChevronUp, FileText, Target, Activity, Tag, Zap, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, LayoutTemplate } from "lucide-react";

interface OutputPanelProps {
  result: any;
  missionData?: any;
}

export function OutputPanel({ result, missionData }: OutputPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!result) return null;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    
    // Slight delay to ensure UI updates if needed
    await new Promise(r => setTimeout(r, 100));

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = reportRef.current;
      const opt: any = {
        margin: 10,
        filename: 'ai-executive-briefing.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Failed to generate PDF report.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
            isGeneratingPdf 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95'
          }`}
        >
          {isGeneratingPdf ? (
            <>
               <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
               Generating Protocol
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Dossier
            </>
          )}
        </button>
      </div>

      {/* 📄 PDF EXPORT WRAPPER */}
      <div ref={reportRef} className="flex flex-col gap-8 bg-[#030712] p-2 md:p-6 rounded-[40px] text-white">

        {/* =========================================================================
            SECTION 1: MISSION OVERVIEW
        ========================================================================= */}
        {missionData && (
          <div className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/50">
               <div className="flex items-center gap-3">
                 <FileText className="text-zinc-500 w-5 h-5" />
                 <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Mission Parameters</h2>
               </div>
               <span className="px-3 py-1 rounded bg-black/50 text-[9px] text-zinc-500 font-mono tracking-widest border border-zinc-800">
                 ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
               </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800/50">
              <div className="bg-[#030712] p-6 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><LayoutTemplate className="w-3 h-3" /> Platform</p>
                <p className="text-sm font-medium text-zinc-200">{missionData.ad_platform || "N/A"}</p>
              </div>
              <div className="bg-[#030712] p-6 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3" /> Marketing Goal</p>
                <p className="text-sm font-medium text-zinc-200">{missionData.marketing_goal || "N/A"}</p>
              </div>
              <div className="bg-[#030712] p-6 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Tag className="w-3 h-3" /> Product Category</p>
                <p className="text-sm font-medium text-zinc-200">{missionData.product_category || "N/A"}</p>
              </div>
              <div className="bg-[#030712] p-6 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Activity className="w-3 h-3" /> Target Audience</p>
                <p className="text-sm font-medium text-zinc-200 truncate">{missionData.target_audience || "N/A"}</p>
              </div>
            </div>
            
            <div className="bg-[#030712] p-6 border-t border-zinc-800/50">
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Creative Intent Baseline</p>
               <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-zinc-800 pl-4 py-1">
                 "{missionData.video_description || "No baseline provided."}"
               </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 3: EXECUTIVE SUMMARY (Hero)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <div className="md:col-span-1 p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] relative overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50" />
            <p className="text-zinc-400 font-black mb-4 uppercase tracking-[0.3em] text-[10px] relative z-10">Engagement Score</p>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-7xl font-black text-white tracking-tighter">
                {result.score?.engagement_score}
              </span>
              <span className="text-2xl text-zinc-600 font-bold">/10</span>
            </div>
            <div className="flex gap-3 mt-8 relative z-10">
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase ${
                result.score?.rating === "poor" ? "bg-red-500/20 text-red-400 border border-red-500/30" : 
                result.score?.rating === "average" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : 
                "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {result.score?.rating}
              </span>
            </div>
          </div>

          {/* Critical Insight / Verdict */}
          {result.problems?.length > 0 ? (
            <div className="md:col-span-2 p-10 bg-red-500/5 border border-red-500/20 rounded-[32px] relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
              <h3 className="text-red-400 mb-6 font-black text-[10px] tracking-[0.3em] uppercase flex items-center gap-3">
                <AlertCircle className="w-4 h-4" />
                Critical Performance Blocker
              </h3>
              <p className="font-semibold text-white text-2xl md:text-3xl leading-tight mb-4">{result.problems[0].issue}</p>
              <p className="text-zinc-400 text-base leading-relaxed">{result.problems[0].impact}</p>
            </div>
          ) : (
            <div className="md:col-span-2 p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] relative overflow-hidden flex flex-col justify-center">
               <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
               <h3 className="text-emerald-400 mb-6 font-black text-[10px] tracking-[0.3em] uppercase flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4" />
                System Optimal
              </h3>
               <p className="text-zinc-300 text-xl">No critical performance blockers detected in the current iteration. The creative is primed for execution.</p>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 4: KEY INTELLIGENCE
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Root Causes */}
          <div className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] h-full border-t-4 border-t-blue-500/50">
             <h3 className="text-blue-400 mb-8 font-black text-[10px] tracking-[0.3em] uppercase flex items-center gap-3">
                <TrendingDown className="w-4 h-4" />
                Root Cause Analysis
             </h3>
             <ul className="space-y-6">
                {result.causes?.map((cause: string, i: number) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                       {i+1}
                    </div>
                    <span className="text-sm text-zinc-300 leading-relaxed">{cause}</span>
                  </li>
                ))}
                {(!result.causes || result.causes.length === 0) && (
                  <p className="text-zinc-500 text-sm">No significant root causes identified.</p>
                )}
             </ul>
          </div>

          {/* Strategic Actions */}
          <div className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] h-full border-t-4 border-t-emerald-500/50">
             <h3 className="text-emerald-400 mb-8 font-black text-[10px] tracking-[0.3em] uppercase flex items-center gap-3">
                <TrendingUp className="w-4 h-4" />
                Strategic Actions
             </h3>
             <div className="space-y-5">
                {result.recommendations?.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-4 items-start bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-sm text-zinc-200 leading-relaxed">{rec}</p>
                  </div>
                ))}
                {(!result.recommendations || result.recommendations.length === 0) && (
                  <p className="text-zinc-500 text-sm">No strategic actions recommended.</p>
                )}
             </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: GENERATED CREATIVE CONCEPT (Cinematic Redesign)
        ========================================================================= */}
        {result.new_ad_idea && (
          <div className="mt-4 border border-purple-500/30 rounded-[40px] overflow-hidden">
            
            {/* Header */}
            <div className="bg-purple-900/20 border-b border-purple-500/30 p-8 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent opacity-50 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-purple-300 font-black text-[10px] tracking-[0.4em] uppercase mb-2">Campaign Blueprint</h3>
                <h2 className="text-3xl font-black text-white tracking-tight">AI Generated Concept</h2>
              </div>
              <div className="relative z-10 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-[10px] font-black tracking-widest uppercase border border-purple-500/30 backdrop-blur-md self-start">
                Ready For Production
              </div>
            </div>

            {/* Content Body */}
            <div className="bg-zinc-950 p-8 md:p-12 space-y-12">
              
              {/* 🎬 THE HOOK */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-purple-400 font-black text-[10px] tracking-[0.3em] uppercase">Phase 01 / The Hook</h4>
                </div>
                <div className="pl-14">
                  <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                    {result.new_ad_idea.hook}
                  </p>
                </div>
              </div>

              {/* 📖 STORY FLOW */}
              <div className="relative border-t border-zinc-800 pt-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <LayoutTemplate className="w-5 h-5" />
                  </div>
                  <h4 className="text-blue-400 font-black text-[10px] tracking-[0.3em] uppercase">Phase 02 / Story Flow</h4>
                </div>
                <div className="pl-14">
                  <p className="text-base text-zinc-300 leading-loose">
                    {result.new_ad_idea.content}
                  </p>
                </div>
              </div>

              {/* 🎯 CTA */}
              <div className="relative border-t border-zinc-800 pt-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="text-emerald-400 font-black text-[10px] tracking-[0.3em] uppercase">Phase 03 / Action Driver</h4>
                </div>
                <div className="pl-14">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl inline-block max-w-2xl">
                    <p className="text-lg text-emerald-100 font-bold tracking-wide">
                      {result.new_ad_idea.cta}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 6: ADVANCED ANALYTICS (Collapsible)
        ========================================================================= */}
        {result.meta?.evaluation_history && result.meta.evaluation_history.length > 0 && (
          <div className="mt-8 border border-zinc-800/80 bg-zinc-900/20 rounded-3xl overflow-hidden">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-8 py-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Activity className="w-5 h-5 text-zinc-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Advanced System Analytics</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{result.meta.evaluation_history.length} Iteration Loops</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </div>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 border-t border-zinc-800/80 space-y-6">
                    {result.meta.evaluation_history.map((eval_point: any, idx: number) => (
                      <div key={idx} className="p-6 rounded-2xl border border-zinc-800 bg-black/40 flex flex-col md:flex-row gap-6 md:items-center">
                        
                        {/* Iteration Badge */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-black text-lg">
                            {eval_point.iteration}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Score</span>
                            <div className="flex items-center gap-2">
                               <span className={`text-xl font-black ${eval_point.needs_improvement ? 'text-red-400' : 'text-emerald-400'}`}>
                                 {eval_point.score}
                               </span>
                               {eval_point.score_delta !== 0 && (
                                 <span className={`text-xs font-bold ${eval_point.score_delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                   {eval_point.score_delta > 0 ? '+' : ''}{eval_point.score_delta}
                                 </span>
                               )}
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-zinc-800 shrink-0" />

                        {/* Coverage Details */}
                        <div className="flex-1 flex flex-col gap-3">
                          {eval_point.coverage && Object.keys(eval_point.coverage).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(eval_point.coverage).map(([id, details]: [string, any]) => {
                                const status = typeof details === 'string' ? details : details.status;
                                return (
                                  <span key={id} className={`text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border uppercase tracking-wider ${
                                    status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                    status === 'partial' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}>
                                    {status === 'resolved' ? '✔' : status === 'partial' ? '⚠' : '✖'} {id.replace(/_/g, ' ')}
                                  </span>
                                )
                              })}
                            </div>
                          )}

                          {eval_point.regressions && eval_point.regressions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {eval_point.regressions.map((reg: string, i: number) => (
                                <p key={i} className="text-[9px] font-bold text-red-400 bg-red-500/5 border border-red-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                                  <span>⚠</span> REGRESSION: {reg}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status */}
                        <div className="shrink-0">
                           <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                             eval_point.needs_improvement 
                               ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                               : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                           }`}>
                             {eval_point.needs_improvement ? 'REJECTED' : 'APPROVED'}
                           </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Final Output Status */}
                    {result.meta?.approval_reason && (
                      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Approval Reasoning
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{result.meta.approval_reason}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
