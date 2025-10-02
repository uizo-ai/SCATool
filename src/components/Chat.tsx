// components/Chat.tsx
"use client";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { v4 as uuid } from "uuid";
import type { ChatMessage, StudentProfile, ChatSession, UserStats } from "@/lib/types";

const DEFAULT_PROFILE: StudentProfile = { firstGen: true, confidence: "low" };

interface ChatProps {
  stats: UserStats;
  onStatsUpdate: (stats: UserStats) => void;
}

export default forwardRef<any, ChatProps>(function Chat({ stats, onStatsUpdate }, ref) {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [isProfileMinimized, setIsProfileMinimized] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  // Get current session messages
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Expose session management functions to parent
  useImperativeHandle(ref, () => ({
    sessions,
    currentSessionId,
    switchToSession: (sessionId: string) => {
      setCurrentSessionId(sessionId);
    },
    deleteSession: (sessionId: string) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].id);
        } else {
          setCurrentSessionId("");
        }
      }
    }
  }));

  // Helper functions
  function createNewSession(): ChatSession {
    const id = uuid();
    return {
      id,
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
  }

  function updateSessionTitle(sessionId: string, firstMessage: string) {
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title, lastActivity: Date.now() } : s
    ));
  }

  function addMessageToSession(sessionId: string, message: ChatMessage) {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, messages: [...s.messages, message], lastActivity: Date.now() }
        : s
    ));
  }

  function updateMessageInSession(sessionId: string, messageId: string, content: string) {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { 
            ...s, 
            messages: s.messages.map(m => 
              m.id === messageId ? { ...m, content } : m
            ),
            lastActivity: Date.now()
          }
        : s
    ));
  }

  function switchToSession(sessionId: string) {
    setCurrentSessionId(sessionId);
  }

  function deleteSession(sessionId: string) {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      // Switch to another session or create new one
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
      } else {
        const newSession = createNewSession();
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
      }
    }
  }


  // Conversation starter questions
  const initialQuestions = [
    "I'm not sure what to do next for internships.",
    "There's a job fair—should I go?",
    "I don't know what to say in an informational interview.",
    "I have an interview and I'm nervous.",
    "How do I network when I don't know anyone?",
    "I'm a first-gen student and feel lost about careers."
  ];

  const deeperQuestions = [
    "Can you help me practice my elevator pitch?",
    "What questions should I ask in an informational interview?",
    "How do I follow up after networking events?",
    "Can you help me reframe my challenges as strengths?",
    "What's the best way to build relationships with professionals?",
    "How do I handle imposter syndrome in professional settings?"
  ];

  // Handle hydration and load from localStorage
  useEffect(() => {
    setIsHydrated(true);
    
    // Load profile from localStorage
    try {
      const savedProfile = localStorage.getItem("sca_profile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch {
      // Keep default profile
    }

    // Load sessions from localStorage
    try {
      const savedSessions = localStorage.getItem("sca_sessions");
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
        
        // Set current session to the most recent one
        if (parsedSessions.length > 0) {
          const mostRecent = parsedSessions.reduce((latest: ChatSession, current: ChatSession) => 
            current.lastActivity > latest.lastActivity ? current : latest
          );
          setCurrentSessionId(mostRecent.id);
        }
      } else {
        // Create initial session if none exist
        const initialSession = createNewSession();
        setSessions([initialSession]);
        setCurrentSessionId(initialSession.id);
      }
    } catch {
      // Create initial session if loading fails
      const initialSession = createNewSession();
      setSessions([initialSession]);
      setCurrentSessionId(initialSession.id);
    }

  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("sca_profile", JSON.stringify(profile));
    }
  }, [profile, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("sca_sessions", JSON.stringify(sessions));
    }
  }, [sessions, isHydrated]);

  useEffect(() => {
    if (isHydrated && messages.length > 0) {
      viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isHydrated]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    // Create new session if none exists
    if (sessions.length === 0) {
      const newSession = createNewSession();
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
    }

    const userMsg: ChatMessage = { id: uuid(), role: "user", content: text, createdAt: Date.now() };
    addMessageToSession(currentSessionId, userMsg);

    // Update session title if this is the first message
    if (messages.length === 0) {
      updateSessionTitle(currentSessionId, text);
    }

    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.concat(userMsg).map(({ role, content }) => ({ role, content })),
        studentProfile: profile,
      }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    const id = uuid();
    const assistant: ChatMessage = { id, role: "assistant", content: "", createdAt: Date.now() };
    addMessageToSession(currentSessionId, assistant);

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      updateMessageInSession(currentSessionId, id, acc);
    }
    
    // Update conversation count when assistant finishes responding
    onStatsUpdate({
      ...stats,
      totalConversations: stats.totalConversations + 1,
      lastActivity: Date.now()
    });
    
    setLoading(false);
  }

  function reset() {
    // Create a new session instead of clearing messages
    const newSession = createNewSession();
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  }

  // Handle clicking on suggested questions
  function handleQuestionClick(question: string) {
    setInput(question);
  }

  // Show loading state until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Chat with Social Capital Coach</h1>
              <p className="text-sm text-gray-600">Loading your personalized coaching experience...</p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm border-x border-white/20 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Preparing your coaching session...</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl p-6 shadow-xl border border-white/20">
          <div className="grid md:grid-cols-[1fr,280px] gap-4">
            <div className="bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Chat with Social Capital Coach</h1>
              <p className="text-sm text-gray-600">Your personalized AI coaching companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Online</span>
            </div>
            <button
              onClick={reset}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Start new conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div ref={viewRef} className="flex-1 bg-white/95 backdrop-blur-sm border-x border-white/20 p-6 overflow-auto">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Welcome to Social Capital Coach!</h3>
              <p className="text-gray-600 mb-6">I'm here to help you build social capital and confidence. Let's start with a conversation.</p>
              
              {/* Profile Status Indicator */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">Personalized Coaching Active</span>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  {profile.firstGen && <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-1">First-Gen</span>}
                  {profile.confidence && <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2 mb-1">Confidence: {profile.confidence}</span>}
                  {profile.interests && profile.interests.length > 0 && <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2 mb-1">Interests: {profile.interests.slice(0, 2).join(", ")}</span>}
                  {profile.identityNotes && <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2 mb-1">Custom Notes</span>}
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 text-left">
                  <p className="text-sm text-gray-700 font-medium">Try asking:</p>
                  <p className="text-sm text-gray-600 mt-1">"I'm not sure what to do next for internships."</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-left">
                  <p className="text-sm text-gray-700 font-medium">Or:</p>
                  <p className="text-sm text-gray-600 mt-1">"There's a job fair—should I go?"</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                <div className={`max-w-[80%] ${m.role === "user" ? "order-2" : "order-1"}`}>
                  <div className={`flex items-start space-x-3 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      m.role === "user" 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600" 
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                    }`}>
                      {m.role === "user" ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      m.role === "user" 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                        : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl p-6 shadow-xl border border-white/20">
        {/* Conversation Starter Questions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {messages.length === 0 ? "Start a conversation:" : "Keep exploring:"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(messages.length === 0 ? initialQuestions : deeperQuestions).map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="px-3 py-2 text-xs bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-700 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-6">
          {/* Message Input */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={loading ? "Social Capital Coach is thinking..." : "Type your message here..."}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading) send();
                  }
                }}
                className="w-full h-24 resize-none outline-none p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-blue-600"
                disabled={loading}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <button
                  onClick={reset}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear chat
                </button>
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Send</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Sidebar */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">My Profile</h3>
              </div>
              <button
                onClick={() => setIsProfileMinimized(!isProfileMinimized)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title={isProfileMinimized ? "Expand profile" : "Minimize profile"}
              >
                <svg 
                  className={`w-4 h-4 text-gray-600 transition-transform ${isProfileMinimized ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {!isProfileMinimized && (
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!profile.firstGen}
                    onChange={(e) => setProfile((p) => ({ ...p, firstGen: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-blue-600">First-generation student</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-2">Confidence Level</label>
                  <select
                    value={profile.confidence ?? "low"}
                    onChange={(e) => setProfile((p) => ({ ...p, confidence: e.target.value as any }))}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-blue-600"
                  >
                    <option value="low">🟡 Low - Building confidence</option>
                    <option value="medium">🟠 Medium - Growing stronger</option>
                    <option value="high">🟢 High - Ready to excel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-2">Career Interests</label>
                  <input
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-blue-600"
                    value={(profile.interests ?? []).join(", ")}
                    onChange={(e) => setProfile((p) => ({ ...p, interests: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                    placeholder="e.g., healthcare, data science, marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-2">Personal Notes</label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 h-20 resize-none text-blue-600"
                    value={profile.identityNotes ?? ""}
                    onChange={(e) => setProfile((p) => ({ ...p, identityNotes: e.target.value }))}
                    placeholder="e.g., commute limits, need paid work, family obligations"
                  />
                </div>
              </div>
            )}
            
            {isProfileMinimized && (
              <div className="text-center py-4">
                <p className="text-sm text-blue-600 font-medium">Profile settings minimized</p>
                <p className="text-xs text-gray-500 mt-1">Click the arrow above to expand and edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
