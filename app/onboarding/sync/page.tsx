'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export default function AISyncScreen() {
  const router = useRouter();
  
  // Progress states for each category
  const [progress, setProgress] = useState({
    github: 0,
    slack: 0,
    zendesk: 0,
    crm: 0,
    reviews: 0,
    meetings: 0,
  });

  const [phase, setPhase] = useState('syncing'); // 'syncing' | 'building' | 'complete'

  useEffect(() => {
    // ⚡ The Staggered Fake Sync Engine
    const animateProgress = (key: keyof typeof progress, duration: number, delay: number) => {
      setTimeout(() => {
        let current = 0;
        const interval = setInterval(() => {
          current += Math.floor(Math.random() * 15) + 5;
          if (current >= 100) {
            current = 100;
            clearInterval(interval);
          }
          setProgress(prev => ({ ...prev, [key]: current }));
        }, duration / (100 / 10)); // Speed calculation
      }, delay);
    };

    // Trigger staggered animations (feels like real API processing)
    animateProgress('github', 2000, 0);
    animateProgress('slack', 2500, 800);
    animateProgress('zendesk', 3000, 1500);
    animateProgress('crm', 2200, 2200);
    animateProgress('reviews', 3500, 3000);
    animateProgress('meetings', 2800, 3800);

    // Transition to Phase 2: Knowledge Graph Build
    const totalTime = 3800 + 2800; // Delay + Duration of the last item
    setTimeout(() => {
      setPhase('building');
      
      // Transition to Dashboard (Executive Command Center)
      setTimeout(() => {
        setPhase('complete');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }, 3500); // 3.5 seconds for building graph
      
    }, totalTime + 500);

  }, [router]);

  const renderProgressBar = (label: string, value: number) => (
    <div className="mb-6 relative">
      <div className="flex justify-between text-sm mb-2 font-medium tracking-wide">
        <span className={value === 100 ? 'text-green-400 flex items-center gap-2' : 'text-gray-300'}>
          {label} {value === 100 && <CheckCircle2 size={14} />}
        </span>
        <span className={value === 100 ? 'text-green-400' : 'text-gray-500 font-mono'}>
          {value}%
        </span>
      </div>
      <div className="w-full bg-[#111] rounded-full h-2.5 overflow-hidden border border-gray-800">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out relative overflow-hidden" 
          style={{ width: `${value}%` }}
        >
          {/* Shimmer effect for active bars */}
          {value > 0 && value < 100 && (
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full">
        
        {/* Dynamic Header */}
        <div className="text-center mb-16 h-24 flex flex-col items-center justify-end">
          {phase === 'syncing' && (
            <>
              <Loader2 className="animate-spin text-blue-500 mb-4 h-10 w-10" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-gray-200">
                AI Learning <span className="text-blue-500 animate-pulse">Syncing...</span>
              </h1>
            </>
          )}
          
          {phase === 'building' && (
            <>
              <Sparkles className="text-purple-500 mb-4 h-10 w-10 animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Building Company Knowledge Graph...
              </h1>
            </>
          )}

          {phase === 'complete' && (
            <>
              <CheckCircle2 className="text-green-500 mb-4 h-10 w-10" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-green-400">
                AgentOS Ready.
              </h1>
            </>
          )}
        </div>

        {/* The Progress Bars Container */}
        <div className={`transition-all duration-1000 ${phase !== 'syncing' ? 'opacity-30 blur-sm scale-95' : 'opacity-100 scale-100'}`}>
          <div className="bg-[#0a0a0a] border border-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl">
            {renderProgressBar("GitHub (Code & Commits)", progress.github)}
            {renderProgressBar("Slack (Internal Comms)", progress.slack)}
            {renderProgressBar("Zendesk (Support Tickets)", progress.zendesk)}
            {renderProgressBar("CRM (Sales & Customers)", progress.crm)}
            {renderProgressBar("Reviews (Public Sentiment)", progress.reviews)}
            {renderProgressBar("Meetings (Transcripts)", progress.meetings)}
          </div>
        </div>

      </div>
    </div>
  );
}