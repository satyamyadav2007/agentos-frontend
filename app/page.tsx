"use client";

import { useState, useEffect } from "react";

// Naya Dynamic API URL for Vercel/Render Deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://agentos-api-5suh.onrender.com";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [totalRisk, setTotalRisk] = useState<number>(0);
  const [causalData, setCausalData] = useState<any[]>([]);
  const [repoName, setRepoName] = useState("owner/repo-name");
  const [githubToken, setGithubToken] = useState("");
  const [jiraLoading, setJiraLoading] = useState(false); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([
    { role: "ai", content: "Hello Chief. I'm analyzing your GitHub data. What would you like to know?" }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    // Add user message to UI immediately
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: "human", content: userMsg }]);
    setChatMessage("");
    setIsChatTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: Hum dashboard ka current 'results' data context ke roop mein bhej rahe hain!
        body: JSON.stringify({
          message: userMsg,
          context_data: results 
        }),
      });

      const result = await response.json();
      
      if (result.status === "success") {
        setChatHistory(prev => [...prev, { role: "ai", content: result.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error analyzing the graph." }]);
      }
    } catch (error) {
      console.error("Chat API Error:", error);
    } finally {
      setIsChatTyping(false);
    }
  };
  
  // 🚨 CORRECTED: Added title and prd_content parameters here
  const handleExportToJira = async (title: string, prd_content: string) => {
    setJiraLoading(true);

    // 🚨 FASTAPI 422 FIX: Ensure values are NEVER undefined before stringify
    const safeTitle = title || "AI Generated PRD Task";
    const safeContent = prd_content || "PRD details will be added here.";

    try {
      const response = await fetch(`${API_BASE_URL}/export-jira`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: safeTitle,
          prd_content: safeContent 
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert(`✅ Magic Success! ${result.message}`);
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Failed to export to Jira:", error);
      alert("❌ Backend error! Uvicorn server check karo.");
    } finally {
      setJiraLoading(false);
    }
  };

  const fetchCausalSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/causal-summary`);
      const result = await response.json();
      if (result.status === "success" && result.data) {
        setCausalData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch causal summary:", error);
    }
  };

  // Jab bhi naya GitHub data fetch ho, automatically graph data pull karein
  useEffect(() => {
    fetchCausalSummary();
  }, [results]);

  const handleGithubSync = async () => {
    if (!repoName || !githubToken) {
      alert("Please enter both Repo Name and Token.");
      return;
    }

    setLoading(true);
    setResults([]);
    setTotalRisk(0);

    try {
      const response = await fetch(`${API_BASE_URL}/process-github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_name: repoName,
          token: githubToken,
        }),
      });

      const result = await response.json();
      
      if (result.status === "success" && result.data) {
        setResults(result.data.issues);
        setTotalRisk(result.data.total_risk);
      } else {
        console.error("Backend Error:", result);
      }
    } catch (error) {
      console.error("Failed to connect to GitHub API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-10 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">AI The Voice of Customer 🚀</h1>
          <p className="text-gray-500 font-medium">Autonomous insights engine for enterprise product teams.</p>
        </div>

        {/* GITHUB INTEGRATION BOX */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-10 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-gray-800">
              <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              Connect GitHub Repository
            </h3>
            <p className="text-sm text-gray-500 mb-4">Fetch recent issues automatically and calculate revenue risk.</p>
            
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="e.g., owner/repo-name" 
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-mono text-sm bg-gray-50/50"
              />
              <input 
                type="password" 
                placeholder="Personal Access Token (ghp_...)" 
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-mono text-sm bg-gray-50/50"
              />
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <button 
              onClick={handleGithubSync}
              disabled={loading}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-lg flex items-center gap-2"
            >
              {loading ? "Analyzing..." : "Sync & Analyze"}
            </button>
          </div>
        </div>

        {/* 1. CAUSAL INTELLIGENCE GRAPH SECTION */}
        {causalData.length > 0 && (
          <div className="mb-10 bg-indigo-900 text-white p-8 rounded-2xl shadow-xl border border-indigo-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🧠 Predictive Causal Insights
              </h2>
              <span className="bg-indigo-800 text-indigo-100 text-xs px-3 py-1 rounded-full font-medium tracking-wide">
                POWERED BY NEO4J KNOWLEDGE GRAPH
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {causalData.map((insight, index) => (
                <div key={index} className="bg-indigo-950/50 p-5 rounded-xl border border-indigo-800/50 hover:border-indigo-500 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-indigo-300 text-sm font-medium">Root Cause Bug</p>
                    <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded border border-red-500/30">
                      Release {insight.FailedRelease}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{insight.RootCauseBug}</h3>
                  
                  <div className="flex justify-between items-center border-t border-indigo-800/50 pt-4">
                    <div>
                      <p className="text-indigo-400 text-xs uppercase tracking-wider mb-1">Impacted Clients</p>
                      <p className="text-2xl font-semibold">{insight.ImpactedCustomers}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-400 text-xs uppercase tracking-wider mb-1">Total ARR Damaged</p>
                      <p className="text-2xl font-bold text-red-400">
                        ${insight.TotalARRDamaged?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 2. NAYA V2 EXECUTIVE DASHBOARD CARDS */}
        {/* ========================================== */}
        {results.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Executive Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              
              {/* Card 1: Revenue Risk */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Revenue at Risk</p>
                <p className="text-4xl font-black text-gray-900">${totalRisk.toLocaleString()}</p>
                <p className="text-sm text-red-600 mt-3 font-semibold flex items-center gap-1 bg-red-50 w-fit px-2 py-1 rounded">
                  <span>↑ 22%</span> <span className="text-red-400 font-medium">vs last week</span>
                </p>
              </div>

              {/* Card 2: Tickets / Churn */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">High-Risk Issues</p>
                <p className="text-4xl font-black text-gray-900">{results.length}</p>
                <p className="text-sm text-orange-600 mt-3 font-semibold bg-orange-50 w-fit px-2 py-1 rounded">
                  Requires immediate triage
                </p>
              </div>

              {/* Card 3: Dynamic Risk Epicenter */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Risk Epicenter</p>
                <p className="text-xl font-bold text-gray-900 mt-1 truncate">
                  {results[0]?.analysis?.category || "Authentication"}
                </p>
                <p className="text-sm text-blue-600 mt-4 font-semibold bg-blue-50 w-fit px-2 py-1 rounded">
                  Highest complaint volume
                </p>
              </div>

              {/* Card 4: AI Directive */}
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    ✨ AI Directive
                  </p>
                  <p className="text-xl font-bold text-white leading-snug">Prioritize Sprint 21</p>
                </div>
                <p className="text-sm text-indigo-300 mt-4 font-medium">
                  Fix {results[0]?.analysis?.severity || "High"} severity bugs to secure ARR.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* 3. DETAILED FEEDBACK CHANNELS BREAKDOWN */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Detailed Breakdown</h2>
            
            {results.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm text-gray-500 italic">"{item.originalText}"</p>
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                    {item.email}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs text-red-600 font-medium uppercase tracking-wider">Category</p>
                    <p className="text-lg font-bold text-red-900">{item.analysis?.category || "Unknown"}</p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                    <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">Severity</p>
                    <p className="text-lg font-bold text-orange-900">{item.analysis?.severity || "Unknown"}</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-xs text-green-700 font-medium uppercase tracking-wider">Client ARR</p>
                    <p className="text-lg font-bold text-green-900">${item.revenue?.total_company_arr?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium uppercase tracking-wider">Risk Amount</p>
                    <p className="text-lg font-bold text-red-900">${item.revenue?.revenue_at_risk?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                   <p className="text-sm text-gray-500 font-medium mb-1">AI Summary</p>
                   <p className="text-md text-gray-800">{item.analysis?.summary}</p>
                </div>

                {/* Structured Auto-PRD Code Block */}
                {item.prd_draft && item.prd_draft !== "Skipped PRD generation (Low severity / Low risk)." && (
                  <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold tracking-wider">
                        AUTO-GENERATED PRD
                      </span>
                      <p className="text-sm text-blue-800 font-medium">Ready for Engineering Handoff</p>
                    </div> 
                    
                    
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-mono bg-white p-4 rounded border border-blue-100 shadow-sm">
                      {item.prd_draft}
                    </div>
                    <button 
                      onClick={() => handleExportToJira(item.originalText, item.prd_draft)}
                      disabled={jiraLoading}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all"
                    >
                      {jiraLoading ? "Exporting to Jira..." : "Export to Jira"}
                    </button>
                    
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* FLOATING EXECUTIVE AI CHAT WIDGET */}
      {/* ========================================== */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Chat Window */}
        {isChatOpen && (
          <div className="bg-white w-96 rounded-2xl shadow-2xl border border-gray-200 mb-4 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h4 className="font-bold text-sm">AgentOS CPO</h4>
                  <p className="text-xs text-gray-400">Context-Aware AI</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="h-80 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === "human" ? "bg-black text-white self-end rounded-br-none" : "bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm"}`}>
                  {msg.content}
                </div>
              ))}
              {isChatTyping && (
                <div className="bg-white border border-gray-200 text-gray-500 self-start p-3 rounded-xl rounded-bl-none shadow-sm text-xs font-medium flex gap-1">
                  <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about revenue risk..."
                className="flex-1 bg-gray-100 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-black"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isChatTyping}
                className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          {isChatOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span className="font-bold">Ask AI CPO</span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}