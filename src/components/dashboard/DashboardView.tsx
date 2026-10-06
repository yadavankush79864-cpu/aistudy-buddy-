import React from 'react';
import { 
  Bot, 
  FileText, 
  HelpCircle, 
  LineChart, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Zap,
  BookmarkCheck,
  ChevronRight,
  Target,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { NavigationTab, UserProfile, ActivityItem, SubjectProgress, StudyRecommendation } from '../../types';

interface DashboardViewProps {
  user: UserProfile;
  onNavigate: (tab: NavigationTab) => void;
  activities: ActivityItem[];
  subjectProgress: SubjectProgress[];
  recommendations?: StudyRecommendation[];
  onActionRecommendation?: (rec: StudyRecommendation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  activities,
  subjectProgress,
  recommendations = [],
  onActionRecommendation,
}) => {
  const firstName = user.name.split(' ')[0] || 'Aarav';

  const defaultRecommendations: StudyRecommendation[] = [
    {
      id: 'rec-01',
      title: 'Revise Java Exception Handling & Take 5-Q Drill',
      description: 'Your recent Java quiz score was 60%. Questions on checked exceptions and interface hierarchies were missed.',
      reason: 'Low quiz accuracy (60%)',
      subject: 'Java Programming & OOP',
      topic: 'Exception Handling',
      actionType: 'quiz',
      priority: 'high',
    },
    {
      id: 'rec-02',
      title: 'Machine Learning: Review Curse of Dimensionality',
      description: '18 days left for End-Sem. Study how high-dimensional spaces impact KNN distances before practicals.',
      reason: 'Identified weak topic in Unit 3',
      subject: 'Machine Learning',
      topic: 'KNN & Classification',
      actionType: 'revision',
      priority: 'medium',
    },
    {
      id: 'rec-03',
      title: 'Operating Systems: Practice 7-Mark Banker’s Proof',
      description: 'Your scheduling accuracy is high (100%). Master the 7-mark state safety vector proof for maximum exam marks.',
      reason: 'Targeting A+ grade in Semester Exam',
      subject: 'Operating Systems',
      topic: 'Banker’s Algorithm',
      actionType: 'tutor',
      priority: 'normal',
    },
  ];

  const activeRecs = recommendations.length > 0 ? recommendations : defaultRecommendations;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#112347] to-[#0B1528] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden border border-blue-900/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span>{user.college || 'Delhi Technological University'} · {user.semester || 'Semester 5'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Namaste, {firstName} 👋</span>
          </h1>

          <p className="text-sm text-slate-300 font-medium">
            Ready to continue your learning?
          </p>

          <p className="text-xs text-slate-300/90 leading-relaxed max-w-2xl">
            You're revising for your upcoming semester examinations. <strong>Machine Learning (CS-501)</strong> has an exam in 18 days, and your <strong>Java OOP</strong> syllabus revision is 92% complete.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs border border-white/10">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Study Streak: <strong className="text-white font-mono">12 Days 🔥</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs border border-white/10">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>This Week: <strong className="text-white font-mono">28.5 hrs</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Quiz Accuracy: <strong className="text-white font-mono">89%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Dashboard Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            What would you like to study?
          </h2>
          <span className="text-xs text-slate-400 font-medium">Choose a study mode</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Ask AI Sathi */}
          <button
            onClick={() => onNavigate('tutor')}
            className="group text-left p-4.5 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200/90 hover:border-blue-400 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors flex items-center justify-between">
                <span>1. Ask AI Sathi</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-900" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                Ask doubts, understand tricky units in simple English or Hindi.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-semibold text-blue-800">
              Ask doubts →
            </span>
          </button>

          {/* Card 2: My Study Material */}
          <button
            onClick={() => onNavigate('materials')}
            className="group text-left p-4.5 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200/90 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 transition-colors flex items-center justify-between">
                <span>2. My Study Material</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-900" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                Unit-wise semester notes, slides, and syllabus documents.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-semibold text-indigo-800">
              5 Unit Files →
            </span>
          </button>

          {/* Card 3: Practice Quiz */}
          <button
            onClick={() => onNavigate('quiz')}
            className="group text-left p-4.5 bg-white hover:bg-purple-50/50 rounded-2xl border border-slate-200/90 hover:border-purple-400 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-900 transition-colors flex items-center justify-between">
                <span>3. Practice Quiz</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-900" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                Unit-level MCQs, internal drill assessments, and viva questions.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-semibold text-purple-800">
              Take MCQ drill →
            </span>
          </button>

          {/* Card 4: Quick Revision */}
          <button
            onClick={() => onNavigate('exam-prep')}
            className="group text-left p-4.5 bg-white hover:bg-orange-50/50 rounded-2xl border border-slate-200/90 hover:border-orange-400 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-orange-900 transition-colors flex items-center justify-between">
                <span>4. Quick Revision</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-900" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                7-mark answer templates, cheat sheets, and university PYQs.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-semibold text-orange-700">
              7-Mark Models →
            </span>
          </button>

          {/* Card 5: My Progress */}
          <button
            onClick={() => onNavigate('progress')}
            className="col-span-2 lg:col-span-1 group text-left p-4.5 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/90 hover:border-sky-400 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <LineChart className="w-5 h-5 text-sky-700" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-sky-900 transition-colors flex items-center justify-between">
                <span>5. My Progress</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-900" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                Syllabus coverage, weak areas, and score trajectories.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-semibold text-sky-800">
              View Analytics →
            </span>
          </button>
        </div>
      </div>

      {/* Continue Learning Spotlight */}
      <div className="bg-white rounded-2xl border border-blue-200/90 p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  Continue Learning
                </span>
                <span className="text-xs text-slate-400">Unit 3 · Machine Learning</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                K-Nearest Neighbors (KNN): Distance Formulas &amp; Curse of Dimensionality
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Last reviewed: 25 mins ago · Practice 7-mark question or start quick Socratic review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onNavigate('tutor')}
              className="flex-1 md:flex-none px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>Ask AI Sathi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('exam-prep')}
              className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
            >
              7-Mark Answer
            </button>
          </div>
        </div>
      </div>

      {/* PHASE 5: Recommended for You Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Recommended for You (AI Diagnostics)</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            Based on test accuracy &amp; weak topics
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-3.5">
          {activeRecs.map((rec) => {
            const isHigh = rec.priority === 'high';
            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                      {rec.subject}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      isHigh
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {rec.reason}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {rec.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400">
                    {rec.actionType === 'quiz' ? 'Assessment Drill' : rec.actionType === 'revision' ? 'Quick Notes' : 'AI Explanation'}
                  </span>
                  
                  <button
                    onClick={() => {
                      if (onActionRecommendation) {
                        onActionRecommendation(rec);
                      } else if (rec.actionType === 'quiz') {
                        onNavigate('quiz');
                      } else if (rec.actionType === 'revision') {
                        onNavigate('exam-prep');
                      } else {
                        onNavigate('tutor');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                      isHigh
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-blue-900 hover:bg-blue-950 text-white'
                    }`}
                  >
                    <span>{rec.actionType === 'quiz' ? 'Attempt Drill →' : rec.actionType === 'revision' ? 'Revise Topic →' : 'Ask Sathi →'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Course Syllabus Mastery & Recent Activity */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left: Course Syllabus Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Semester Syllabus Mastery
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unit-wise syllabus coverage for {user.course || 'B.Tech CSE'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('progress')}
                className="text-xs text-blue-800 hover:text-blue-950 font-bold hover:underline"
              >
                Full Syllabus Report
              </button>
            </div>

            <div className="divide-y divide-slate-100 pt-1">
              {subjectProgress.map((item) => (
                <div key={item.code} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 mr-2">
                        {item.code}
                      </span>
                      <span className="text-slate-600 font-medium">{item.subject}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="text-[11px] text-slate-400">
                        {item.quizzesTaken} drills completed
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {item.progressPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Sathi gradient touch */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.progressPercent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Study hours: <strong className="text-slate-600 font-medium">{item.hoursStudied}h</strong></span>
                    <span>Average accuracy: <strong className="text-slate-700 font-mono font-bold">{item.averageScore}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Activity
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Last 48 Hours
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                    act.type === 'quiz'
                      ? 'bg-purple-50 text-purple-700'
                      : act.type === 'exam-prep'
                      ? 'bg-orange-50 text-orange-700'
                      : act.type === 'tutor'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {act.type === 'quiz' && <HelpCircle className="w-3.5 h-3.5" />}
                    {act.type === 'exam-prep' && <Award className="w-3.5 h-3.5" />}
                    {act.type === 'tutor' && <Bot className="w-3.5 h-3.5" />}
                    {act.type === 'material' && <FileText className="w-3.5 h-3.5" />}
                    {act.type === 'summary' && <BookmarkCheck className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-snug truncate">
                      {act.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{act.subject}</span>
                      {act.unit && (
                        <>
                          <span>·</span>
                          <span className="font-medium text-slate-500">{act.unit}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{act.timestamp}</span>
                      {act.score !== undefined && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-emerald-700 font-bold">
                            Score: {act.score}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigate('progress')}
                className="w-full py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-center"
              >
                View Complete Activity Log
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
