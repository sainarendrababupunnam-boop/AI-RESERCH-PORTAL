/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, Radio, Shield, HelpCircle, Activity, Heart, Sparkles, Mic } from 'lucide-react';

interface JarvisCoreProps {
  isProcessing: boolean;
  isSpeaking: boolean;
  isListening?: boolean;
  persona: 'jarvis' | 'hasini';
  onCoreClick?: () => void;
}

export default function JarvisCore({ isProcessing, isSpeaking, isListening = false, persona, onCoreClick }: JarvisCoreProps) {
  const isHasini = persona === 'hasini';
  
  // Determine core glowing state and colors
  let colorClass = isHasini ? "text-rose-400" : "text-cyan-400";
  let bgClass = isHasini ? "bg-rose-500/10" : "bg-cyan-500/10";
  let glowStyle = isHasini ? "glow-rose" : "glow-cyan";
  let ringSpeed = "animate-spin-slow";
  let reverseRingSpeed = "animate-spin-reverse-slow";

  if (isListening) {
    colorClass = "text-rose-500";
    bgClass = "bg-rose-500/20";
    glowStyle = "glow-rose-strong animate-pulse";
    ringSpeed = "animate-spin-fast";
    reverseRingSpeed = "animate-spin-reverse-slow";
  } else if (isProcessing) {
    colorClass = "text-amber-400";
    bgClass = "bg-amber-500/10";
    glowStyle = "glow-amber";
    ringSpeed = "animate-spin-fast";
    reverseRingSpeed = "animate-spin-fast reverse";
  } else if (isSpeaking) {
    colorClass = isHasini ? "text-pink-400" : "text-emerald-400";
    bgClass = isHasini ? "bg-pink-500/15" : "bg-emerald-500/15";
    glowStyle = isHasini ? "glow-rose-strong" : "glow-emerald";
  }

  return (
    <div 
      id="jarvis-hologram-reactor" 
      className="relative flex flex-col items-center justify-center py-8"
      onClick={onCoreClick}
    >
      {/* Hologram Stage Ring Grid */}
      <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
        <div className={`w-80 h-80 rounded-full border ${isHasini ? 'border-rose-500/5' : 'border-cyan-500/5'} animate-pulse-ring`}></div>
        <div className={`w-96 h-96 rounded-full border ${isHasini ? 'border-rose-500/3' : 'border-cyan-500/3'} pointer-events-none`}></div>
      </div>

      {/* Main Complex Rotating Reactor HUD */}
      <div className={`relative w-64 h-64 flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105 ${glowStyle}`}>
        {/* Concentric Rotating Ring 1 - Outer Tech Arc */}
        <svg 
          className={`absolute w-full h-full ${ringSpeed} ${colorClass} opacity-40`} 
          viewBox="0 0 100 100"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="46" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeDasharray="14 10 30 15 50 12" 
            fill="none" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="43" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="4 8" 
            fill="none" 
          />
        </svg>

        {/* Concentric Rotating Ring 2 - Inner Navigation Dial */}
        <svg 
          className={`absolute w-[85%] h-[85%] ${reverseRingSpeed} ${colorClass} opacity-60`} 
          viewBox="0 0 100 100"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeDasharray="60 30 10 10" 
            fill="none" 
          />
          <path 
            d="M 50,5 L 50,12 M 50,95 L 50,88 M 5,50 L 12,50 M 95,50 L 88,50" 
            stroke="currentColor" 
            strokeWidth="2" 
          />
        </svg>

        {/* Concentric Circle 3 - Technical Tic Hatching */}
        <svg 
          className={`absolute w-[70%] h-[70%] ${ringSpeed} ${colorClass} opacity-80`} 
          viewBox="0 0 100 100"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="2 3" 
            fill="none" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="34" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeDasharray="80 150" 
            fill="none" 
          />
        </svg>

        {/* Pulsing Core Reactor Circle */}
        <div className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${bgClass} border ${isListening ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : isHasini ? 'border-rose-500/30' : 'border-cyan-500/30'} overflow-hidden`}>
          {/* Wave/Glow visualizer inside */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-20 h-20 rounded-full border ${isListening ? 'border-red-400/40 animate-ping' : isHasini ? 'border-rose-400/20' : 'border-cyan-400/20'} absolute ${isSpeaking || isListening ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`w-24 h-24 rounded-full border ${isListening ? 'border-red-400/30 animate-pulse' : isHasini ? 'border-pink-400/20' : 'border-emerald-400/20'} absolute ${isSpeaking || isListening ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>

          {isListening ? (
            <Mic className="w-10 h-10 text-red-500 animate-pulse scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-300" />
          ) : isHasini ? (
            <Heart className={`w-9 h-9 ${colorClass} ${isSpeaking || isProcessing ? "animate-pulse scale-110 text-rose-400 fill-rose-500/30" : "text-rose-400 fill-rose-500/10 opacity-90"} transition-all duration-300`} />
          ) : (
            <Activity className={`w-9 h-9 ${colorClass} ${isSpeaking || isProcessing ? "animate-pulse" : "opacity-80"} transition-colors duration-300`} />
          )}
          
          <span className={`text-[9px] font-mono tracking-widest text-center px-1 mt-1 uppercase leading-none block ${isListening ? 'text-red-400 font-bold' : isHasini ? 'text-rose-400' : 'text-cyan-400'}`}>
            {isProcessing ? "THINKING" : isSpeaking ? "VOCALIZING" : isListening ? "LISTENING" : "ONLINE"}
          </span>
          <span className={`text-[7px] font-mono tracking-wider ${isListening ? 'text-red-500 font-semibold' : isHasini ? 'text-rose-500' : 'text-cyan-600'}`}>
            {isListening ? "VOICE RECG" : isHasini ? "HASINI.v1.2" : "JARVIS.v3.5"}
          </span>
        </div>

        {/* Futuristic corner telemetry sights around the core */}
        <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 ${isListening ? 'border-red-500/60' : isHasini ? 'border-rose-500/40' : 'border-cyan-500/40'} pointer-events-none`}></div>
        <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 ${isListening ? 'border-red-500/60' : isHasini ? 'border-rose-500/40' : 'border-cyan-500/40'} pointer-events-none`}></div>
        <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 ${isListening ? 'border-red-500/60' : isHasini ? 'border-rose-500/40' : 'border-cyan-500/40'} pointer-events-none`}></div>
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 ${isListening ? 'border-red-500/60' : isHasini ? 'border-rose-500/40' : 'border-cyan-500/40'} pointer-events-none`}></div>
      </div>

      {/* Active Speech visualizer footer */}
      {isSpeaking && (
        <div id="jarvis-soundwave-hud" className="flex items-center gap-1.5 mt-5 h-6 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full animate-pulse">
          <div className="w-1 bg-emerald-400 h-2 animate-bounce rounded-full [animation-delay:0.1s]"></div>
          <div className="w-1 bg-emerald-400 h-4 animate-bounce rounded-full [animation-delay:0.3s]"></div>
          <div className="w-1 bg-emerald-400 h-1.5 animate-bounce rounded-full [animation-delay:0.5s]"></div>
          <div className="w-1 bg-emerald-300 h-5 animate-bounce rounded-full [animation-delay:0.2s]"></div>
          <div className="w-1 bg-emerald-400 h-3 animate-bounce rounded-full [animation-delay:0.4s]"></div>
          <div className="w-1 bg-emerald-500 h-2.5 animate-bounce rounded-full [animation-delay:0.7s]"></div>
          <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase ml-1">AUDIO STREAM ACTIVE</span>
        </div>
      )}

      {isListening && (
        <div id="jarvis-soundwave-hud" className="flex items-center gap-1.5 mt-5 h-6 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full animate-bounce">
          <div className="w-1 bg-red-500 h-4 animate-ping rounded-full [animation-delay:0.1s]"></div>
          <div className="w-1 bg-red-400 h-5 animate-bounce rounded-full [animation-delay:0.2s]"></div>
          <div className="w-1 bg-red-500 h-2 animate-bounce rounded-full [animation-delay:0.3s]"></div>
          <div className="w-1 bg-red-400 h-4 animate-bounce rounded-full [animation-delay:0.4s]"></div>
          <div className="w-1 bg-red-500 h-3 animate-bounce rounded-full [animation-delay:0.5s]"></div>
          <span className="text-[10px] font-mono text-red-500 font-bold tracking-widest uppercase ml-1">LISTENING... SPEAK NOW</span>
        </div>
      )}

      {!isSpeaking && !isListening && (
        <div className={`text-[11px] font-mono mt-4 tracking-wider transition-colors duration-200 text-center ${isHasini ? 'text-rose-400/60 hover:text-rose-300' : 'text-cyan-400/50 hover:text-cyan-400'}`}>
          * Click Core to talk to {isHasini ? "Hasini" : "JARVIS"} (Microphone open)
        </div>
      )}
    </div>
  );
}
