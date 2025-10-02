// lib/types.ts
export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: number };

export type StudentProfile = {
  firstGen?: boolean;
  identityNotes?: string;
  interests?: string[];
  confidence?: "low" | "medium" | "high";
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActivity: number;
};

export type UserStats = {
  totalConversations: number;
  goalsSet: number;
  lastActivity: number;
};
