export interface Opportunity {
  id: string;
  userId: string;
  inputPrompt: string;
  title: string;
  problem: string;
  solution: string;
  targetUsers: string[];
  features: string[];
  monetization: string[];
  feasibilityScore: number;
  executionDifficulty: 'Low' | 'Medium' | 'High';
  opportunities: string[];
  risks: string[];
  skepticFeedback: string;
  isSaved: boolean;
  createdAt: string; // ISO String
}

export interface UserProfile {
  uid: string;
  email: string;
  isPremium: boolean;
  createdAt: string; // ISO String
}

export interface DailyUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  count: number;
}
