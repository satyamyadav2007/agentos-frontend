'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ⚡ Yeh naya import add karo
// ⚡ FIX 2: Imported UserButton from Clerk
import { useAuth, useUser, UserButton } from '@clerk/nextjs'; 

import { Sun, Moon, Settings, Database, ArrowDown, UserCheck, Plus } from 'lucide-react';
import { Brain, MessageSquare, GitBranch, ServerCrash, Video, PhoneCall, Star, Smile, Cpu, TrendingUp, Briefcase, BarChart, RefreshCcw } from 'lucide-react';
import { Search, AlertTriangle, TrendingDown, Users, Activity, CheckCircle, Clock, Loader2, LayoutDashboard, AlertOctagon, Map, Zap, UserMinus, ShieldAlert, Lightbulb, BarChart3, LineChart, Megaphone } from 'lucide-react';
import { User, Ticket, Hash, TerminalSquare, GitCommit, Rocket, DollarSign, ArrowRight, Network, Mail, CheckCircle2 } from 'lucide-react';

export default function AICommandCenter() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('executive');
  const [dashboardStats, setDashboardStats] = useState({
    criticalIncidents: 0,
    revenueAtRisk: 0,
    customersAffected: 0
  });
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => setMounted(true), []);

  // ⚡ FIX 3: Abstracted search logic so both input and buttons can use it
  const executeSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    
    setIsSearching(true);
    setAiResponse(null);
    setSearchQuery(queryToSearch); 
    
    try {
      const token = await getToken(); 
      const userEmail = user?.primaryEmailAddress?.emailAddress || "unknown@user.com";
      
      console.log("🚀 Sending Request to Backend:", { queryToSearch, userEmail });

      const response = await fetch('http://localhost:8000/api/ask-agentos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          query: queryToSearch,
          user_email: userEmail 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Backend rejected request with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different possible backend keys just in case
      const finalAnswer = data.answer || data.reply || data.message || "✅ Query processed, but AI returned empty response.";
      setAiResponse(finalAnswer);

    } catch (error) {
      console.error("🚨 Search failed completely:", error);
      setAiResponse("System Error: AI Kernel unreachable. Press F12 and check Console for details.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ⚡ Prevents browser from reloading the page
      executeSearch(searchQuery);
    }
  };
  const handleAction = (actionName: string) => {
    alert(`⚡ AI Agent Triggered: Executing [${actionName}]`);
    console.log(`Action Executed: ${actionName}`);
  };
  useEffect(() => {
    const fetchRealData = async () => {
      if (!user) return;
      
      try {
        const token = await getToken();
        // API call to your python backend to get stats for THIS specific user email
        const response = await fetch('http://localhost:8000/api/dashboard-stats', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ user_email: user.primaryEmailAddress?.emailAddress })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          setDashboardStats(data.stats); // Ab Dummy hat gaya, Real data set ho gaya!
        }
      } catch (error) {
        console.error("Error fetching real stats:", error);
      }
    };

    if (mounted) fetchRealData();
  }, [user, mounted]);

  if (!mounted) return null;
  return (
    // ⚡ FIX 1: Added proper 'bg-white dark:bg-[#050505]' Tailwind prefixes for theme switching
    <div className="flex h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
      
      {/* 🚀 THE 5-SCREEN ARCHITECTURE SIDEBAR */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 flex flex-col hidden md:flex transition-colors duration-300">
        <div className="text-xl font-bold tracking-widest text-gray-900 dark:text-white mb-10 pl-3 pt-4">AgentOS</div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('executive')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'executive' ? 'bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}> <LayoutDashboard size={18} /> Executive Brief </button>
          <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}> <MessageSquare size={18} /> AI Search </button>
          <button onClick={() => setActiveTab('incidents')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'incidents' ? 'bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}> <AlertOctagon size={18} /> Customer Pain </button>
          <button onClick={() => setActiveTab('roadmap')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'roadmap' ? 'bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}> <Map size={18} /> Roadmap </button>
          <button 
            onClick={() => router.push('/onboarding/integrations')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5`}
          >
            <Zap size={18} /> Integrations 
          </button>  
        </nav>
      </div>

      {/* 🚀 MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        
        {/* ⚡ FIX 2: Top Right Controls (Theme Toggle & Clerk User Avatar) */}
        <div className="absolute top-6 right-8 z-50 flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-white hover:scale-105 transition-all shadow-md"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
            <UserButton  />
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* 🚀 THE MASTER INTERFACE: UNIVERSAL SEARCH */}
          <div className="w-full mb-12 flex flex-col items-center mt-12 md:mt-6">
            <div className="relative group flex flex-col w-full max-w-4xl mx-auto">
              
              {/* Massive Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                  <Search className="h-8 w-8 text-blue-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-[#0a0a0a] border-2 border-gray-200 dark:border-gray-800 focus:border-blue-500/80 rounded-full py-6 pl-20 pr-8 text-2xl md:text-3xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700 shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.4)] transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 relative z-0"
                  placeholder="Ask Anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown} 
                  disabled={isSearching}
                  autoFocus
                />
                
                {/* Enter Key Hint */}
                <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-600 text-sm font-mono border border-gray-300 dark:border-gray-700 rounded px-2 py-1">↵ Enter</span>
                </div>
              </div>

              {/* CEO Query Suggestions (Now properly execute search on click) */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <button 
                  onClick={() => executeSearch("Why is ARR dropping?")}
                  disabled={isSearching}
                  className="text-sm font-medium text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full transition-all"
                >
                  "Why is ARR dropping?"
                </button>
                <button 
                  onClick={() => executeSearch("What happened after Release 3.8?")}
                  disabled={isSearching}
                  className="text-sm font-medium text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full transition-all"
                >
                  "What happened after Release 3.8?"
                </button>
                <button 
                  onClick={() => executeSearch("Show YouTube complaints.")}
                  disabled={isSearching}
                  className="text-sm font-medium text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full transition-all"
                >
                  "Show YouTube complaints"
                </button>
              </div>

              {/* Real-time AI Response Area */}
              {(isSearching || aiResponse) && (
                <div className="mt-8 p-8 bg-white dark:bg-gradient-to-br dark:from-[#111] dark:to-[#0a0a0a] border border-blue-200 dark:border-blue-900/40 rounded-2xl shadow-2xl animate-fade-in w-full">
                  {isSearching ? (
                    <div className="flex items-center gap-4 text-blue-500 dark:text-blue-400">
                      <Loader2 className="animate-spin h-6 w-6" />
                      <span className="text-lg">AgentOS is analyzing your company graph...</span>
                    </div>
                  ) : (
                    <div className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-medium flex gap-4">
                      <span className="text-blue-500 mt-1">✨</span>
                      <div>{aiResponse}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

         

          
                  {/* 🚀 1. TODAY'S EXECUTIVE BRIEF (The 7 Core Metrics) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Today's Executive Brief</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-[#111] border border-red-900/30 p-4 rounded-xl flex flex-col justify-between hover:border-red-500/30 transition-all">
                <span className="text-gray-400 text-xs uppercase font-semibold mb-2 flex items-center gap-1.5"><AlertTriangle size={14} className="text-red-500"/> Critical Incidents</span>
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <div className="bg-[#111] border border-orange-900/30 p-4 rounded-xl flex flex-col justify-between hover:border-orange-500/30 transition-all">
                <span className="text-gray-400 text-xs uppercase font-semibold mb-2 flex items-center gap-1.5"><TrendingDown size={14} className="text-orange-500"/> Revenue At Risk</span>
                <span className="text-2xl font-bold text-orange-400">$1.8M</span>
              </div>
              <div className="bg-[#111] border border-blue-900/30 p-4 rounded-xl flex flex-col justify-between hover:border-blue-500/30 transition-all">
                <span className="text-gray-400 text-xs uppercase font-semibold mb-2 flex items-center gap-1.5"><Users size={14} className="text-blue-400"/> Customers Affected</span>
                <span className="text-2xl font-bold text-white">22</span>
              </div>
              <div className="bg-[#111] border border-purple-900/30 p-4 rounded-xl flex flex-col justify-between hover:border-purple-500/30 transition-all">
                <span className="text-gray-400 text-xs uppercase font-semibold mb-2 flex items-center gap-1.5"><UserMinus size={14} className="text-purple-500"/> Expected Churn</span>
                <span className="text-2xl font-bold text-purple-400">6</span>
              </div>
              <div className="bg-[#111] border border-yellow-900/30 p-4 rounded-xl flex flex-col justify-between hover:border-yellow-500/30 transition-all">
                <span className="text-gray-400 text-xs uppercase font-semibold mb-2 flex items-center gap-1.5"><ShieldAlert size={14} className="text-yellow-500"/> Eng Blockers</span>
                <span className="text-2xl font-bold text-yellow-400">3</span>
              </div>
              <div className="bg-[#111] border border-green-900/30 p-4 rounded-xl flex flex-col justify-between hover:border-green-500/30 transition-all">
                <span className="text-gray-400 text-xs uppercase font-semibold mb-2 flex items-center gap-1.5"><Lightbulb size={14} className="text-green-500"/> Product Opps</span>
                <span className="text-2xl font-bold text-white">8</span>
              </div>
              <div className="bg-gradient-to-br from-[#111] to-green-900/10 border border-green-900/40 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-gray-400 text-xs uppercase font-semibold mb-2 flex items-center gap-1.5"><Activity size={14} className="text-green-400"/> AI Confidence</span>
                <span className="text-2xl font-bold text-green-400">97%</span>
              </div>
            </div>
          </div>

          {/* 🚀 2. AI ANSWERS & RECOMMENDATIONS (Billion-Dollar UX) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Revenue Focus */}
            <div 
              onClick={() => handleAction('Execute Fix')}
              className="group bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-gray-800 hover:border-green-500/50 p-8 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(74,222,128,0.1)]"
            >
              <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-6">AI Says</h3>
              <div className="text-2xl font-bold text-white mb-4 group-hover:scale-105 transition-transform">Fix Login API</div>
              <div className="text-green-500 animate-bounce mb-4">↓</div>
              <div className="text-gray-400 text-sm tracking-wide uppercase mb-1">Save</div>
              <div className="text-3xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                $840,000 ARR
              </div>
            </div>
            
            {/* Card 2: Engineering Focus */}
            <div 
              onClick={() => handleAction('Rollback')}
              className="group bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-gray-800 hover:border-blue-500/50 p-8 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            >
              <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-6">AI Says</h3>
              <div className="text-2xl font-bold text-white mb-4 group-hover:scale-105 transition-transform">Rollback Release 4.6</div>
              <div className="text-blue-500 animate-bounce mb-4">↓</div>
              <div className="text-gray-400 text-sm tracking-wide uppercase mb-1">Reduce crashes</div>
              <div className="text-3xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                68%
              </div>
            </div>

            {/* Card 3: Churn Risk Focus */}
            <div 
              onClick={() => handleAction('Draft Apology')}
              className="group bg-gradient-to-b from-[#111] to-[#1a0505] border border-red-900/30 hover:border-red-500/50 p-8 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]"
            >
              <h3 className="text-xs text-red-500/70 uppercase tracking-widest font-bold mb-6">Top Customer</h3>
              <div className="text-2xl font-bold text-white mb-4 group-hover:scale-105 transition-transform">Netflix</div>
              <div className="text-red-500 animate-bounce mb-4">↓</div>
              <div className="text-gray-400 text-sm tracking-wide uppercase mb-1">Likely to churn</div>
              <div className="text-3xl font-black text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                Within 9 days
              </div>
            </div>

          </div>
          {/* 🚀 LIVE COMPANY HEALTH (The Vitals Monitor) */}
          <div className="bg-[#111] border border-gray-800 p-6 md:p-8 rounded-xl w-full">
            <h2 className="text-lg font-semibold text-gray-200 mb-8 flex items-center gap-3">
              <Activity size={20} className="text-blue-500" /> Live Company Health
              <span className="flex h-2 w-2 relative ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </h2>
            
            <div className="space-y-6">
              
              {/* Revenue */}
              <div className="flex items-center justify-between group">
                <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Revenue</span>
                <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50">
                  <div className="h-full bg-green-500 w-[80%] shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                </div>
              </div>
              
              {/* Engineering */}
              <div className="flex items-center justify-between group">
                <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Engineering</span>
                <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50">
                  <div className="h-full bg-yellow-500 w-[60%] shadow-[0_0_15px_rgba(234,179,8,0.6)]"></div>
                </div>
              </div>

              {/* Support (Critical - Full & Pulsing) */}
              <div className="flex items-center justify-between group">
                <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-red-400 transition-colors">Support</span>
                <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50">
                  <div className="h-full bg-red-500 w-[100%] shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>
                </div>
              </div>

              {/* Sentiment */}
              <div className="flex items-center justify-between group">
                <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Sentiment</span>
                <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50">
                  <div className="h-full bg-blue-500 w-[60%] shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                </div>
              </div>

              {/* Performance */}
              <div className="flex items-center justify-between group">
                <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Performance</span>
                <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50">
                  <div className="h-full bg-purple-500 w-[80%] shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
                </div>
              </div>

              {/* Adoption */}
              <div className="flex items-center justify-between group">
                <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Adoption</span>
                <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50">
                  <div className="h-full bg-teal-500 w-[50%] shadow-[0_0_15px_rgba(20,184,166,0.6)]"></div>
                </div>
              </div>

            </div>
          </div>
          {/* 🚀 3. THE PULSE & THE BRAIN (Side-by-Side View) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 🔴 THE PULSE: Live Company Health */}
            <div className="bg-[#111] border border-gray-800 p-6 md:p-8 rounded-xl flex flex-col justify-center">
              <h2 className="text-lg font-semibold text-gray-200 mb-8 flex items-center gap-3">
                <Activity size={20} className="text-blue-500" /> Live Company Health
                <span className="flex h-2 w-2 relative ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Revenue</span>
                  <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50"><div className="h-full bg-green-500 w-[80%] shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div></div>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Engineering</span>
                  <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50"><div className="h-full bg-yellow-500 w-[60%] shadow-[0_0_15px_rgba(234,179,8,0.6)]"></div></div>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-red-400 transition-colors">Support</span>
                  <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50"><div className="h-full bg-red-500 w-[100%] shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div></div>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Sentiment</span>
                  <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50"><div className="h-full bg-blue-500 w-[60%] shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div></div>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Performance</span>
                  <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50"><div className="h-full bg-purple-500 w-[80%] shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div></div>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase w-32 group-hover:text-white transition-colors">Adoption</span>
                  <div className="flex-1 h-3.5 bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-800/50"><div className="h-full bg-teal-500 w-[50%] shadow-[0_0_15px_rgba(20,184,166,0.6)]"></div></div>
                </div>
              </div>
            </div>

            {/* 🧠 THE BRAIN: AI Root Cause Timeline */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-200 mb-8 flex items-center gap-2">
                <Clock size={20} className="text-purple-500" /> AI Correlation Timeline
              </h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-800">
                
                <div className="relative flex items-center justify-between group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#111] bg-gray-800 text-gray-400 z-10 shadow-lg"><MessageSquare size={16} /></div>
                  <div className="w-[calc(100%-4rem)] p-4 rounded-xl border border-gray-800 bg-[#151515] group-hover:border-gray-600 transition-colors">
                    <div className="flex justify-between mb-1"><div className="font-semibold text-gray-300">Slack complaints increased</div><time className="font-mono text-xs text-gray-500">10:42 AM</time></div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#111] bg-red-900/50 text-red-400 z-10 shadow-[0_0_15px_rgba(239,68,68,0.3)]"><AlertTriangle size={16} /></div>
                  <div className="w-[calc(100%-4rem)] p-4 rounded-xl border border-red-900/30 bg-[#151515] group-hover:border-red-900/50 transition-colors">
                    <div className="flex justify-between mb-1"><div className="font-semibold text-red-400">Crash spike detected</div><time className="font-mono text-xs text-gray-500">11:20 AM</time></div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#111] bg-blue-900/50 text-blue-400 z-10 shadow-lg"><CheckCircle size={16} /></div>
                  <div className="w-[calc(100%-4rem)] p-4 rounded-xl border border-blue-900/30 bg-[#151515] group-hover:border-blue-900/50 transition-colors">
                    <div className="flex justify-between mb-1"><div className="font-semibold text-blue-400">AI created Jira #823</div><time className="font-mono text-xs text-gray-500">12:14 PM</time></div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* 🚀 4. THE CHARTS (Manager Ko Charts Bhi Chahiye) */}
          <div className="bg-[#111] border border-gray-800 p-6 md:p-8 rounded-xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <LineChart size={20} className="text-blue-500" /> Revenue vs Risk Trend
              </h2>
              <span className="text-xs font-semibold tracking-wider bg-gray-800 px-3 py-1.5 rounded-md text-gray-400 uppercase">30 Days</span>
            </div>
            {/* Chart Area */}
            <div className="w-full h-[300px] bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-xl border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-full h-32 bg-blue-900/10 border-t border-blue-500/20"></div>
              <svg className="absolute w-full h-full text-blue-500/20" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 L0,70 Q25,80 50,40 T100,20 L100,100 Z" fill="currentColor" />
              </svg>
              <BarChart3 size={40} className="text-gray-600 mb-3 z-10" />
              <span className="text-gray-500 font-mono text-sm z-10 group-hover:text-gray-400 transition-colors">[ Analytics Chart Engine Rendered Here ]</span>
            </div>
          </div>
          

          {/* 🚀 3. THE CHARTS (Manager Ko Charts Bhi Chahiye) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Revenue vs Risk */}
            <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <LineChart size={18} className="text-blue-500" /> Revenue vs Risk Trend
                </h2>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">30 Days</span>
              </div>
              {/* Chart Placeholder - Render your Recharts/Chart.js here */}
              <div className="w-full h-64 bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-lg border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-full h-32 bg-blue-900/10 border-t border-blue-500/20"></div>
                <svg className="absolute w-full h-full text-blue-500/20" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,100 L0,70 Q25,80 50,40 T100,20 L100,100 Z" fill="currentColor" />
                </svg>
                <BarChart3 size={32} className="text-gray-600 mb-2 z-10" />
                <span className="text-gray-500 font-mono text-sm z-10 group-hover:text-gray-400 transition-colors">[ Analytics Chart Engine Rendered Here ]</span>
              </div>
            </div>
            {/* 🚀 5. CUSTOMER PAIN EXPLORER (The Voice of Customer) */}
          <div className="bg-[#111] border border-gray-800 p-6 md:p-8 rounded-xl w-full mb-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                <AlertOctagon size={20} className="text-orange-500" /> Customer Pain Explorer
              </h2>
              <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-md uppercase tracking-wider font-semibold">
                Live NLP Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Left Column: Most Mentioned Keywords */}
              <div>
                <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-5 flex items-center gap-2">
                  <MessageSquare size={14} /> Most Mentioned
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-[#1a1a1a] border border-gray-700 text-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:border-gray-500 transition-colors cursor-pointer">Login</span>
                  <span className="bg-[#1a1a1a] border border-gray-700 text-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:border-gray-500 transition-colors cursor-pointer">Payment</span>
                  <span className="bg-[#1a1a1a] border border-gray-700 text-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:border-gray-500 transition-colors cursor-pointer">Upload</span>
                  <span className="bg-[#1a1a1a] border border-gray-700 text-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:border-gray-500 transition-colors cursor-pointer">Search</span>
                  <span className="bg-[#1a1a1a] border border-gray-700 text-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:border-gray-500 transition-colors cursor-pointer">Notifications</span>
                </div>
              </div>

              {/* Right Column: AI Semantic Clusters */}
              <div>
                <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-5 flex items-center gap-2">
                  <Zap size={14} /> AI Clusters
                </h3>
                <div className="space-y-4">
                  
                  {/* Cluster 1: High Severity */}
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-900/10 to-[#151515] border border-red-900/30 hover:border-red-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                      <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">Payment Failure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-3 py-1 rounded-md">
                      <Users size={14} /> <span className="font-bold">214</span> <span className="text-xs uppercase">users</span>
                    </div>
                  </div>

                  {/* Cluster 2: Medium Severity */}
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-900/10 to-[#151515] border border-orange-900/30 hover:border-orange-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                      <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">Video Upload</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md">
                      <Users size={14} /> <span className="font-bold">93</span> <span className="text-xs uppercase">users</span>
                    </div>
                  </div>

                  {/* Cluster 3: Feature Request / Low Severity */}
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-900/10 to-[#151515] border border-blue-900/30 hover:border-blue-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                      <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">Recommendations</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md">
                      <Users size={14} /> <span className="font-bold">61</span> <span className="text-xs uppercase">users</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
          {/* 🚀 6. RELEASE INTELLIGENCE (The Deployment Risk Engine) */}
          <div className="bg-gradient-to-br from-[#111] to-[#1a0505] border border-red-900/40 p-6 md:p-8 rounded-xl w-full mb-10 relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.05)]">
            
            {/* Subtle red danger glow in the background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                <GitBranch size={20} className="text-red-500" /> Release Intelligence
              </h2>
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-xs text-red-400 uppercase tracking-wider font-bold">
                  Status: High Risk
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              
              {/* Release Version */}
              <div className="bg-[#151515] border border-gray-800 p-5 rounded-xl flex flex-col justify-center">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Release Build</span>
                <span className="text-3xl font-black text-white">4.6</span>
              </div>

              {/* Crash Increase */}
              <div className="bg-[#151515] border border-gray-800 p-5 rounded-xl flex flex-col justify-center">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Crash Increase</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-red-400">28%</span>
                  <TrendingDown className="text-red-500" size={24} />
                </div>
              </div>

              {/* Revenue Impact (Highlight) */}
              <div className="bg-[#151515] border border-red-900/50 p-5 rounded-xl flex flex-col justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] transform hover:scale-105 transition-transform">
                <span className="text-xs text-red-500/70 uppercase font-bold tracking-wider mb-2">Revenue Impact</span>
                <span className="text-3xl font-black text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                  $320k
                </span>
              </div>

              {/* Action: Rollback */}
              <div className="bg-[#151515] border border-gray-800 p-5 rounded-xl flex flex-col justify-between items-center text-center">
                <span className="text-xs text-blue-400 uppercase font-bold tracking-wider mb-3 flex items-center gap-1.5 w-full justify-center">
                  <CheckCircle size={14} /> AI Recommended
                </span>
                <button 
                  onClick={() => handleAction('Rollback Release 4.6')} 
                  className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                >
                  <Activity size={18} /> Rollback
                </button>
              </div>

            </div>
          </div>
          {/* 🚀 7. PRODUCT OPPORTUNITY (The Auto-Roadmap Engine) */}
          <div className="bg-[#111] border border-gray-800 p-6 md:p-8 rounded-xl w-full mb-10">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                  <Lightbulb size={20} className="text-yellow-500" /> Product Opportunity
                </h2>
                <p className="text-sm text-gray-500 mt-1">Automatically generated feature requests from customer conversations, instead of only bugs.</p>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs text-blue-400 uppercase tracking-wider font-bold">
                  AI Auto-Generated
                </span>
              </div>
            </div>

            {/* The Opportunities Ranked List */}
            <div className="space-y-4">
              
              {/* Rank 1: Offline Mode */}
              <div className="group relative bg-[#151515] border border-gray-800 p-4 rounded-xl flex items-center justify-between overflow-hidden hover:border-green-500/50 transition-all cursor-pointer">
                {/* Background Volume Indicator (Visualizes the 2134 value) */}
                <div className="absolute left-0 top-0 bottom-0 bg-green-500/5 w-[90%] z-0 group-hover:bg-green-500/10 transition-colors"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#222] text-gray-400 flex items-center justify-center font-bold font-mono group-hover:text-green-400 group-hover:bg-green-900/20 transition-all border border-gray-700">#1</div>
                  <div>
                    <div className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">Offline Mode</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Top Requested Feature</div>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 bg-[#111] px-4 py-2 rounded-lg border border-gray-800 group-hover:border-green-500/30">
                  <Users size={16} className="text-green-500" />
                  <span className="text-xl font-bold text-green-400">2,134</span>
                </div>
              </div>

              {/* Rank 2: Dark Theme */}
              <div className="group relative bg-[#151515] border border-gray-800 p-4 rounded-xl flex items-center justify-between overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 bg-blue-500/5 w-[75%] z-0 group-hover:bg-blue-500/10 transition-colors"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#222] text-gray-400 flex items-center justify-center font-bold font-mono group-hover:text-blue-400 group-hover:bg-blue-900/20 transition-all border border-gray-700">#2</div>
                  <div>
                    <div className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Dark Theme</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">High Demand</div>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 bg-[#111] px-4 py-2 rounded-lg border border-gray-800 group-hover:border-blue-500/30">
                  <Users size={16} className="text-blue-500" />
                  <span className="text-xl font-bold text-blue-400">1,811</span>
                </div>
              </div>

              {/* Rank 3: Export PDF */}
              <div className="group relative bg-[#151515] border border-gray-800 p-4 rounded-xl flex items-center justify-between overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 bg-purple-500/5 w-[35%] z-0 group-hover:bg-purple-500/10 transition-colors"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#222] text-gray-400 flex items-center justify-center font-bold font-mono group-hover:text-purple-400 group-hover:bg-purple-900/20 transition-all border border-gray-700">#3</div>
                  <div>
                    <div className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Export PDF</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Rising Trend</div>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 bg-[#111] px-4 py-2 rounded-lg border border-gray-800 group-hover:border-purple-500/30">
                  <Users size={16} className="text-purple-500" />
                  <span className="text-xl font-bold text-purple-400">812</span>
                </div>
              </div>

              {/* Rank 4: API Access */}
              <div className="group relative bg-[#151515] border border-gray-800 p-4 rounded-xl flex items-center justify-between overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 bg-orange-500/5 w-[30%] z-0 group-hover:bg-orange-500/10 transition-colors"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#222] text-gray-400 flex items-center justify-center font-bold font-mono group-hover:text-orange-400 group-hover:bg-orange-900/20 transition-all border border-gray-700">#4</div>
                  <div>
                    <div className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">API Access</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Developer Need</div>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 bg-[#111] px-4 py-2 rounded-lg border border-gray-800 group-hover:border-orange-500/30">
                  <Users size={16} className="text-orange-500" />
                  <span className="text-xl font-bold text-orange-400">721</span>
                </div>
              </div>

            </div>
          </div>
          {/* 🚀 8. MEETING INTELLIGENCE (The Auto-Summary Engine) */}
          <div className="bg-[#111] border border-gray-800 p-6 md:p-8 rounded-xl w-full mb-10">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                  <Activity size={20} className="text-blue-500" /> Meeting Intelligence
                </h2>
                <p className="text-sm text-gray-500 mt-1">Weekly All-Hands • Last Sync: 45 mins ago</p>
              </div>
              
              {/* The AI Pipeline Visualization */}
              <div className="flex items-center gap-2 text-xs font-mono bg-[#151515] p-2.5 rounded-lg border border-gray-800 shadow-inner">
                <span className="flex items-center gap-1.5 text-blue-400 font-semibold px-2"><Activity size={14}/> Zoom</span>
                <span className="text-gray-600">↓</span>
                <span className="flex items-center gap-1.5 text-gray-400 px-2"><MessageSquare size={14}/> Transcript</span>
                <span className="text-gray-600">↓</span>
                <span className="flex items-center gap-1.5 text-purple-400 font-semibold px-2"><Zap size={14}/> AI</span>
                <span className="text-gray-600">↓</span>
                <span className="flex items-center gap-1.5 text-green-400 font-semibold px-2 bg-green-500/10 py-1 rounded"><CheckCircle size={14}/> Output</span>
              </div>
            </div>

            {/* The Output Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* CEO Status */}
              <div className="group bg-gradient-to-br from-[#151515] to-[#1a1205] border border-orange-900/30 hover:border-orange-500/50 p-5 rounded-xl transition-all cursor-pointer shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-gray-400 uppercase tracking-widest text-xs font-bold group-hover:text-gray-200 transition-colors">CEO</div>
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <UserMinus size={16} />
                  </div>
                </div>
                <div className="text-xl font-black text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] mb-1">
                  Concerned
                </div>
                <div className="text-xs text-gray-500">Regarding revenue risk</div>
              </div>

              {/* Product Status */}
              <div className="group bg-gradient-to-br from-[#151515] to-[#1a1a05] border border-yellow-900/30 hover:border-yellow-500/50 p-5 rounded-xl transition-all cursor-pointer shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-gray-400 uppercase tracking-widest text-xs font-bold group-hover:text-gray-200 transition-colors">Product</div>
                  <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                    <Map size={16} />
                  </div>
                </div>
                <div className="text-xl font-black text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] mb-1">
                  Delayed
                </div>
                <div className="text-xs text-gray-500">Release 4.7 pushed back</div>
              </div>

              {/* Engineering Status (Critical) */}
              <div className="group bg-gradient-to-br from-[#151515] to-[#1a0505] border border-red-900/40 hover:border-red-500/50 p-5 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-gray-400 uppercase tracking-widest text-xs font-bold group-hover:text-gray-200 transition-colors">Engineering</div>
                  <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <ShieldAlert size={16} />
                  </div>
                </div>
                <div className="text-xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] mb-1 animate-pulse">
                  Blocked
                </div>
                <div className="text-xs text-gray-500">Pending API resolution</div>
              </div>

              {/* Marketing Status */}
              <div className="group bg-gradient-to-br from-[#151515] to-[#050a1a] border border-blue-900/30 hover:border-blue-500/50 p-5 rounded-xl transition-all cursor-pointer shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-gray-400 uppercase tracking-widest text-xs font-bold group-hover:text-gray-200 transition-colors">Marketing</div>
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Megaphone size={16} /> {/* Ensure you import Megaphone from lucide-react */}
                  </div>
                </div>
                <div className="text-xl font-black text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] mb-1">
                  Waiting
                </div>
                <div className="text-xs text-gray-500">Needs product sign-off</div>
              </div>

            </div>
          </div>
          {/* 🚀 9. ROOT CAUSE GRAPH (The Ultimate Traceability Pipeline) */}
          <div className="bg-[#111] border border-gray-800 p-6 md:p-8 rounded-xl w-full mb-10 overflow-hidden">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                  <Network size={20} className="text-blue-500" /> Root Cause Graph
                </h2>
                <p className="text-sm text-gray-500 mt-1">End-to-end incident traceability. Click any node to deep dive.</p>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 px-3 py-1.5 rounded-md">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2">
                  <GitCommit size={14} className="text-gray-500" /> Incident #823-Alpha
                </span>
              </div>
            </div>

            {/* The Interactive Graph Pipeline */}
            <div className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-6 pt-4 custom-scrollbar px-2">
              
              {/* 1. Customer */}
              <div onClick={() => handleAction('View Customer Details')} className="flex-shrink-0 group flex flex-col items-center gap-3 cursor-pointer">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:border-blue-400 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] relative z-10">
                  <User size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-400 transition-colors">Customer</span>
              </div>

              <ArrowRight size={20} className="text-gray-700 flex-shrink-0" />

              {/* 2. Ticket */}
              <div onClick={() => handleAction('Open Zendesk Ticket')} className="flex-shrink-0 group flex flex-col items-center gap-3 cursor-pointer">
                <div className="h-14 w-14 rounded-2xl bg-[#151515] border border-gray-700 flex items-center justify-center text-gray-400 group-hover:scale-110 group-hover:bg-gray-800 group-hover:border-gray-500 transition-all relative z-10">
                  <Ticket size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Ticket</span>
              </div>

              <ArrowRight size={20} className="text-gray-700 flex-shrink-0" />

              {/* 3. Slack */}
              <div onClick={() => handleAction('View Slack Thread')} className="flex-shrink-0 group flex flex-col items-center gap-3 cursor-pointer">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:border-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] relative z-10">
                  <Hash size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-purple-400 transition-colors">Slack</span>
              </div>

              <ArrowRight size={20} className="text-gray-700 flex-shrink-0" />

              {/* 4. Engineer */}
              <div onClick={() => handleAction('View Engineer Profile')} className="flex-shrink-0 group flex flex-col items-center gap-3 cursor-pointer">
                <div className="h-14 w-14 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 group-hover:border-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] relative z-10">
                  <TerminalSquare size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-green-400 transition-colors">Engineer</span>
              </div>

              <ArrowRight size={20} className="text-gray-700 flex-shrink-0" />

              {/* 5. Commit */}
              <div onClick={() => handleAction('View GitHub Commit')} className="flex-shrink-0 group flex flex-col items-center gap-3 cursor-pointer">
                <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 group-hover:bg-yellow-500/20 group-hover:border-yellow-400 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] relative z-10">
                  <GitCommit size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-yellow-400 transition-colors">Commit</span>
              </div>

              <ArrowRight size={20} className="text-gray-700 flex-shrink-0" />

              {/* 6. Deployment */}
              <div onClick={() => handleAction('View Vercel Deployment')} className="flex-shrink-0 group flex flex-col items-center gap-3 cursor-pointer">
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-400 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] relative z-10">
                  <Rocket size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">Deployment</span>
              </div>

              <ArrowRight size={20} className="text-red-900/50 flex-shrink-0" />

              {/* 7. Crash */}
              <div onClick={() => handleAction('View Datadog Crash Logs')} className="flex-shrink-0 group flex flex-col items-center gap-3 cursor-pointer">
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/50 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500/20 group-hover:border-red-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse relative z-10">
                  <ServerCrash size={24} />
                </div>
                <span className="text-xs font-bold text-red-500/70 uppercase tracking-wider group-hover:text-red-400 transition-colors">Crash</span>
              </div>

              <ArrowRight size={20} className="text-red-900/50 flex-shrink-0" />

              {/* 8. Revenue (The Final Impact) */}
              <div onClick={() => handleAction('View Revenue Impact')} className="flex-shrink-0 group flex flex-col items-center gap-3 cursor-pointer">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-900/40 to-[#1a0505] border-2 border-red-500/50 flex items-center justify-center text-red-400 group-hover:scale-110 group-hover:border-red-400 transition-all shadow-[0_0_25px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] relative z-10">
                  <DollarSign size={24} />
                </div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider group-hover:text-red-400 transition-colors">Revenue</span>
              </div>

            </div>

            {/* Subtle CSS for hiding the scrollbar while keeping functionality */}
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                height: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #111; 
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #333; 
                border-radius: 10px;
              }
              .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                background: #555; 
              }
            `}</style>
          </div>
          {/* 🚀 10. AI INBOX (The Anti-Dashboard Daily Brief) */}
          <div className="bg-[#0a0a0a] border-l-4 border-blue-500 p-8 md:p-12 rounded-2xl w-full mb-12 shadow-2xl relative overflow-hidden group">
            
            {/* Subtle background decoration */}
            <div className="absolute -top-10 -right-10 text-gray-800/20 group-hover:text-blue-900/10 transition-colors pointer-events-none">
              <Mail size={250} />
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight flex items-center gap-4">
                Good Morning.
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </h1>

              {/* The "Read. Done." Content Flow */}
              <div className="space-y-6 text-2xl md:text-3xl font-medium text-gray-500 leading-relaxed max-w-4xl">
                
                <p className="flex flex-wrap items-center gap-x-3 gap-y-4">
                  Today 
                  <span onClick={() => handleAction('View Churn Risk')} className="text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center gap-2">
                    <UserMinus size={24} /> 3 customers
                  </span> 
                  likely to churn.
                </p>
                
                <p className="flex flex-wrap items-center gap-x-3 gap-y-4">
                  Fixing 
                  <span onClick={() => handleAction('Open Jira Issue #823')} className="text-white bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 px-4 py-1.5 rounded-xl cursor-pointer transition-all font-mono text-xl md:text-2xl hover:scale-105 flex items-center gap-2">
                    <TerminalSquare size={20} className="text-gray-400"/> Issue #823
                  </span> 
                  will save 
                  <span className="text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.15)] font-bold">
                    $420k
                  </span>.
                </p>
                
                <p className="flex flex-wrap items-center gap-x-3 gap-y-4">
                  Release 
                  <span className="text-white font-mono bg-[#1a1a1a] px-4 py-1.5 rounded-xl text-xl md:text-2xl border border-gray-700">
                    4.7
                  </span> 
                  has 
                  <span onClick={() => handleAction('View Release Failure Risk')} className="text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-4 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-105 shadow-[0_0_15px_rgba(249,115,22,0.15)] flex items-center gap-2">
                    <AlertTriangle size={24} /> 81% failure risk
                  </span>.
                </p>

              </div>

              {/* One Click to Clear Inbox */}
              <div className="mt-12">
                <button onClick={() => handleAction('Mark Briefing Read')} className="bg-white text-black px-8 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <CheckCircle2 size={20} /> Mark as Read
                </button>
              </div>
            </div>

          </div>
          {/* 🚀 11. AUTOMATION CENTER (No-Code Workflow Builder) */}
          <div className="bg-[#111] border border-gray-800 p-6 md:p-8 rounded-xl w-full mb-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                  <Settings size={20} className="text-blue-500" /> Automation Center
                </h2>
                <p className="text-sm text-gray-500 mt-1">If-This-Then-That for Enterprise. Drag, drop, and automate.</p>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-md">
                <Zap size={14} className="text-purple-400" />
                <span className="text-xs text-purple-400 uppercase tracking-wider font-bold">
                  No Coding Required
                </span>
              </div>
            </div>

            {/* The Visual Rule Builder */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 md:p-10 relative overflow-hidden shadow-inner">
              
              {/* Active Toggle Switch (Top Right) */}
              <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-3">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold hidden md:block">Rule Status</span>
                <div className="w-12 h-6 bg-green-500/20 rounded-full border border-green-500/40 flex items-center p-1 cursor-pointer transition-colors hover:bg-green-500/30">
                  <div className="w-4 h-4 bg-green-500 rounded-full ml-auto shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                </div>
              </div>

              {/* Step 1: The IF Condition */}
              <div className="flex flex-col items-start gap-4 z-10 relative">
                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                  <div className="bg-gray-800 text-gray-300 font-bold px-4 py-3 rounded-xl tracking-widest text-sm w-20 text-center">IF</div>
                  
                  {/* Logic Pills Container */}
                  <div className="flex-1 flex flex-wrap items-center gap-2 md:gap-3 bg-[#151515] border border-gray-700 p-3 rounded-xl shadow-lg w-full max-w-2xl">
                    <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer hover:bg-orange-500/20 transition-colors">
                      <AlertTriangle size={16}/> Revenue Risk
                    </span>
                    <span className="bg-[#222] text-gray-300 px-4 py-2 rounded-lg font-black font-mono shadow-inner">
                      &gt;
                    </span>
                    <span className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg font-bold font-mono cursor-pointer hover:bg-green-500/20 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                      $50k
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting Arrow */}
              <div className="flex justify-start pl-8 my-4">
                <div className="h-6 w-0.5 bg-blue-500/50 absolute -z-10 ml-3"></div>
                <ArrowDown className="text-blue-500 animate-bounce" size={24} />
              </div>

              {/* Step 2: The THEN Actions Pipeline */}
              <div className="flex items-start gap-3 w-full relative z-10">
                <div className="bg-blue-600 text-white font-bold px-4 py-3 rounded-xl tracking-widest text-sm w-20 text-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">THEN</div>
                
                <div className="flex-1 flex flex-col gap-3 w-full max-w-2xl">
                  
                  {/* Action 1 */}
                  <div className="group bg-[#151515] border border-gray-700 hover:border-blue-500/50 p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] relative">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400"><Ticket size={20}/></div>
                    <span className="text-lg font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">Create Jira</span>
                  </div>
                  
                  <div className="pl-6 py-1"><ArrowDown className="text-gray-700" size={16} /></div>

                  {/* Action 2 */}
                  <div className="group bg-[#151515] border border-gray-700 hover:border-purple-500/50 p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] relative">
                    <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400"><Hash size={20}/></div>
                    <span className="text-lg font-semibold text-gray-200 group-hover:text-purple-400 transition-colors">Notify Slack</span>
                  </div>

                  <div className="pl-6 py-1"><ArrowDown className="text-gray-700" size={16} /></div>

                  {/* Action 3 */}
                  <div className="group bg-[#151515] border border-gray-700 hover:border-green-500/50 p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] relative">
                    <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400"><UserCheck size={20}/></div>
                    <span className="text-lg font-semibold text-gray-200 group-hover:text-green-400 transition-colors">Assign Eng Manager</span>
                  </div>

                  <div className="pl-6 py-1"><ArrowDown className="text-gray-700" size={16} /></div>

                  {/* Action 4 (Critical Conclusion) */}
                  <div className="group bg-gradient-to-r from-[#1a0505] to-[#151515] border border-red-900/40 hover:border-red-500/50 p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] relative">
                    <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 animate-pulse"><AlertOctagon size={20}/></div>
                    <span className="text-lg font-bold text-red-400 group-hover:text-red-300 transition-colors">Open Incident</span>
                  </div>

                  {/* Add New Action Button */}
                  <div className="mt-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-white bg-[#111] hover:bg-[#1a1a1a] border border-dashed border-gray-700 hover:border-gray-500 px-5 py-3 rounded-xl transition-colors font-semibold text-sm w-full md:w-auto justify-center">
                      <Plus size={18} /> Add Action
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
          {/* 🚀 12. ROLE-BASED COMMAND CENTER (The God Mode Screen) */}
          <div className="bg-[#050505] border border-gray-800 rounded-2xl w-full mb-12 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
            
            {/* The Dynamic Header & Role Selector */}
            <div className="bg-[#0a0a0a] border-b border-gray-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Workspace Intelligence</h1>
                <p className="text-gray-500 text-sm font-medium">Unified AI Graph • Rendering customized insights</p>
              </div>

              {/* The "Lens" Switcher */}
              <div className="flex bg-[#111] p-1.5 rounded-xl border border-gray-800 shadow-inner w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('ceo')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ceo' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'}`}
                >
                  <Briefcase size={16} /> CEO View
                </button>
                <button 
                  onClick={() => setActiveTab('eng')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'eng' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'}`}
                >
                  <TerminalSquare size={16} /> Engineering
                </button>
                <button 
                  onClick={() => setActiveTab('pm')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'pm' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'}`}
                >
                  <LayoutDashboard size={16} /> Product
                </button>
              </div>
            </div>

            {/* The Dynamic Content Area */}
            <div className="p-6 md:p-8 bg-gradient-to-b from-[#0a0a0a] to-[#050505] flex-1 relative">
              
              {/* =========================================
                  LENS 1: CEO VIEW (The Big Picture)
                  ========================================= */}
              {activeTab === 'ceo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  
                  <div className="bg-[#111] border border-green-900/30 p-6 rounded-xl group hover:border-green-500/50 transition-all shadow-lg">
                    <div className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4 flex justify-between">Revenue <DollarSign size={14} className="text-green-500"/></div>
                    <div className="text-4xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">$14.2M</div>
                    <div className="text-sm text-gray-500 mt-2 font-medium">+12% MRR Growth</div>
                  </div>

                  <div className="bg-[#111] border border-red-900/30 p-6 rounded-xl group hover:border-red-500/50 transition-all shadow-lg">
                    <div className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4 flex justify-between">Total Risk <AlertTriangle size={14} className="text-red-500"/></div>
                    <div className="text-4xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">$840k</div>
                    <div className="text-sm text-gray-500 mt-2 font-medium">3 Critical Bugs • 4 Churn Risks</div>
                  </div>

                  <div className="bg-[#111] border border-blue-900/30 p-6 rounded-xl group hover:border-blue-500/50 transition-all shadow-lg">
                    <div className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4 flex justify-between">Growth Target <TrendingUp size={14} className="text-blue-500"/></div>
                    <div className="text-4xl font-black text-white">108%</div>
                    <div className="text-sm text-blue-400 mt-2 font-medium">On track for Q3 goals</div>
                  </div>

                  <div className="bg-[#111] border border-pink-900/30 p-6 rounded-xl group hover:border-pink-500/50 transition-all shadow-lg">
                    <div className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4 flex justify-between">Customer Happiness <Smile size={14} className="text-pink-500"/></div>
                    <div className="text-4xl font-black text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]">92/100</div>
                    <div className="text-sm text-gray-500 mt-2 font-medium">CSAT up by 4 pts this week</div>
                  </div>

                  <div className="bg-[#111] border border-orange-900/30 p-6 rounded-xl group hover:border-orange-500/50 transition-all shadow-lg">
                    <div className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4 flex justify-between">Eng Velocity <Activity size={14} className="text-orange-500"/></div>
                    <div className="text-4xl font-black text-orange-400">142 pts</div>
                    <div className="text-sm text-gray-500 mt-2 font-medium">Sprint completion rate: 94%</div>
                  </div>

                  <div className="bg-gradient-to-br from-[#111] to-purple-900/10 border border-purple-500/30 p-6 rounded-xl group hover:border-purple-500/60 transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <div className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4 flex justify-between">AI Decisions Made <Cpu size={14} className="text-purple-500 animate-pulse"/></div>
                    <div className="text-4xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">1,842</div>
                    <div className="text-sm text-purple-300 mt-2 font-medium">Auto-resolved 41% of tickets</div>
                  </div>
                </div>
              )}

              {/* =========================================
                  LENS 2: ENGINEERING VIEW (The Fixer)
                  ========================================= */}
              {activeTab === 'eng' && (
                <div className="animate-fade-in space-y-4">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-4">
                    <div className="col-span-3">Top Bugs</div>
                    <div className="col-span-2 text-center">Affected</div>
                    <div className="col-span-2 text-center">Rev Impact</div>
                    <div className="col-span-2">Root Cause</div>
                    <div className="col-span-2">AI Suggests</div>
                    <div className="col-span-1 text-right">ETA</div>
                  </div>

                  {/* Bug Row 1 */}
                  <div className="grid grid-cols-12 gap-4 items-center bg-[#111] border border-red-900/30 hover:border-red-500/50 p-4 rounded-xl cursor-pointer transition-colors group">
                    <div className="col-span-3 flex flex-col">
                      <span className="font-bold text-gray-200 group-hover:text-red-400 transition-colors">Stripe Webhook 500</span>
                      <span className="text-xs text-red-500 font-mono">ERR_PAYMENT_FAIL</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-2 font-medium text-gray-300"><Users size={14} className="text-gray-500"/> 214</div>
                    <div className="col-span-2 flex items-center justify-center gap-1 font-bold text-red-400 bg-red-500/10 py-1 rounded"><DollarSign size={14}/> $420k</div>
                    <div className="col-span-2 flex items-center gap-2 font-mono text-xs text-gray-400 bg-[#151515] px-2 py-1 rounded border border-gray-700"><GitBranch size={12}/> PR #892</div>
                    <div className="col-span-2 flex items-center gap-2 font-medium text-blue-400"><div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">RJ</div> Rahul J.</div>
                    <div className="col-span-1 text-right font-mono text-sm text-orange-400">2 hrs</div>
                  </div>

                  {/* Bug Row 2 */}
                  <div className="grid grid-cols-12 gap-4 items-center bg-[#111] border border-orange-900/30 hover:border-orange-500/50 p-4 rounded-xl cursor-pointer transition-colors group">
                    <div className="col-span-3 flex flex-col">
                      <span className="font-bold text-gray-200 group-hover:text-orange-400 transition-colors">Video Upload Timeout</span>
                      <span className="text-xs text-orange-500 font-mono">S3_GATEWAY_TIMEOUT</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-2 font-medium text-gray-300"><Users size={14} className="text-gray-500"/> 93</div>
                    <div className="col-span-2 flex items-center justify-center gap-1 font-bold text-orange-400 bg-orange-500/10 py-1 rounded"><DollarSign size={14}/> $110k</div>
                    <div className="col-span-2 flex items-center gap-2 font-mono text-xs text-gray-400 bg-[#151515] px-2 py-1 rounded border border-gray-700"><GitBranch size={12}/> Env Var Missing</div>
                    <div className="col-span-2 flex items-center gap-2 font-medium text-blue-400"><div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">SK</div> Satyam K.</div>
                    <div className="col-span-1 text-right font-mono text-sm text-green-400">15 min</div>
                  </div>
                </div>
              )}

              {/* =========================================
                  LENS 3: PRODUCT MANAGER VIEW (The Builder)
                  ========================================= */}
              {activeTab === 'pm' && (
                <div className="animate-fade-in space-y-4">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-4">
                    <div className="col-span-4">Requested Features</div>
                    <div className="col-span-2 text-center">Priority</div>
                    <div className="col-span-2 text-center">Effort</div>
                    <div className="col-span-2 text-center">Rev Unlock</div>
                    <div className="col-span-2 text-right">AI Score</div>
                  </div>

                  {/* Feature Row 1 */}
                  <div className="grid grid-cols-12 gap-4 items-center bg-[#111] border border-blue-900/30 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition-colors group">
                    <div className="col-span-4 flex flex-col">
                      <span className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors text-lg">Offline Mode</span>
                      <span className="text-xs text-gray-500">Requested by 2,134 users</span>
                    </div>
                    <div className="col-span-2 flex justify-center"><span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">P0 - Critical</span></div>
                    <div className="col-span-2 flex justify-center text-gray-300 font-mono text-sm">3 Sprints</div>
                    <div className="col-span-2 flex items-center justify-center font-bold text-green-400"><DollarSign size={14}/> $1.2M</div>
                    <div className="col-span-2 flex justify-end">
                      <div className="relative h-10 w-10 flex items-center justify-center rounded-full bg-[#151515] border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all">
                        <span className="font-bold text-blue-400 text-sm">99</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Row 2 */}
                  <div className="grid grid-cols-12 gap-4 items-center bg-[#111] border border-gray-800 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition-colors group">
                    <div className="col-span-4 flex flex-col">
                      <span className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors text-lg">Export to PDF</span>
                      <span className="text-xs text-gray-500">Enterprise tier blocker (Notion, Stripe)</span>
                    </div>
                    <div className="col-span-2 flex justify-center"><span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">P1 - High</span></div>
                    <div className="col-span-2 flex justify-center text-gray-300 font-mono text-sm">1 Sprint</div>
                    <div className="col-span-2 flex items-center justify-center font-bold text-green-400"><DollarSign size={14}/> $380k</div>
                    <div className="col-span-2 flex justify-end">
                      <div className="relative h-10 w-10 flex items-center justify-center rounded-full bg-[#151515] border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                        <span className="font-bold text-purple-400 text-sm">84</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
          {/* 🚀 13. AI COMPANY BRAIN (The Ultimate Moat) */}
          <div className="bg-[#050505] border border-gray-800 p-8 md:p-12 rounded-3xl w-full mb-12 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-purple-900/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col items-center text-center relative z-10 mb-12">
              <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 p-3 rounded-2xl mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Brain size={32} className="animate-pulse" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase mb-2">
                AI Company Brain
              </h2>
              <p className="text-gray-500 font-medium">Cross-platform correlation engine.</p>
            </div>

            {/* The CEO Prompt */}
            <div className="flex justify-center mb-10 relative z-10">
              <div className="bg-[#111] border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] px-8 py-4 rounded-full text-xl md:text-2xl font-semibold text-gray-200 flex items-center gap-4">
                <span className="text-blue-500">CEO asks:</span> 
                "Why are customers unhappy?"
              </div>
            </div>

            {/* The Correlation Pipeline (The Math) */}
            <div className="flex flex-col items-center mb-12 relative z-10 w-full max-w-5xl mx-auto">
              
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 w-full">
                <div className="flex items-center gap-2 bg-[#151515] border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 shadow-lg"><MessageSquare size={16} className="text-[#E01E5A]"/> Slack</div>
                <span className="text-gray-600 font-black">+</span>
                <div className="flex items-center gap-2 bg-[#151515] border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 shadow-lg"><GitBranch size={16} className="text-white"/> GitHub</div>
                <span className="text-gray-600 font-black">+</span>
                <div className="flex items-center gap-2 bg-[#151515] border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 shadow-lg"><Users size={16} className="text-blue-400"/> CRM</div>
                <span className="text-gray-600 font-black">+</span>
                <div className="flex items-center gap-2 bg-[#151515] border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 shadow-lg"><Video size={16} className="text-blue-500"/> Zoom</div>
                <span className="text-gray-600 font-black">+</span>
                <div className="flex items-center gap-2 bg-[#151515] border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 shadow-lg"><PhoneCall size={16} className="text-green-500"/> Sales Calls</div>
                <span className="text-gray-600 font-black">+</span>
                <div className="flex items-center gap-2 bg-[#151515] border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 shadow-lg"><Star size={16} className="text-yellow-400"/> Reviews</div>
                <span className="text-gray-600 font-black">+</span>
                <div className="flex items-center gap-2 bg-[#151515] border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 shadow-lg"><ServerCrash size={16} className="text-red-500"/> Crash Logs</div>
                <span className="text-gray-600 font-black">+</span>
                <div className="flex items-center gap-2 bg-[#151515] border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 shadow-lg"><BarChart size={16} className="text-orange-500"/> Analytics</div>
              </div>

              {/* Downward Flow */}
              <div className="flex flex-col items-center mt-8 gap-2">
                <ArrowDown size={24} className="text-purple-500/60 animate-bounce" />
                <ArrowDown size={24} className="text-purple-500/80 animate-bounce delay-75" />
                <ArrowDown size={24} className="text-purple-500 animate-bounce delay-150" />
                <div className="bg-purple-500 text-white text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full mt-2 shadow-[0_0_15px_rgba(168,85,247,0.6)]">
                  One Unified Answer
                </div>
              </div>
            </div>

            {/* The Final Answer Box (The Masterpiece) */}
            <div className="relative z-10 max-w-4xl mx-auto bg-gradient-to-br from-[#111] to-[#150a0a] border border-red-900/40 rounded-2xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* Root Cause & Affected */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={14}/> Root Cause</div>
                    <div className="text-2xl font-bold text-white">Video Upload Latency</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={14}/> Affected</div>
                    <div className="text-xl font-semibold text-orange-400 bg-orange-500/10 inline-block px-3 py-1 rounded-lg border border-orange-500/20">
                      Premium Customers
                    </div>
                  </div>
                </div>

                {/* Timeline & Reason */}
                <div className="space-y-6">
                  <div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={14}/> Started</div>
                    <div className="text-xl font-medium text-gray-300">Tuesday, 11:42 AM</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><GitBranch size={14}/> Reason</div>
                    <div className="text-xl font-mono font-medium text-gray-300 bg-[#1a1a1a] inline-block px-3 py-1 rounded-lg border border-gray-700">
                      Deployment 4.8
                    </div>
                  </div>
                </div>

                {/* The Absolute Core: Revenue & Action */}
                <div className="space-y-6 lg:border-l lg:border-gray-800 lg:pl-8">
                  <div>
                    <div className="text-red-500/70 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">Revenue At Risk</div>
                    <div className="text-4xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
                      $1.8M
                    </div>
                  </div>
                  <div>
                    <div className="text-green-500/70 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><RefreshCcw size={14}/> Est. Recovery</div>
                    <div className="text-xl font-bold text-green-400">18 hours</div>
                  </div>
                </div>

              </div>

              {/* The Execution Button */}
              <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm font-medium text-gray-400">
                  AI Confidence: <span className="text-white font-bold">98%</span> • All 8 data sources verified.
                </div>
                <button className="w-full md:w-auto bg-white text-black text-lg font-bold px-10 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                  <GitBranch size={20} /> Execute Rollback Now
                </button>
              </div>

            </div>
          </div>


            {/* AI Timeline Component */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                <Clock size={18} className="text-purple-500" /> AI Correlation Timeline
              </h2>
              <div className="space-y-5 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-800">
                
                <div className="relative flex items-center justify-between group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#111] bg-gray-800 text-gray-400 z-10"><MessageSquare size={12} /></div>
                  <div className="w-[calc(100%-3rem)] p-3 rounded-lg border border-gray-800 bg-[#151515]">
                    <div className="flex justify-between mb-1"><div className="font-semibold text-sm text-gray-300">Slack complaints increased</div><time className="font-mono text-xs text-gray-500">10:42 AM</time></div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#111] bg-red-900/50 text-red-400 z-10"><AlertTriangle size={12} /></div>
                  <div className="w-[calc(100%-3rem)] p-3 rounded-lg border border-red-900/30 bg-[#151515]">
                    <div className="flex justify-between mb-1"><div className="font-semibold text-sm text-red-400">Crash spike detected</div><time className="font-mono text-xs text-gray-500">11:20 AM</time></div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#111] bg-blue-900/50 text-blue-400 z-10"><CheckCircle size={12} /></div>
                  <div className="w-[calc(100%-3rem)] p-3 rounded-lg border border-blue-900/30 bg-[#151515]">
                    <div className="flex justify-between mb-1"><div className="font-semibold text-sm text-blue-400">AI created Jira #823</div><time className="font-mono text-xs text-gray-500">12:14 PM</time></div>
                  </div>
                </div>
                

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}