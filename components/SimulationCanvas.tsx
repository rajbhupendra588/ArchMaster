
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
  { id: 'db', name: 'SQL Database', type: 'database', x: 530, y: 100 },
  { id: 'queue', name: 'Task Queue', type: 'queue', x: 530, y: 220 },
];

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ useCase, mode }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = useMemo(() => {
    return (mode === SimulationMode.SUNNY ? useCase?.sunnySteps : useCase?.rainySteps) || [];
  }, [useCase, mode]);

  // Dynamically calculate unique connections in the current path
  const connections = useMemo(() => {
    const pairs = new Set<string>();
    steps.forEach(step => {
      const sorted = [step.from, step.to].sort().join('-');
      pairs.add(sorted);
    });
    return Array.from(pairs).map(pair => pair.split('-'));
  }, [steps]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && steps.length > 0 && activeStepIndex < steps.length - 1) {
      timer = setTimeout(() => {
        setActiveStepIndex(prev => prev + 1);
      }, 1800);
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
    const nextPossibleStep = steps[activeStepIndex + 1];
    if (nextPossibleStep && nextPossibleStep.from === nodeId) {
      nextStep();
    }
  };

  const getPos = (id: string) => NODES.find(n => n.id === id) || NODES[0];

  return (
    <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[480px] border border-slate-800 group">
      {/* HUD Header */}
      <div className="absolute top-6 left-8 right-8 flex justify-between items-start z-10 pointer-events-none">
        <div className="space-y-1">
          <div className="text-white text-xl font-black tracking-tight">{useCase?.title}</div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit text-[9px] font-black uppercase tracking-[0.2em] border ${mode === SimulationMode.SUNNY ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {mode === SimulationMode.SUNNY ? <Sun size={12}/> : <CloudRain size={12}/>}
            {mode === SimulationMode.SUNNY ? 'Optimal Flow' : 'Failure Path'}
          </div>
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={steps.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isPlaying ? 'bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'}`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">{isPlaying ? 'PAUSE' : 'AUTO RUN'}</span>
          </button>
          <button 
            onClick={reset}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <svg className="w-full h-full min-h-[480px]" viewBox="0 0 600 300">
        <defs>
          <filter id="packetGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Connection Lines */}
        {connections.map(([from, to]) => {
          const fromNode = getPos(from);
          const toNode = getPos(to);
          return (
            <line 
              key={`${from}-${to}`}
              x1={fromNode.x} y1={fromNode.y}
              x2={toNode.x} y2={toNode.y}
              stroke="#1e293b"
              strokeWidth="2"
              strokeDasharray="4 8"
              className="transition-all duration-1000"
            />
          );
        })}

        {/* Data Packets */}
        <AnimatePresence>
          {activeStepIndex >= 0 && steps[activeStepIndex] && (
            <motion.g
              key={`step-${activeStepIndex}`}
              initial={{ x: getPos(steps[activeStepIndex].from).x, y: getPos(steps[activeStepIndex].from).y }}
              animate={{ 
                x: getPos(steps[activeStepIndex].to).x, 
                y: getPos(steps[activeStepIndex].to).y,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1, ease: "anticipate" }}
            >
              <circle 
                r="7" 
                fill={steps[activeStepIndex].status === 'failure' ? '#ef4444' : '#60a5fa'} 
                filter="url(#packetGlow)"
              />
              <motion.circle 
                r="10" 
                fill="none" 
                stroke={steps[activeStepIndex].status === 'failure' ? '#ef4444' : '#60a5fa'} 
                strokeWidth="2"
                animate={{ r: [7, 18], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Interactive Components */}
        {NODES.map((node) => {
          const isNextSource = activeStepIndex < steps.length - 1 && steps[activeStepIndex + 1]?.from === node.id;
          const isActive = activeStepIndex >= 0 && (steps[activeStepIndex].from === node.id || steps[activeStepIndex].to === node.id);
          
          return (
            <g 
              key={node.id} 
              transform={`translate(${node.x - 24}, ${node.y - 24})`}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node.id)}
            >
              <motion.rect 
                width="48" height="48" 
                rx="14" 
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  stroke: isNextSource ? '#60a5fa' : (isActive ? '#475569' : '#1e293b'),
                  fill: isActive ? '#0f172a' : '#1e293b'
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="stroke-2"
              />
              
              {/* Pulsing indicator if this node needs to be clicked next */}
              {isNextSource && !isPlaying && (
                <motion.rect
                  width="52" height="52"
                  x="-2" y="-2"
                  rx="16"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="1"
                  animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}

              <foreignObject width="48" height="48">
                <div className={`flex items-center justify-center h-full transition-colors ${isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                  {COMPONENT_ICONS[node.type]}
                </div>
              </foreignObject>
              
              <text 
                y="65" 
                x="24" 
                textAnchor="middle" 
                className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${isActive ? 'fill-blue-200' : 'fill-slate-600'}`}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Footer / Step Analysis */}
      <div className="absolute bottom-8 left-8 right-8 flex gap-4 items-stretch">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-5 rounded-[1.5rem] flex-1 flex gap-4 items-start shadow-2xl">
          <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-500">
            <Info size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
              Step Insight
              {isPlaying && <span className="text-blue-400 animate-pulse">(AUTO)</span>}
              {!isPlaying && activeStepIndex < steps.length - 1 && <span className="text-amber-400 font-medium">Click component to proceed</span>}
            </div>
            <div className="text-[15px] text-slate-200 font-bold leading-relaxed">
              {activeStepIndex === -1 
                ? 'Simulation Ready. Start by clicking the Client or "Auto Run".' 
                : steps[activeStepIndex]?.label}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 px-6 rounded-[1.5rem] flex flex-col justify-center items-center gap-1 shadow-2xl">
          <div className="text-[9px] text-slate-500 font-black uppercase">Progress</div>
          <div className="text-lg text-white font-black tabular-nums">
            {activeStepIndex + 1}<span className="text-slate-700 mx-0.5">/</span>{steps.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationCanvas;
