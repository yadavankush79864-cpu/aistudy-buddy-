export type NavigationTab = 
  | 'dashboard' 
  | 'tutor' 
  | 'materials' 
  | 'quiz' 
  | 'exam-prep'
  | 'progress' 
  | 'settings';

export type ExplanationMode = 
  | 'simple' 
  | 'detailed' 
  | 'exam-ready' 
  | 'quick-revision';

export type AppLanguage = 'English' | 'Hindi';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  college: string;
  course: string;
  year: string;
  semester: string;
  preferredLanguage: AppLanguage;
  avatarUrl: string;
  // legacy compatibility
  university?: string;
  major?: string;
}

export interface ActivityItem {
  id: string;
  type: 'tutor' | 'quiz' | 'material' | 'summary' | 'exam-prep';
  title: string;
  subject: string;
  timestamp: string;
  unit?: string;
  score?: number;
  durationMinutes?: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  course?: string;
  semester?: string;
  unit?: string;
  topic?: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'notes';
  fileSize: string;
  pageCount: number;
  uploadedAt: string;
  status: 'indexed' | 'processing';
  summary?: string;
  content?: string;
  isDemo?: boolean;
}

export interface QuizConfig {
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Exam Level';
  questionCount: number;
  format: 'Multiple Choice' | 'True/False' | 'Flashcards';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  explanationMode?: ExplanationMode;
  suggestedFollowUps?: string[];
  subjectTag?: string;
  fromMaterial?: boolean;
  sourceMaterialName?: string;
}

export interface SubjectProgress {
  subject: string;
  code: string;
  progressPercent: number;
  quizzesTaken: number;
  averageScore: number;
  hoursStudied: number;
  color: string;
}

export interface WeakTopic {
  id: string;
  subject: string;
  topic: string;
  accuracyRate: number;
  recommendation: string;
}

export interface ExamPrepItem {
  id: string;
  title: string;
  type: '7-mark' | 'important-pyq' | 'viva' | 'short-notes' | 'quick-revision' | 'mcq';
  subject: string;
  unit: string;
  description: string;
  sampleQuestion: string;
  highYieldTag: string;
}

export interface QuizAttempt {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Exam Level';
  questionCount: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  timestamp: string;
  weakTopics: string[];
  questions: QuizQuestion[];
  userAnswers: Record<number, number>;
  isDemo?: boolean;
}

export interface StudyPlanDay {
  day: number;
  title: string;
  date?: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  tasks: string[];
  isCompleted?: boolean;
  type: 'study' | 'revision' | 'quiz' | 'weak-topic';
}

export interface StudyRecommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  subject: string;
  topic?: string;
  actionType: 'quiz' | 'revision' | 'material' | 'tutor';
  priority: 'high' | 'medium' | 'normal';
}

export interface SummarizedDocument {
  id: string;
  materialId: string;
  materialTitle: string;
  length: 'short' | 'medium' | 'detailed';
  shortSummary: string;
  keyPoints: string[];
  importantTerms: { term: string; meaning: string }[];
  examImportantPoints: string[];
  quickRevisionNotes: string;
  generatedAt: string;
}
