"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type AgentStatus = "idle" | "working" | "completed" | "error";

export interface AgentNode {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  time?: number;
  outputPreview?: string;
}

interface AgentPipelineProps {
  agents: AgentNode[];
}

export function AgentPipeline({ agents }: AgentPipelineProps) {
  return (
    <div className="w-full flex flex-row items-center justify-start md:justify-between gap-4 py-8 overflow-x-auto px-4 scrollbar-hide">
      {agents.map((agent, index) => {
        const isLast = index === agents.length - 1;
        
        return (
          <div key={agent.id} className="flex items-center shrink-0">
            {/* Agent Node */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl w-40 h-40 border transition-all duration-500
                ${agent.status === "working" ? "bg-purple-900/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : ""}
                ${agent.status === "completed" ? "bg-emerald-900/20 border-emerald-500/30" : ""}
                ${agent.status === "idle" ? "bg-zinc-900/50 border-zinc-800" : ""}
                ${agent.status === "error" ? "bg-red-900/20 border-red-500/30" : ""}
              `}
            >
              <div className="text-3xl mb-3">{agent.icon}</div>
              <h3 className="text-sm font-semibold text-zinc-200 text-center">{agent.name}</h3>
              
              {/* Status Indicator */}
              <div className="mt-3 flex flex-col items-center gap-1 h-8">
                {agent.status === "working" && (
                  <span className="text-xs font-medium text-purple-400 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    Working...
                  </span>
                )}
                {agent.status === "completed" && (
                  <>
                    <span className="text-xs font-medium text-emerald-400">Done</span>
                    {agent.time !== undefined && (
                      <span className="text-[10px] text-zinc-500">{agent.time.toFixed(1)}s</span>
                    )}
                  </>
                )}
                {agent.status === "idle" && (
                  <span className="text-xs font-medium text-zinc-600">Waiting</span>
                )}
              </div>
            </motion.div>

            {/* Connection Line */}
            {!isLast && (
              <div className="w-12 md:w-20 h-[2px] mx-2 relative bg-zinc-800 overflow-hidden shrink-0">
                {/* Active Flow Animation */}
                {agent.status === "completed" && agents[index + 1]?.status === "working" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                )}
                {/* Completed Line */}
                {agent.status === "completed" && agents[index + 1]?.status === "completed" && (
                  <div className="absolute inset-0 bg-emerald-500/30" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
