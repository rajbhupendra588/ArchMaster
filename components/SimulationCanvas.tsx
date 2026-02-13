
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentNode, SimulationMode, UseCase, DataFlow } from '../types';
import { COMPONENT_ICONS } from '../constants';
import { Play, RotateCcw, CloudRain, Sun, ChevronRight, Pause, Info } from 'lucide-react';

interface SimulationCanvasProps {
  useCase: UseCase;
  mode: SimulationMode;
}

const NODES: ComponentNode[] = [
  { id: 'client', name: 'User/Client', type: 'client', x: 70, y: 150 },
  { id: 'lb', name: 'Load Balancer', type: 'loadbalancer', x: 200, y: 150 },
  { id: 'api', name: 'API Service', type: 'service', x: 350, y: 150 },
  { id: 'cache', name: 'Redis Cache', type: 'cache', x: 350, y: 50 },
  { id: 'db', name: 'SQL Database', type: 'database', x: 530, y: 90 },
  { id: 'queue', name: 'Task Queue', type: 'queue', x: 530, y: 210 },
];

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ useCase, mode }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = useMemo(() => {
    return (mode === SimulationMode.SUNNY ? useCase?.sunnySteps : useCase?.rainySteps) || [];
  }, [useCase, mode]);

  // CRITICAL: Reset the simulation whenever the steps list changes (switching mode or use case)
  useEffect(() => {
    setActiveStepIndex(-1);
    setIsPlaying(false);
  }, [steps]);

  // Unique connections derived from steps to draw background wires
  const activeConnections = useMemo(() => {
    const pairs = new Set<string>();
    steps.forEach(step => {
      const pair = [step.from, step.to].sort().join('::');
      pairs.add(pair);
    });
    return Array.from(pairs).map(p => p.split('::'));
  }, [steps]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && steps.length > 0 && activeStepIndex < steps.length - 1) {
      timer = setTimeout(() => {
        setActiveStepIndex(prev => prev + 1);
      }, 1500);
    } else if (steps.length > 0 && activeStepIndex === steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStepIndex, steps.length]);

  const reset = () => {
    setActiveStepIndex(-1);
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    // If the next step starts from this node, trigger it
    const nextStepData = steps[activeStepIndex + 1];
    if (nextStepData && nextStepData.from === nodeId && !isPlaying) {
      nextStep();
    }
  };

  const getPos = (id: string) => {
    const node = NODES.find(n => n.id === id);
    if (!node) return NODES[0]; // Fallback if AI provides invalid ID
    return node;
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[500px] border border-slate-800">
      {/* HUD Overlay */}
      <div className="absolute top-6 left-8 right-8 flex justify-between items-start z-10">
        <div className="space-y-1">
          <h4 className="text-white text-lg font-black tracking-tight">{useCase?.title}</h4>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit text-[10px] font-black uppercase tracking-widest border ${mode === SimulationMode.SUNNY ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {mode === SimulationMode.SUNNY ? <Sun size={12}/> : <CloudRain size={12}/>}
            {mode === SimulationMode.SUNNY ? 'Sunny Scenario' : 'Rainy Scenario'}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={steps.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isPlaying ? 'bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">{isPlaying ? 'PAUSE' : 'AUTO PLAY'}</span>
          </button>
          <button 
            onClick={reset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <svg className="w-full h-full min-h-[500px]" viewBox="0 0 600 300">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Connections Background */}
        {activeConnections.map(([from, to]) => {
          const start = getPos(from);
          const end = getPos(to);
          return (
            <path 
              key={`${from}-${to}`}
              d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
              stroke="#1e293b"
              strokeWidth="2"
              strokeDasharray="4 6"
              fill="none"
              className="transition-all duration-700"
            />
          );
        })}

        {/* Data Packets Animation */}
        <AnimatePresence>
          {activeStepIndex >= 0 && steps[activeStepIndex] && (
            <motion.g
              key={`step-${activeStepIndex}`}
              initial={{ x: getPos(steps[activeStepIndex].from).x, y: getPos(steps[activeStepIndex].from).y }}
              animate={{ x: getPos(steps[activeStepIndex].to).x, y: getPos(steps[activeStepIndex].to).y }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <circle 
                r="7" 
                fill={steps[activeStepIndex].status === 'failure' ? '#ef4444' : '#60a5fa'} 
                filter="url(#glow)"
              />
              <motion.circle 
                r="10" 
                fill="none" 
                stroke={steps[activeStepIndex].status === 'failure' ? '#ef4444' : '#60a5fa'} 
                strokeWidth="1.5"
                animate={{ r: [7, 18], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Hardware Components */}
        {NODES.map((node) => {
          const isNextSource = !isPlaying && activeStepIndex < steps.length - 1 && steps[activeStepIndex + 1]?.from === node.id;
          const isActive = activeStepIndex >= 0 && (steps[activeStepIndex].from === node.id || steps[activeStepIndex].to === node.id);
          
          return (
            <g 
              key={node.id} 
              transform={`translate(${node.x - 24}, ${node.y - 24})`}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node.id)}
            >
              {/* Interaction Hint */}
              {isNextSource && (
                <motion.rect
                  width="56" height="56"
                  x="-4" y="-4"
                  rx="16"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="1"
                  animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.95, 1.05, 0.95] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}

              <motion.rect 
                width="48" height="48" 
                rx="14" 
                animate={{ 
                  scale: isActive ? 1.08 : 1,
                  stroke: isActive ? (steps[activeStepIndex]?.status === 'failure' && steps[activeStepIndex].to === node.id ? '#ef4444' : '#60a5fa') : '#334155',
                  fill: isActive ? '#0f172a' : '#1e293b'
                }}
                className="stroke-2 transition-all duration-300"
              />
              
              <foreignObject width="48" height="48">
                <div className={`flex items-center justify-center h-full transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                  {COMPONENT_ICONS[node.type]}
                </div>
              </foreignObject>
              
              <text 
                y="65" 
                x="24" 
                textAnchor="middle" 
                className={`text-[9px] font-black uppercase tracking-wider transition-colors ${isActive ? 'fill-blue-200' : 'fill-slate-600'}`}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Log Section */}
      <div className="absolute bottom-8 left-8 right-8 flex gap-4 items-end">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-5 rounded-[1.5rem] flex-1 flex gap-4 shadow-2xl">
          <div className="bg-blue-600/20 p-2.5 rounded-xl text-blue-400 shrink-0">
            <Info size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Step Details</div>
            <div className="text-[14px] text-slate-200 font-bold leading-relaxed">
              {activeStepIndex === -1 
                ? 'Simulation ready. Start flow to visualize requests.' 
                : steps[activeStepIndex]?.label}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 px-6 py-4 rounded-[1.5rem] flex flex-col items-center justify-center min-w-[100px] shadow-2xl">
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Step</div>
          <div className="text-xl text-white font-black tabular-nums">
            {activeStepIndex + 1}<span className="text-slate-600 text-sm mx-0.5">/</span>{steps.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationCanvas;
