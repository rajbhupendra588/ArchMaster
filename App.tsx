
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Menu, 
  X, 
  Layout, 
  Code, 
  PlayCircle, 
  FileText, 
  Send,
  Loader2,
  Sparkles,
  GitBranch,
  Search,
  BookOpen,
  Award,
  Terminal,
  Target,
  Sun,
  CloudRain,
  Info,
  Server,
  Zap
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
  const [activeTab, setActiveTab] = useState<'hld' | 'lld' | 'simulation' | 'diagrams'>('hld');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [simMode, setSimMode] = useState<SimulationMode>(SimulationMode.SUNNY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (selectedTopicId) {
      loadTopic(selectedTopicId);
    }
  }, [selectedTopicId]);

  const loadTopic = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await generateTopicDetails(id);
      setTopicData(data);
      setChatHistory([{
        role: 'assistant',
        content: `I've architected the ${data?.title}. You can now explore the HLD rationale, UML models, and interactive simulation. How can I assist you with this design?`,
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Navigation Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800 ${isSidebarOpen ? 'w-80' : 'w-0 md:w-24 overflow-hidden'}`}>
        <div className="p-8 flex items-center gap-4 border-b border-slate-800/50">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-600/20">
            <Server size={28} className="text-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">ArchMaster</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Learn Systems</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-500 uppercase px-3 mb-2 tracking-[0.3em]">Curriculum</div>
          {SYSTEM_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`flex flex-col gap-1.5 p-4 rounded-[1.5rem] transition-all group ${selectedTopicId === topic.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`${selectedTopicId === topic.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors shrink-0`}>
                  {topic.icon}
                </div>
                {isSidebarOpen && <span className="text-sm font-black tracking-tight">{topic.title}</span>}
              </div>
              {isSidebarOpen && (
                <div className={`text-[10px] font-black uppercase tracking-widest ml-11 ${selectedTopicId === topic.id ? 'text-blue-100/70' : 'text-slate-600'}`}>
                  {topic.complexity}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          {isSidebarOpen && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-[2rem] p-5 space-y-3">
               <div className="flex items-center gap-3">
                 <Zap size={14} className="text-blue-400" />
                 <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Active Focus</span>
               </div>
               <p className="text-[13px] text-slate-400 leading-relaxed font-bold">
                 {topicData?.title || 'Analyze architecture patterns...'}
               </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Hub */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 flex items-center justify-between px-10 z-30 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200">
              <Menu size={22} className="text-slate-600" />
            </button>
            {topicData && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tighter">{topicData?.title}</h2>
                <div className="hidden sm:flex gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase border border-blue-100 tracking-widest">HLD</span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase border border-indigo-100 tracking-widest">LLD</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Design Assistant</span>
                <span className="text-xs font-bold text-green-600 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   Engine Active
                </span>
             </div>
             <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-100 transition-all">
                <Sparkles size={20} />
             </button>
          </div>
        </header>

        {/* Dynamic Viewport */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/20">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-slate-100 rounded-full animate-spin border-t-blue-600 shadow-xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <GitBranch size={28} className="text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Constructing Blueprint...</h3>
            <p className="text-slate-500 mt-2 text-lg text-center max-w-sm font-medium">Generating models, boilerplate, and interactive simulations.</p>
          </div>
        ) : !topicData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
            <div className="bg-slate-900 p-14 rounded-[4rem] mb-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rotate-3">
              <Server size={120} className="text-white -rotate-3" />
            </div>
            <h1 className="text-7xl font-black text-slate-900 mb-6 tracking-tighter">Master Systems</h1>
            <p className="max-w-xl text-slate-500 mb-16 text-2xl font-medium leading-relaxed">
              Step into the mindset of a Principal Architect. Deep-dive into interactive simulations and multi-language LLD.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
               {[
                 { label: 'C4 Visuals', color: 'blue' },
                 { label: 'Boilerplate LLD', color: 'indigo' },
                 { label: 'Cluster Sandbox', color: 'emerald' },
                 { label: 'Role Context', color: 'amber' }
               ].map((t, i) => (
                 <div key={i} className={`p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 flex items-center gap-4`}>
                    <div className={`w-3 h-3 rounded-full bg-${t.color}-500 shadow-lg shadow-${t.color}-500/50`} />
                    <span className="text-slate-800 font-black text-sm uppercase tracking-widest">{t.label}</span>
                 </div>
               ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Topic Viewer */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30">
              {/* Premium Tab Selection */}
              <div className="sticky top-0 bg-white/60 backdrop-blur-2xl z-20 px-10 py-5 border-b border-slate-200/50">
                <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-[1.8rem] w-fit shadow-inner border border-slate-200/40">
                  {[
                    { id: 'hld', label: 'Analysis', icon: <FileText size={16} /> },
                    { id: 'diagrams', icon: <GitBranch size={16} />, label: 'Models' },
                    { id: 'simulation', icon: <PlayCircle size={16} />, label: 'Sandbox' },
                    { id: 'lld', icon: <Code size={16} />, label: 'Implementation' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.4rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-xl shadow-blue-900/10 ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-10 max-w-6xl mx-auto space-y-20 pb-40">
                {activeTab === 'hld' && (
                  <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <section>
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                        <Award size={18} className="text-blue-500" />
                        Role-Based Engineering Perspective
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {topicData.roleInsights?.map((insight, idx) => (
                          <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                               <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em]">
                                 {insight.role}
                               </div>
                            </div>
                            <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight leading-tight">{insight.focus}</h4>
                            <p className="text-[15px] text-slate-500 leading-relaxed font-medium">"{insight.advice}"</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center font-black text-2xl shadow-2xl">01</div>
                        <div>
                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">High Level Design</h3>
                          <p className="text-slate-500 font-bold text-lg mt-1">Core architectural logic and scalability patterns.</p>
                        </div>
                      </div>
                      <div className="bg-white p-14 rounded-[4rem] border border-slate-100 shadow-sm text-slate-700 leading-relaxed whitespace-pre-wrap text-xl font-medium tracking-tight">
                        {topicData?.fullExplanation}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'diagrams' && (
                  <div className="space-y-20 animate-in fade-in duration-700">
                    <section>
                       <div className="flex items-center justify-between mb-10">
                         <div>
                           <h3 className="text-3xl font-black text-slate-900 tracking-tight">C4 System Architecture</h3>
                           <p className="text-slate-500 font-bold text-lg mt-2">Physical component layout and boundary definition.</p>
                         </div>
                       </div>
                       {topicData?.mermaidHLD && <MermaidDiagram chart={topicData.mermaidHLD} />}
                    </section>

                    <section>
                       <div className="flex items-center justify-between mb-10">
                         <div>
                           <h3 className="text-3xl font-black text-slate-900 tracking-tight">Execution Sequence</h3>
                           <p className="text-slate-500 font-bold text-lg mt-2">Dynamic interaction flow and logical request cycle.</p>
                         </div>
                       </div>
                       {topicData?.mermaidSequence && <MermaidDiagram chart={topicData.mermaidSequence} />}
                    </section>
                  </div>
                )}

                {activeTab === 'simulation' && (
                  <div className="space-y-16 animate-in fade-in duration-700">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
                      <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Live Sandbox</h3>
                        <p className="text-slate-500 mt-2 text-xl font-medium">Interact with components to see failure and success paths.</p>
                      </div>
                      <div className="flex bg-slate-100 p-2 rounded-[2rem] w-fit shadow-inner border border-slate-200/50">
                        <button 
                          onClick={() => setSimMode(SimulationMode.SUNNY)}
                          className={`flex items-center gap-3 px-8 py-4 rounded-[1.6rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${simMode === SimulationMode.SUNNY ? 'bg-white text-green-600 shadow-2xl shadow-green-900/10' : 'text-slate-500'}`}
                        >
                          <Sun size={20} /> Sunny Day
                        </button>
                        <button 
                          onClick={() => setSimMode(SimulationMode.RAINY)}
                          className={`flex items-center gap-3 px-8 py-4 rounded-[1.6rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${simMode === SimulationMode.RAINY ? 'bg-white text-red-600 shadow-2xl shadow-red-900/10' : 'text-slate-500'}`}
                        >
                          <CloudRain size={20} /> Rainy Day
                        </button>
                      </div>
                    </div>

                    {topicData?.useCases?.map((uc) => (
                      <div key={uc.id} className="bg-white p-14 rounded-[4.5rem] border border-slate-100 shadow-sm space-y-12">
                         <div className="flex items-start gap-8">
                            <div className="bg-slate-100 p-5 rounded-[2rem] text-slate-900 shadow-inner">
                               <Target size={36} />
                            </div>
                            <div>
                               <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{uc.title}</h4>
                               <p className="text-slate-500 leading-relaxed max-w-4xl text-xl font-medium">{uc.description}</p>
                            </div>
                         </div>
                         <SimulationCanvas useCase={uc} mode={simMode} />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'lld' && (
                  <div className="space-y-20 animate-in fade-in duration-700">
                    <div className="border-b border-slate-100 pb-10">
                       <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Core Implementations</h3>
                       <p className="text-slate-500 mt-2 text-xl font-medium">Production-ready source code with applied design patterns.</p>
                    </div>
                    
                    {topicData?.llds?.map((lld, idx) => (
                      <div key={idx} className="bg-slate-950 rounded-[4rem] overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] border border-slate-800 group/lld transition-all hover:scale-[1.01]">
                        <div className="px-14 py-10 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
                          <div className="flex items-center gap-6">
                             <div className="bg-slate-800 p-3.5 rounded-2xl text-slate-300 border border-slate-700 shadow-xl">
                                <Terminal size={24} />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[13px] font-black text-slate-100 uppercase tracking-[0.4em]">{lld.language} MODULE</span>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">ENGINEERING BOILERPLATE</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="px-5 py-2 bg-green-500/10 text-green-400 text-[11px] font-black rounded-full border border-green-500/20 tracking-widest uppercase">Type-Safe</span>
                             <span className="px-5 py-2 bg-blue-500/10 text-blue-400 text-[11px] font-black rounded-full border border-blue-500/20 tracking-widest uppercase">Pattern-Driven</span>
                          </div>
                        </div>
                        <div className="p-14">
                           <div className="relative group/code">
                             <pre className="code-font text-blue-200/90 text-[16px] overflow-x-auto p-12 bg-black/50 rounded-[3.5rem] border border-slate-800/80 leading-[1.8] shadow-2xl">
                               {lld.code}
                             </pre>
                             <button 
                               onClick={() => navigator.clipboard.writeText(lld.code)}
                               className="absolute top-10 right-10 opacity-0 group-hover/code:opacity-100 transition-all px-7 py-3.5 bg-white text-black text-[12px] font-black uppercase rounded-2xl shadow-2xl hover:bg-slate-100 tracking-[0.2em]"
                             >
                               Copy Code
                             </button>
                           </div>
                           <div className="mt-14 p-12 bg-blue-500/5 border border-blue-500/20 rounded-[4rem] flex gap-10 items-start">
                             <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-[2.5rem] flex items-center justify-center shrink-0 border border-blue-500/20 shadow-xl">
                               <Sparkles size={40} />
                             </div>
                             <div>
                               <h5 className="font-black text-blue-100 text-2xl mb-4 tracking-tight">Design Pattern Breakdown</h5>
                               <p className="text-lg text-slate-400 leading-relaxed font-medium">{lld.explanation}</p>
                             </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Mentorship Intelligence */}
            <div className="w-[32rem] bg-white border-l border-slate-200/80 flex flex-col shadow-[0_0_100px_-20px_rgba(0,0,0,0.1)] z-40 relative">
              <div className="p-10 border-b bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-600 rounded-[2rem] text-white shadow-2xl shadow-blue-600/30">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tighter text-2xl uppercase">System Mentor</h3>
                    <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.3em] mt-1">Design Intelligence</p>
                  </div>
                </div>
              </div>
              
              <div className="p-10 overflow-y-auto flex-1 space-y-12 bg-slate-50/20 scroll-smooth">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-500`}>
                    <div className={`max-w-[95%] p-8 rounded-[3rem] text-[17px] font-medium leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none shadow-2xl shadow-slate-900/30 border-slate-900' : 'bg-white border-slate-200/60 text-slate-800 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200/60 p-7 rounded-[3rem] shadow-sm flex gap-3">
                       <span className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-bounce" />
                       <span className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <span className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-10 bg-white border-t border-slate-200/80 space-y-10 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.03)]">
                 <VoicePanel contextTopic={topicData?.title || 'System Design'} />
                 <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Discuss trade-offs or design choices..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full bg-slate-100/80 border border-slate-200/50 rounded-[2.5rem] py-7 pl-10 pr-24 text-[17px] focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all outline-none font-bold placeholder:text-slate-400 shadow-inner"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isChatLoading}
                      className="absolute right-4 top-4 p-4 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 transition-all disabled:opacity-50 shadow-2xl shadow-blue-600/40"
                    >
                      <Send size={28} />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
