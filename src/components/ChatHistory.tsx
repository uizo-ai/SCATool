"use client";
import { useState, useEffect } from "react";
import type { ChatSession } from "@/lib/types";

interface ChatHistoryProps {
  chatRef: React.RefObject<any>;
}

export default function ChatHistory({ chatRef }: ChatHistoryProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  // Sync with chat component
  useEffect(() => {
    const interval = setInterval(() => {
      if (chatRef.current) {
        const newSessions = chatRef.current.sessions || [];
        const newCurrentSessionId = chatRef.current.currentSessionId || "";
        if (JSON.stringify(newSessions) !== JSON.stringify(sessions) || newCurrentSessionId !== currentSessionId) {
          setSessions(newSessions);
          setCurrentSessionId(newCurrentSessionId);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [chatRef, sessions, currentSessionId]);

  const handleSessionSelect = (sessionId: string) => {
    if (chatRef.current) {
      chatRef.current.switchToSession(sessionId);
    }
  };

  const handleSessionDelete = (sessionId: string) => {
    if (chatRef.current) {
      chatRef.current.deleteSession(sessionId);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isMinimized) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center justify-center w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Expand chat history"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="text-xs text-gray-500 text-center mt-2">
          {sessions.length} chats
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">Chat History</h3>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Minimize chat history"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No previous chats yet
          </div>
        ) : (
          sessions
            .sort((a, b) => b.lastActivity - a.lastActivity)
            .map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
                onClick={() => handleSessionSelect(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      currentSessionId === session.id ? 'text-white' : 'text-gray-800'
                    }`}>
                      {session.title}
                    </div>
                    <div className={`text-xs mt-1 ${
                      currentSessionId === session.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {formatDate(session.lastActivity)} • {session.messages.length} messages
                    </div>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionDelete(session.id);
                      }}
                      className={`ml-2 p-1 rounded-full transition-colors ${
                        currentSessionId === session.id
                          ? 'hover:bg-white/20'
                          : 'hover:bg-gray-200'
                      }`}
                      title="Delete conversation"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
      
      {sessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} total
          </div>
        </div>
      )}
    </div>
  );
}
