/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Database, Rss, Languages, Headphones, FileText } from 'lucide-react';

interface DiagnosticsHUDProps {
  libraryCount: number;
  arxivStatus: 'online' | 'offline' | 'loading' | 'cached';
  papersCount: number;
  teluguLinguisticActive: boolean;
}

export default function DiagnosticsHUD({ libraryCount, arxivStatus, papersCount, teluguLinguisticActive }: DiagnosticsHUDProps) {
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="jarvis-diagnostics-bar" className="border border-cyan-500/10 bg-cyan-950/5 rounded-lg p-4 font-mono select-none glow-cyan relative overflow-hidden">
      {/* Decorative scanline background */}
      <div className="absolute inset-0 scanlines opacity-5 pointer-events-none"></div>

      {/* Header section */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
        <span className="text-[10px] uppercase font-semibold text-cyan-400 tracking-widest flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 animate-pulse" /> SYSTEM DIAGNOSTICS
        </span>
        <span className="text-[9px] text-cyan-600/80">SGNL_FREQ_CS.AI</span>
      </div>

      {/* Grid statistics list */}
      <div className="space-y-2 text-xs">
        {/* Real-time sync clock */}
        <div className="flex justify-between items-center py-1 border-b border-cyan-500/5">
          <span className="text-cyan-500/70">TIME_STAMP</span>
          <span className="text-cyan-400 text-glow-cyan text-[10px]">{currentTime}</span>
        </div>

        {/* ArXiv connection state */}
        <div className="flex justify-between items-center py-1 border-b border-cyan-500/5">
          <span className="text-cyan-500/70">ARXIV_FEED</span>
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${
              arxivStatus === 'online' 
                ? 'bg-emerald-400' 
                : arxivStatus === 'cached'
                  ? 'bg-amber-400 animate-pulse'
                  : arxivStatus === 'loading' 
                    ? 'bg-cyan-400 animate-ping' 
                    : 'bg-rose-500'
            }`}></span>
            <span className={
              arxivStatus === 'online' 
                ? 'text-emerald-400' 
                : arxivStatus === 'cached'
                  ? 'text-amber-400 font-bold'
                  : arxivStatus === 'loading'
                    ? 'text-cyan-400'
                    : 'text-rose-500'
            }>
              {arxivStatus === 'online' 
                ? 'CONNECTED' 
                : arxivStatus === 'cached'
                  ? 'LOCAL VAULT'
                  : arxivStatus === 'loading' 
                    ? 'QUERYING' 
                    : 'OFFLINE'
              }
            </span>
          </span>
        </div>

        {/* Papers fetched count */}
        <div className="flex justify-between items-center py-1 border-b border-cyan-500/5">
          <span className="text-cyan-500/70 text-glow-cyan">FEED_LOC_SIZE</span>
          <span className="text-cyan-400">{papersCount} SIGNAL RECORDS</span>
        </div>

        {/* Secured library depth */}
        <div className="flex justify-between items-center py-1 border-b border-cyan-500/5">
          <span className="text-cyan-500/70">LIBRARY_ARCHIVE</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <span className="bg-cyan-500/10 border border-cyan-500/20 px-1 rounded text-[10px]">
              {libraryCount} ITEMS
            </span>
          </span>
        </div>

        {/* Telugu translator engine state */}
        <div className="flex justify-between items-center py-1 border-b border-cyan-500/5">
          <span className="text-cyan-500/70">TELUGU_ENGINE</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-emerald-400 text-[10px]">STANDBY</span>
          </span>
        </div>

        {/* Voice synthesis details */}
        <div className="flex justify-between items-center py-1">
          <span className="text-cyan-500/70">SPEECH_AUDIO</span>
          <span className="text-cyan-400 flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-[10px] text-emerald-400">BRITISH SYS READY</span>
          </span>
        </div>
      </div>

      {/* Decorative Blueprint Corner Decals */}
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-500/40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-500/40 pointer-events-none"></div>
    </div>
  );
}
