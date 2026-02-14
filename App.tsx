
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Code, PlayCircle, FileText, Send, Sparkles, 
  GitBranch, Terminal, Target, Sun, CloudRain, Info, Server, 
  Zap, CheckCircle2, ShieldCheck, ZapIcon, PanelsTopLeft, MessageSquareText,
  Layers, Globe, HelpCircle, Cpu, Copy, BookOpenCheck, Boxes
} from 'lucide-react';
import { SYSTEM_TOPICS } from './constants';
import { HLDTopic, ChatMessage, SimulationMode } from './types';
import { generateTopicDetails, chatWithAi } from './services/geminiService';
import SimulationCanvas from './components/SimulationCanvas';
import VoicePanel from './components/VoicePanel';
import MermaidDiagram from './components/MermaidDiagram';

const App: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [topicData, setTopicData] = useState<HLDTopic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'hld' | 'diagrams' | 'simulation' | 'lld'>('hld');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [simMode, setSimMode] = useState<SimulationMode>(SimulationMode.SUNNY);
  const [activeUseCaseIndex, setActiveUseCaseIndex] = useState(0);
  const [activeLldIndex, setActiveLldIndex] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (selectedTopicId) loadTopic(selectedTopicId);
  }, [selectedTopicId]);

  const loadTopic = async (id: string) => {
    setIsLoading(true);
    setActiveUseCaseIndex(0);
    setActiveLldIndex(0);
    setTopicData(null);
    try {
      const data = await generateTopicDetails(id);
      setTopicData(data);
      setChatHistory([{
        role: 'assistant',
        content: `Analyzing ${data?.title}. I've identified the core architectural patterns and implementation blueprints. How can I help you master this system?`,
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const reply = await chatWithAi(chatInput, topicData);
      setChatHistory(prev => [...prev, { role: 'assistant', content: reply, timestamp: Date.now() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const levelGroups: Record<string, typeof SYSTEM_TOPICS> = useMemo(() => {
    return {
      'L1: Fundamentals': SYSTEM_TOPICS.filter(t => t.level === 'L1'),
      'L2: Intermediate': SYSTEM_TOPICS.filter(t => t.level === 'L2'),
      'L3: Advanced': SYSTEM_TOPICS.filter(t => t.level === 'L3'),
    };
  }, []);

  const handleCopyCode = () => {
    if (topicData?.llds[activeLldIndex]) {
      navigator.clipboard.writeText(topicData.llds[activeLldIndex].code);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden text-slate-900">
      {/* SIDEBAR */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3 shrink-0">
          <Server size={24} className="text-blue-500" />
          <span className="font-black text-xl tracking-tight">ArchMaster</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-8 pb-10">
          {Object.entries(levelGroups).map(([label, topics]) => (
            <div key={label} className="space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3">{label}</div>
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${selectedTopicId === topic.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}
                >
                  <div className={`shrink-0 ${selectedTopicId === topic.id ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'}`}>
                    {topic.icon}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold truncate tracking-tight">{topic.title}</div>
                    <div className="text-[9px] opacity-50 font-black uppercase tracking-widest">{topic.category}</div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
               <PanelsTopLeft size={20} className={!isSidebarOpen ? 'rotate-180' : ''} />
            </button>
            {topicData && (
              <div className="flex items-center gap-4">
                 <h2 className="font-black text-slate-800 text-lg tracking-tight">{topicData.title}</h2>
                 <div className="h-4 w-px bg-slate-200" />
                 <span className="bg-blue-50 px-2.5 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">Architecture Engine</span>
              </div>
            )}
          </div>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isChatOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
             {isChatOpen ? <X size={18} /> : <MessageSquareText size={18} />}
             <span>Mentor</span>
          </button>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative mb-8">
               <div className="w-24 h-24 border-4 border-slate-100 rounded-full animate-spin border-t-blue-600 shadow-xl"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu size={28} className="text-blue-600 animate-pulse" />
               </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Synthesizing System Logic...</h3>
            <p className="text-slate-400 mt-2 text-sm font-bold tracking-widest uppercase">Mapping patterns to requirements</p>
          </div>
        ) : !topicData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <Layers size={100} className="text-slate-200 mb-10" />
             <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">System Design Lab</h1>
             <p className="text-slate-400 max-w-md text-xl font-medium">Select a topic to start mastering architecture patterns and implementations.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TABS */}
            <div className="px-8 py-5 bg-white border-b flex gap-3 overflow-x-auto shrink-0 z-10 shadow-sm">
              {[
                { id: 'hld', label: 'Architecture & Patterns', icon: <FileText size={16} /> },
                { id: 'diagrams', label: 'Blueprints', icon: <GitBranch size={16} /> },
                { id: 'simulation', label: 'Sandbox Lab', icon: <PlayCircle size={16} /> },
                { id: 'lld', label: 'Pattern-Based LLD', icon: <Code size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50/30">
              <div className="max-w-6xl mx-auto space-y-20 pb-48">
                
                {/* ARCHITECTURE (HLD) TAB */}
                {activeTab === 'hld' && (
                  <div className="space-y-20 animate-in fade-in duration-500">
                    {/* Requirements Section */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                          <h3 className="flex items-center gap-3 font-black text-xl mb-8 text-blue-600 uppercase tracking-tight">
                             <Target size={24} /> Functional Req.
                          </h3>
                          <ul className="space-y-5">
                             {(topicData.fr || []).map((r, i) => (
                               <li key={i} className="flex gap-4 text-slate-600 font-semibold text-lg">
                                  <CheckCircle2 size={20} className="text-green-500 mt-1 shrink-0" /> {r}
                               </li>
                             ))}
                          </ul>
                       </div>
                       <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                          <h3 className="flex items-center gap-3 font-black text-xl mb-8 text-amber-600 uppercase tracking-tight">
                             <ShieldCheck size={24} /> Quality Attributes
                          </h3>
                          <ul className="space-y-5">
                             {(topicData.nfr || []).map((r, i) => (
                               <li key={i} className="flex gap-4 text-slate-600 font-semibold text-lg">
                                  <ZapIcon size={20} className="text-amber-500 mt-1 shrink-0" /> {r}
                               </li>
                             ))}
                          </ul>
                       </div>
                    </section>

                    {/* DESIGN PATTERNS SECTION - NEW */}
                    <section className="space-y-10">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/20"><Boxes size={28} /></div>
                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Design Patterns Inventory</h3>
                       </div>
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {(topicData.designPatterns || []).map((pattern, i) => (
                             <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-md group hover:border-indigo-500 transition-all duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><BookOpenCheck size={24} /></div>
                                   <h4 className="text-2xl font-black text-slate-900 tracking-tight">{pattern.name}</h4>
                                </div>
                                <div className="space-y-6">
                                   <div>
                                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rationale (WHY)</h5>
                                      <p className="text-slate-600 font-medium leading-relaxed">{pattern.why}</p>
                                   </div>
                                   <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                      <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Architectural Benefit</h5>
                                      <p className="text-slate-800 font-bold leading-relaxed">{pattern.benefit}</p>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </section>

                    {/* Architecture Walkthrough Section */}
                    <section className="space-y-10">
                       <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Architecture Walkthrough</h3>
                       <div className="space-y-8">
                          {(topicData.fullExplanation || []).map((step, i) => (
                             <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                <div className="flex flex-col lg:flex-row gap-12">
                                   <div className="lg:w-1/2 space-y-6">
                                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Phase 0{i+1}</span>
                                      <h4 className="text-3xl font-black text-slate-900 tracking-tight">{step.stepTitle}</h4>
                                      <p className="text-slate-500 text-lg font-medium leading-relaxed">{step.description}</p>
                                   </div>
                                   <div className="lg:w-1/2 space-y-6 flex flex-col justify-center">
                                      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                         <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">Real-World Logic</h5>
                                         <p className="text-slate-700 font-bold italic">"{step.realTimeExample}"</p>
                                      </div>
                                      <div className="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100/50">
                                         <h5 className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-3">Trade-off & Rationale</h5>
                                         <p className="text-slate-700 font-bold">{step.tradeOff}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </section>
                  </div>
                )}

                {/* DIAGRAMS TAB */}
                {activeTab === 'diagrams' && (
                  <div className="space-y-24 animate-in fade-in duration-500">
                    <section className="space-y-8">
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-6">C4 Structural Perspective</h3>
                       {topicData.mermaidHLD ? <MermaidDiagram chart={topicData.mermaidHLD} /> : <div className="p-20 text-center text-slate-400 font-bold">Structural view pending...</div>}
                    </section>
                    <section className="space-y-8">
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-6">Sequence Interaction Workflow</h3>
                       {topicData.mermaidSequence ? <MermaidDiagram chart={topicData.mermaidSequence} /> : <div className="p-20 text-center text-slate-400 font-bold">Sequence logic pending...</div>}
                    </section>
                  </div>
                )}

                {/* SIMULATION TAB */}
                {activeTab === 'simulation' && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="flex flex-col lg:flex-row gap-8 justify-between items-end border-b border-slate-100 pb-12">
                       <div className="space-y-2">
                          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Sandbox Environment</h3>
                          <p className="text-slate-400 font-bold text-lg">Live traffic simulation & component introspection.</p>
                       </div>
                       {topicData.useCases && topicData.useCases.length > 0 && (
                        <div className="flex gap-4">
                           <div className="flex bg-slate-100 p-2 rounded-2xl shadow-inner border border-slate-200/50">
                              {topicData.useCases.map((uc, i) => (
                                <button
                                  key={i}
                                  onClick={() => setActiveUseCaseIndex(i)}
                                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeUseCaseIndex === i ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}
                                >
                                  {uc.title}
                                </button>
                              ))}
                           </div>
                           <div className="flex bg-slate-100 p-2 rounded-2xl shadow-inner border border-slate-200/50">
                              <button onClick={() => setSimMode(SimulationMode.SUNNY)} className={`p-3 rounded-xl transition-all ${simMode === SimulationMode.SUNNY ? 'bg-green-100 text-green-700 shadow-md' : 'text-slate-400'}`}><Sun size={20} /></button>
                              <button onClick={() => setSimMode(SimulationMode.RAINY)} className={`p-3 rounded-xl transition-all ${simMode === SimulationMode.RAINY ? 'bg-red-100 text-red-700 shadow-md' : 'text-slate-400'}`}><CloudRain size={20} /></button>
                           </div>
                        </div>
                       )}
                    </div>
                    {topicData.useCases && topicData.useCases[activeUseCaseIndex] ? (
                      <SimulationCanvas useCase={topicData.useCases[activeUseCaseIndex]} mode={simMode} nodes={topicData.nodes || []} />
                    ) : (
                      <div className="bg-slate-900 h-[500px] rounded-[3rem] flex items-center justify-center">
                        <p className="text-slate-500 font-bold uppercase tracking-widest">Environment synthesis in progress...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* IMPLEMENTATION (LLD) TAB */}
                {activeTab === 'lld' && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="flex flex-col lg:flex-row gap-8 justify-between items-end border-b border-slate-100 pb-12">
                       <div className="space-y-2">
                          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Implementation Blueprints</h3>
                          <p className="text-slate-400 font-bold text-lg">Structured source code using enterprise design patterns.</p>
                       </div>
                       {topicData.llds && topicData.llds.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-xl">
                           {topicData.llds.map((lld, i) => (
                              <button
                                key={lld.language}
                                onClick={() => setActiveLldIndex(i)}
                                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${activeLldIndex === i ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white text-slate-400 border-slate-100'}`}
                              >
                                {lld.language}
                              </button>
                           ))}
                        </div>
                       )}
                    </div>

                    {topicData.llds && topicData.llds[activeLldIndex] ? (
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-4">
                          <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
                            <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400"><Terminal size={20} /></div>
                                  <span className="text-white font-black uppercase tracking-widest text-sm">{topicData.llds[activeLldIndex].language} Source</span>
                                </div>
                                <button onClick={handleCopyCode} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"><Copy size={18}/></button>
                            </div>
                            <div className="p-1">
                                <pre className="p-10 code-font text-blue-200/90 text-sm leading-relaxed overflow-x-auto bg-black/40 rounded-[2rem] scrollbar-hide min-h-[500px]">
                                  {topicData.llds[activeLldIndex].code}
                                </pre>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-8">
                           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 w-fit mb-6"><Sparkles size={32} /></div>
                              <h5 className="text-xl font-black text-slate-900 tracking-tight mb-4 uppercase">Implementation Pattern</h5>
                              <p className="text-slate-600 font-medium leading-relaxed">{topicData.llds[activeLldIndex].explanation}</p>
                           </div>
                           <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Cpu size={120} /></div>
                              <h5 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Architecture Insight</h5>
                              <p className="text-slate-300 font-bold leading-relaxed relative z-10">This implementation utilizes modern concurrency models and abstract factory patterns to ensure horizontal scalability at the service layer.</p>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-20 text-center text-slate-400 font-bold">Generating structured implementations...</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CHAT SIDEBAR */}
      <aside className={`bg-white border-l border-slate-200 transition-all duration-300 flex flex-col shadow-2xl relative ${isChatOpen ? 'w-[450px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl text-white"><Sparkles size={20} /></div>
              <span className="font-black text-slate-800 tracking-tight text-xl">Architect Mentor</span>
           </div>
           <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[90%] p-6 rounded-[2rem] text-[15px] font-semibold leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isChatLoading && (
             <div className="flex justify-start">
                <div className="bg-white border p-5 rounded-2xl shadow-sm flex gap-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
             </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-100 space-y-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <VoicePanel contextTopic={topicData?.title || 'System Design'} />
          <div className="relative">
             <input
               type="text"
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
               placeholder="Ask about trade-offs..."
               className="w-full bg-slate-100 border border-slate-200 rounded-[1.8rem] py-6 px-8 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
             />
             <button onClick={handleSendMessage} disabled={isChatLoading} className="absolute right-3 top-3 p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-transform active:scale-95 disabled:opacity-50">
                <Send size={18} />
             </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
