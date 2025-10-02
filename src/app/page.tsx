// app/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Chat from "@/components/Chat";
import CoachTips from "@/components/CoachTips";
import ChatHistory from "@/components/ChatHistory";
import Logo from "@/components/Logo";
import type { UserStats } from "@/lib/types";

export default function Page() {
  const [stats, setStats] = useState<UserStats>({ totalConversations: 0, goalsSet: 0, lastActivity: Date.now() });
  const [isHydrated, setIsHydrated] = useState(false);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    setIsHydrated(true);
    // Load stats from localStorage
    try {
      const savedStats = localStorage.getItem("sca_stats");
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch {
      // Keep default stats
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("sca_stats", JSON.stringify(stats));
    }
  }, [stats, isHydrated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-600 to-black">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {/* Large floating particles */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full opacity-30 animate-float-slow"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full opacity-40 animate-float-medium"></div>
          <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-25 animate-float-fast"></div>
          <div className="absolute top-80 right-1/3 w-1 h-1 bg-white rounded-full opacity-35 animate-float-slow"></div>
          <div className="absolute top-32 left-1/2 w-2 h-2 bg-white rounded-full opacity-20 animate-float-medium"></div>
          
          {/* Medium floating particles */}
          <div className="absolute top-96 left-16 w-1 h-1 bg-white rounded-full opacity-30 animate-float-fast"></div>
          <div className="absolute top-64 right-12 w-1.5 h-1.5 bg-white rounded-full opacity-25 animate-float-slow"></div>
          <div className="absolute top-72 left-2/3 w-1 h-1 bg-white rounded-full opacity-40 animate-float-medium"></div>
          <div className="absolute top-88 right-1/4 w-2 h-2 bg-white rounded-full opacity-20 animate-float-fast"></div>
          <div className="absolute top-52 left-1/3 w-1 h-1 bg-white rounded-full opacity-35 animate-float-slow"></div>
          
          {/* Small floating particles */}
          <div className="absolute top-44 left-12 w-0.5 h-0.5 bg-white rounded-full opacity-30 animate-float-medium"></div>
          <div className="absolute top-68 right-8 w-0.5 h-0.5 bg-white rounded-full opacity-25 animate-float-fast"></div>
          <div className="absolute top-76 left-3/4 w-0.5 h-0.5 bg-white rounded-full opacity-40 animate-float-slow"></div>
          <div className="absolute top-84 right-1/2 w-0.5 h-0.5 bg-white rounded-full opacity-20 animate-float-medium"></div>
          <div className="absolute top-56 left-1/5 w-0.5 h-0.5 bg-white rounded-full opacity-35 animate-float-fast"></div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="container mx-auto px-0 py-0">
            {/* Centered Logo */}
            <div className="flex justify-center mb-0">
              <a 
                href="https://socialcapitalacademy.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <Logo 
                  src="/logo.png" 
                  alt="Social Capital Coach Logo" 
                  className="w-48 h-48 object-contain"
                />
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 container mx-auto px-6 py-2 max-w-[1400px]">
          <div className="grid lg:grid-cols-12 gap-12 h-full">
            {/* Left Sidebar - Tips */}
            <div className="lg:col-span-3">
              <div className="sticky top-8">
                <CoachTips stats={stats} />
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-6">
              <Chat 
                ref={chatRef}
                stats={stats} 
                onStatsUpdate={setStats} 
              />
            </div>

            {/* Right Sidebar - Chat History */}
            <div className="lg:col-span-3">
              <div className="sticky top-8">
                <ChatHistory 
                  chatRef={chatRef}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <p className="text-white/80 text-sm">
                  © {new Date().getFullYear()} Social Capital Academy
                </p>
                <div className="hidden md:block w-px h-4 bg-white/30"></div>
                <p className="text-white/60 text-sm">Social Capital Coach (Beta)</p>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                  Privacy
                </a>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                  Terms
                </a>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}