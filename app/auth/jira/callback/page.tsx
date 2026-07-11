'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function JiraCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Jira se aaya hua code catch karo
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      console.log("🔗 Redirecting to Integrations Dashboard with Jira code...");
      // 2. Apne main dashboard par wapas bhejo jahan backend API call hogi
      router.push(`/onboarding/integrations?code=${code}&state=${state}`);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-lg tracking-wide animate-pulse">Authenticating with Jira Workspace...</p>
      </div>
    </div>
  );
}