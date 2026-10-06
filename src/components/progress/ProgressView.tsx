import React from 'react';
import { 
  LineChart, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  ArrowUpRight, 
  BookOpen, 
  Bot, 
  HelpCircle,
  TrendingUp,
  Target,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  SubjectProgress, 
  WeakTopic, 
  ActivityItem, 
  NavigationTab,
  QuizAttempt 
} from '../../types';

interface ProgressViewProps {
  subjectProgress: SubjectProgress[];
  weakTopics: WeakTopic[];
  activities: ActivityItem[];
  quizAttempts?: QuizAttempt[];
  materialsCount?: number;
  onNavigate: (tab: NavigationTab) => void;
  onPracticeTopic?: (topic: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  subjectProgress,
  weakTopics,
  activities,
  quizAttempts = [],
  materialsCount = 4,
  onNavigate,
  onPracticeTopic,
}) => {
  // Aggregate real and demo stats
  const totalQuizzes = quizAttempts.length > 0 ? quizAttempts.length : 6;
  const totalQuestions = quizAttempts.length > 0 
    ? quizAttempts.reduce((acc, q) => acc + q.totalQuestions, 0) 
    : 35;
  const correctAnswers = quizAttempts.length > 0 
    ? quizAttempts.reduce((acc, q) => acc + q.score, 0) 
    : 29;
  const averageScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / quizAttempts.length)
    : 83;
  const bestScore = quizAttempts.length > 0
    ? Math.max(...quizAttempts.map(q => q.percentage))
    : 100;

  // Strong topics (>= 80% accuracy)
  const strongTopics = [
    { name: 'CPU Scheduling Algorithms', subject: 'Operating Systems', score: 100 },
    { name: 'KNN Distance Formulas & Metrics', subject: 'Machine Learning', score: 88 },
    { name: 'Inheritance & Super Keyword', subject: 'Java OOP', score: 85 },
    { name: 'Relational Model & Keys', subject: 'Database Systems', score: 92 },
  ];

  // Score Trend data
  const scoreTrend = quizAttempts.slice(0, 6).reverse().map((att, idx) => ({
    label: `Quiz ${idx + 1}`,
    score: att.percentage,
    subject: att.subject,
    date: att.date,
  }));

  const defaultTrend = [
    { label: 'Drill 1', score: 75, subject: 'Java OOP' },
    { label: 'Drill 2', score: 80, subject: 'Machine Learning' },
    { label: 'Drill 3', score: 60, subject: 'Java OOP' },
    { label: 'Drill 4', score: 85, subject: 'DBMS' },
    { label: 'Drill 5', score: 100, subject: 'Operating Systems' },
    { label: 'Drill 6', score: 88, subject: 'Machine Learning' },
  ];

  const activeTrend = scoreTrend.length >= 3 ? scoreTrend : defaultTrend;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Personalized Learning Diagnostics</span>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
              Academic Analytics
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor test accuracy, strong areas, and weak-topic diagnostics to prepare for semester exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('quiz')}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Take Practice Drill</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Phase 4 Requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Quizzes & Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Quizzes Attempted</span>
            <HelpCircle className="w-4 h-4 text-blue-800" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalQuizzes} Drills
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <span>Average:</span>
            <strong className="text-blue-900 font-mono font-bold">{averageScore}%</strong>
          </div>
        </div>

        {/* Metric 2: Best Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Best Score</span>
            <Award className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {bestScore}%
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Target: 90%+ in Finals</span>
          </div>
        </div>

        {/* Metric 3: Questions & Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Questions Attempted</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalQuestions} MCQs
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            <strong className="font-bold">{correctAnswers}</strong> answered correctly
          </div>
        </div>

        {/* Metric 4: Study Material Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Indexed Study Materials</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {materialsCount} Files
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Ready for AI grounding
          </div>
        </div>
      </div>

      {/* Visual Diagnostics Grid: Score Trend & Subject Performance */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Score Trend Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-900" />
                <span>Assessment Score Trend</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Accuracy progression across recent practice sessions
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Avg: {averageScore}%
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="pt-2 space-y-3">
            <div className="h-44 flex items-end justify-between gap-3 pt-4 pb-2 border-b border-slate-100">
              {activeTrend.map((item, idx) => {
                const heightPercent = Math.max(20, item.score);
                const isGreat = item.score >= 80;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.score}%
                    </span>
                    <div 
                      className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                        isGreat 
                          ? 'bg-gradient-to-t from-blue-900 to-indigo-700 hover:brightness-110' 
                          : 'bg-gradient-to-t from-amber-600 to-orange-400 hover:brightness-110'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[48px]">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Past Drill Sessions</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-blue-900 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-900" />
                  <span>≥ 80% Mastery</span>
                </span>
                <span className="flex items-center gap-1 text-orange-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                  <span>&lt; 80% Needs Work</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Subject Performance Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-blue-900" />
              <span>Subject Performance</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              4 Subjects
            </span>
          </div>

          <div className="space-y-3.5">
            {subjectProgress.map((sub) => (
              <div key={sub.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {sub.subject}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {sub.averageScore}% avg
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sub.averageScore}%`,
                      backgroundColor: sub.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{sub.quizzesTaken} tests taken</span>
                  <span>{sub.progressPercent}% syllabus finished</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Two Column Diagnostic: Strong vs Weak Topics (Phase 4 Requirement) */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Strong Topics */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strong Topics (High Accuracy)</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Exam Ready
            </span>
          </div>

          <div className="space-y-2.5">
            {strongTopics.map((st, i) => (
              <div
                key={i}
                className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-emerald-950">{st.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{st.subject}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {st.score}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">accuracy</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>Identified Weak Topics (Needs Work)</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Action Required
            </span>
          </div>

          <div className="space-y-2.5">
            {weakTopics.map((wt) => (
              <div
                key={wt.id}
                className="p-3.5 bg-orange-50/50 border border-orange-200/80 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-orange-950">{wt.topic}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{wt.subject}</span>
                  </div>
                  <span className="font-mono font-bold text-orange-700 text-xs shrink-0">
                    {wt.accuracyRate}% Accuracy
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-orange-100">
                  {wt.recommendation}
                </p>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={() => {
                      if (onPracticeTopic) {
                        onPracticeTopic(wt.topic);
                      } else {
                        onNavigate('quiz');
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Target className="w-3 h-3" />
                    <span>Practice Drill</span>
                  </button>

                  <button
                    onClick={() => onNavigate('exam-prep')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    Quick Revision
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Activity Log (Phase 4 Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Recent Assessment &amp; Revision Log
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Timestamped Activity
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.slice(0, 6).map((act) => (
            <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  act.type === 'quiz' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {act.type === 'quiz' ? <HelpCircle className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-semibold text-slate-800 mr-2">{act.title}</span>
                  <span className="text-[11px] text-slate-400">{act.subject}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                {act.score !== undefined && (
                  <span className="font-bold text-emerald-700">{act.score}%</span>
                )}
                <span>{act.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
