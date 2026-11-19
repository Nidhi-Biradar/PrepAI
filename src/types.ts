export type DifficultyLevel = "Junior" | "Mid" | "Senior";
export type RoundType = "Behavioral" | "Core Technical" | "System Design" | "Coding Problem";

export interface Message {
  id: string;
  sender: "user" | "interviewer" | "system";
  text: string;
  audioUrl?: string; // Base64 audio string or URL
  tips?: string; // Real-time coach tip for this message
  createdAt: string;
}

export interface FormalQAPair {
  question: string;
  userAnswer: string;
  formalAnswer: string;
  improvementExplanation: string;
}

export interface CategoryScore {
  name: string;
  score: number;
}

export interface FeedbackReport {
  overallScore: number;
  categories: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  commonPitfalls: string[];
  specificImprovements: string[];
  resumeImprovements: string[];
  communicationImprovements: string[];
  formalAnswers: FormalQAPair[];
}

export interface InterviewSession {
  id: string;
  role: string;
  difficulty: DifficultyLevel;
  roundType: RoundType;
  status: "active" | "completed";
  messages: Message[];
  currentQuestionIndex: number;
  createdAt: string;
  feedback: FeedbackReport | null;
}

export interface ResumeProfile {
  name: string;
  email: string;
  skills: string[];
  keyExperiences: string[];
  identifiedGaps: string[];
  recommendations: string[];
  lastUpdated: string;
  overallMatchScore?: number;
  gapsSummary?: string;
  improvementsSummary?: string;
  adviceSummary?: string;
  rawText?: string;
  fileName?: string;
}

export interface StudySubtask {
  id: string;
  title: string;
  done: boolean;
  explanation?: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  description: string;
  timeline: string;
  resources: string[];
  subtasks: StudySubtask[];
  completed: boolean;
  simpleSummary?: string;
}

export interface PersonalizedRoadmap {
  id: string;
  role: string;
  targetDifficulty: DifficultyLevel;
  topics: StudyTopic[];
  createdAt: string;
  levelNote?: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  language: string;
  initialCode: string;
  solutionTemplate: string;
  testCases: { input: string; output: string }[];
  currentCode: string;
  submissionFeedback?: {
    success: boolean;
    explanation: string;
    suggestions: string[];
  } | null;
}

export interface OptimizedSkillGroup {
  category: string;
  skills: string[];
}

export interface OptimizedExperience {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface OptimizedEducation {
  degree: string;
  school: string;
  year: string;
  details?: string;
}

export interface OptimizedProject {
  title: string;
  tools: string[];
  bullets: string[];
}

export interface OptimizedResume {
  candidateName: string;
  headline: string;
  contactInfo: string;
  summary: string;
  skillsGrouped: OptimizedSkillGroup[];
  experience: OptimizedExperience[];
  education: OptimizedEducation[];
  projects: OptimizedProject[];
  improvementsMade: string[];
  optimizedText: string;
  lastUpdated: string;
  templateStyle?: "modern" | "minimal" | "executive";
}

export interface RoleGapItem {
  id: string;
  skillOrRequirement: string;
  category: "Technical Stack" | "System Architecture" | "Domain Experience" | "Projects & Evidence";
  severity: "critical" | "recommended" | "nice-to-have";
  whyNeededForRole: string;
  howToBridge: string;
}

export interface RoleChecklistItem {
  id: string;
  task: string;
  category: string;
  importance: "high" | "medium" | "low";
  done: boolean;
  advice: string;
}

export interface RoleCorrectionItem {
  id: string;
  currentFlawOrGap: string;
  roleTargetContext: string;
  recommendedCorrection: string;
  actionableStep: string;
}

export interface RoleGapReport {
  id: string;
  targetRole: string;
  experienceLevel?: DifficultyLevel;
  roleMatchScore: number;
  matchSummary: string;
  matchedSkills: string[];
  missingRoleGaps: RoleGapItem[];
  roleChecklist: RoleChecklistItem[];
  roleCorrections: RoleCorrectionItem[];
  strengthsForRole: string[];
  analyzedAt: string;
}

export interface HistoryItem {
  id: string;
  type: "upload" | "resume" | "roadmap" | "optimized" | "role_gap";
  title: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  timestamp: string;
  snippet?: string;
  targetRole?: string;
  resumeData?: ResumeProfile;
  roadmapData?: PersonalizedRoadmap;
  optimizedData?: OptimizedResume;
  roleGapData?: RoleGapReport;
  rawText?: string;
  skillsCount?: number;
  matchScore?: number;
}


