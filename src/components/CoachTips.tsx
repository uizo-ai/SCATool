// components/CoachTips.tsx
import type { UserStats } from "@/lib/types";

interface CoachTipsProps {
  stats: UserStats;
}

export default function CoachTips({ stats }: CoachTipsProps) {
  const tips = [
    {
      icon: "🎯",
      title: "Reduce Anxiety",
      description: "Build confidence before job fairs & info interviews"
    },
    {
      icon: "💬",
      title: "Craft Your Story",
      description: "Perfect your 30-second intro and smart questions"
    },
    {
      icon: "🎭",
      title: "Role-Play Practice",
      description: "Practice tough conversations about experience & challenges"
    },
    {
      icon: "📈",
      title: "Build Momentum",
      description: "Plan tiny next steps & follow-ups that create progress"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 animate-fadeIn">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">What I can help with</h2>
        </div>
        
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{tip.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl animate-fadeIn">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg">Quick Start</h3>
        </div>
        <p className="text-white/90 text-sm mb-4">Try these conversation starters:</p>
        <div className="space-y-2">
          <div className="bg-white/20 rounded-lg p-3 text-sm">
            "I'm not sure what to do next for internships."
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-sm">
            "There's a job fair—should I go?"
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-sm">
            "I don't know what to say in an informational interview."
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 animate-fadeIn">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Your Progress</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalConversations}</div>
            <div className="text-xs text-gray-600">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.goalsSet}</div>
            <div className="text-xs text-gray-600">Goals Set</div>
          </div>
        </div>
      </div>
    </div>
  );
}
