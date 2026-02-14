
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentNode, SimulationMode, UseCase } from '../types';
import { COMPONENT_ICONS } from '../constants';
import { Play, RotateCcw, CloudRain, Sun, Pause, Info, HelpCircle, Server } from 'lucide-react';

interface SimulationCanvasProps {
  useCase: UseCase;
  mode: SimulationMode;
  nodes: ComponentNode[];
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ useCase, mode, nodes = [] }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);

  const steps = useMemo(() => {
    if (!useCase) return [];
    return (mode === SimulationMode.SUNNY ? useCase.sunnySteps : useCase.rainySteps) || [];
  }, [useCase, mode]);

  useEffect(() => {
    setActiveStepIndex(-1);
    setIsPlaying(false);
  }, [steps]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && steps.length > 0 && activeStepIndex < steps.length - 1) {
      timer = setTimeout(() => {
        setActiveStepIndex(prev => prev + 1);
      }, 1000);
    } else if (steps.length > 0 && activeStepIndex === steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStepIndex, steps.length]);

  const reset = () => {
    setActiveStepIndex(-1);
    setIsPlaying(false);
  };

  const handleNodeClick = (nodeId: string) => {
    if (isPlaying) return;
    const nextStepData = steps[activeStepIndex + 1];
    if (nextStepData && nextStepData.from === nodeId) {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const getPos = (id: string) => nodes.find(n => n.id === id) || { x: 0, y: 0 };

  // Safety check for components
  if (!useCase || !nodes || nodes.length === 0) {
    return (
      <div className="bg-slate-950 rounded-[3rem] h-[550px] flex items-center justify-center border border-white/5">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Awaiting Simulation Data...</p>
      </div>
    );
  }

  const allFlows = (useCase.sunnySteps || []).concat(useCase.rainySteps || []);

  return (
    <div className="bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl relative min-h-[550px] border border-white/5 flex flex-col">
      <div className="p-8 flex justify-between items-center bg-white/5 backdrop-blur-md z-10 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-6">
           <div className={`p-3 rounded-2xl ${mode === SimulationMode.SUNNY ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
             {mode === SimulationMode.SUNNY ? <Sun size={24}/> : <CloudRain size={24}/>}
           </div>
           <div>
             <h4 className="text-white text-lg font-black tracking-tight">{useCase.title}</h4>
             <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{mode} Traffic Simulation</span>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-[9px] text-blue-500 font-black uppercase tracking-[0.2em]">Step: {activeStepIndex + 1}/{steps.length}</span>
             </div>
           </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTooltips(!showTooltips)}
            className={`p-3 rounded-2xl transition-all ${showTooltips ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}
            title="Toggle Component Labels"
          >
            <HelpCircle size={20} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={steps.length === 0}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${isPlaying ? 'bg-amber-600 shadow-amber-900/20' : 'bg-blue-600 shadow-blue-900/20'} text-white shadow-xl disabled:opacity-50`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span>{isPlaying ? 'Pause' : 'Auto Run'}</span>
          </button>
          <button onClick={reset} className="p-3 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition-all">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
        <svg className="w-full h-full max-w-[800px]" viewBox="0 0 600 300">
          {/* Static Links */}
          {allFlows.map((step, idx) => {
             const start = getPos(step.from);
             const end = getPos(step.to);
             return (
               <line 
                 key={idx} 
                 x1={start.x} y1={start.y} 
                 x2={end.x} y2={end.y} 
                 stroke="#ffffff08" strokeWidth="1" strokeDasharray="5,5" 
               />
             );
          })}

          <AnimatePresence>
            {activeStepIndex >= 0 && steps[activeStepIndex] && (
              <motion.g
                key={activeStepIndex}
                initial={{ x: getPos(steps[activeStepIndex].from).x, y: getPos(steps[activeStepIndex].from).y }}
                animate={{ x: getPos(steps[activeStepIndex].to).x, y: getPos(steps[activeStepIndex].to).y }}
                transition={{ duration: 0.7, ease: "circInOut" }}
              >
                <circle r="6" fill={steps[activeStepIndex].status === 'failure' ? '#ef4444' : '#3b82f6'} />
                <circle r="12" fill={steps[activeStepIndex].status === 'failure' ? '#ef444420' : '#3b82f620'} className="animate-ping" />
              </motion.g>
            )}
          </AnimatePresence>

          {nodes.map((n) => {
            const isActive = activeStepIndex >= 0 && steps[activeStepIndex] && (steps[activeStepIndex].from === n.id || steps[activeStepIndex].to === n.id);
            const isNextSource = !isPlaying && activeStepIndex < steps.length - 1 && steps[activeStepIndex + 1]?.from === n.id;
            
            return (
              <g key={n.id} transform={`translate(${n.x - 22}, ${n.y - 22})`} 
                 className="cursor-pointer select-none"
                 onClick={() => handleNodeClick(n.id)}>
                
                {isNextSource && (
                  <motion.rect 
                    width="44" height="44" rx="14" fill="none" stroke="#3b82f6" strokeWidth="2"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}

                <rect 
                  width="44" height="44" rx="14" 
                  fill={isActive ? "#1e293b" : "#0f172a"} 
                  stroke={isActive ? "#3b82f6" : "#1e293b"} 
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                
                <foreignObject width="44" height="44">
                  <div className={`flex items-center justify-center h-full transition-colors ${isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                    {React.cloneElement(COMPONENT_ICONS[n.type] as any || <Server size={20}/>, { size: 20 })}
                  </div>
                </foreignObject>

                {(showTooltips || isActive) && (
                  <text y="-10" x="22" textAnchor="middle" fill={isActive ? "#fff" : "#475569"} 
                        className="text-[9px] font-black uppercase tracking-widest pointer-events-none">
                    {n.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="p-8 bg-white/5 border-t border-white/5 backdrop-blur-md">
        <div className="flex gap-6 items-center max-w-4xl mx-auto">
           <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-400 shrink-0 shadow-lg"><Info size={20} /></div>
           <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Packet Context</div>
              <p className="text-sm text-slate-200 font-bold leading-relaxed">
                {activeStepIndex === -1 ? "Simulation Initialized. Click highlighted component to start manual flow or press 'Auto Run'." : (steps[activeStepIndex]?.label || "Processing request...")}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationCanvas;
