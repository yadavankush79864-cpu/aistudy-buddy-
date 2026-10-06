import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  Award, 
  ChevronRight,
  Info,
  Clock,
  BookOpen,
  FileText,
  AlertTriangle,
  History,
  TrendingUp,
  Target,
  Loader2,
  Check,
  ListChecks,
  Plus,
  X
} from 'lucide-react';
import { QuizQuestion, StudyMaterial, QuizAttempt } from '../../types';

interface QuizViewProps {
  sampleQuestions: QuizQuestion[];
  materials?: StudyMaterial[];
  quizAttempts?: QuizAttempt[];
  onQuizCompleted?: (attempt: QuizAttempt) => void;
  onNavigateToTutor?: (topic?: string) => void;
  onNavigateToRevision?: (topic?: string) => void;
  targetTopic?: string | null;
  onClearTargetTopic?: () => void;
}

const SYLLABUS_SUBJECTS = [
  {
    name: 'Machine Learning',
    topics: [
      'Unit 3: KNN & Distance Metrics',
      'Unit 1: Supervised vs Unsupervised Learning',
      'Unit 2: Linear & Logistic Regression',
      'Unit 4: Decision Trees & Random Forest',
      'Unit 5: Neural Networks & Backpropagation',
    ],
  },
  {
    name: 'Operating Systems',
    topics: [
      'Unit 2: CPU Scheduling & Banker’s Algorithm',
      'Unit 1: Process Synchronization & Semaphores',
      'Unit 3: Virtual Memory & Page Replacement',
      'Unit 4: File Systems & Disk Scheduling',
      'Unit 5: Deadlock Detection & Recovery',
    ],
  },
  {
    name: 'Java Programming & OOP',
    topics: [
      'Unit 1: Inheritance, Polymorphism & Super keyword',
      'Unit 2: Abstract Classes & Interfaces',
      'Unit 3: Exception Handling (try-catch-finally)',
      'Unit 4: Multithreading & Synchronization',
      'Unit 5: Collections Framework & Generics',
    ],
  },
  {
    name: 'Database Management Systems',
    topics: [
      'Unit 3: Normalization (1NF, 2NF, 3NF, BCNF)',
      'Unit 1: Relational Algebra & ER Modeling',
      'Unit 2: Advanced SQL & Joins',
      'Unit 4: Transactions & ACID Properties',
      'Unit 5: Concurrency Control & 2PL',
    ],
  },
  {
    name: 'Software Engineering',
    topics: [
      'Unit 1: SDLC Models (Waterfall, Agile Scrum)',
      'Unit 2: Requirement Engineering & SRS',
      'Unit 3: Software Architecture & Design Patterns',
      'Unit 4: Software Testing (Black Box vs White Box)',
      'Unit 5: Software Maintenance & Metrics',
    ],
  },
];

export const QuizView: React.FC<QuizViewProps> = ({ 
  sampleQuestions,
  materials = [],
  quizAttempts = [],
  onQuizCompleted,
  onNavigateToTutor,
  onNavigateToRevision,
  targetTopic = null,
  onClearTargetTopic,
}) => {
  // Navigation View within Quiz Module: 'setup' | 'active' | 'result' | 'history'
  const [viewState, setViewState] = useState<'setup' | 'active' | 'result' | 'history'>('setup');

  // Setup Form State
  const [subject, setSubject] = useState<string>('Machine Learning');
  const [topic, setTopic] = useState<string>('Unit 3: KNN & Distance Metrics');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [fromMaterial, setFromMaterial] = useState<boolean>(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');

  // AI Loading & Error State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Active Quiz State
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>('Machine Learning Drill');
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>(sampleQuestions.slice(0, 5));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Results State
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  // Local History List (synced with props + new submissions)
  const [attemptsList, setAttemptsList] = useState<QuizAttempt[]>(quizAttempts);

  // Sync quiz attempts when prop updates
  useEffect(() => {
    if (quizAttempts && quizAttempts.length > 0) {
      setAttemptsList(quizAttempts);
    }
  }, [quizAttempts]);

  // Sync materials when prop updates
  useEffect(() => {
    if (materials.length > 0 && (!selectedMaterialId || !materials.some(m => m.id === selectedMaterialId))) {
      setSelectedMaterialId(materials[0].id);
    }
  }, [materials, selectedMaterialId]);

  // Sync incoming practice target topic (from Weak Topics or Progress)
  useEffect(() => {
    if (targetTopic) {
      setCustomTopic(targetTopic);
      // match subject if keyword found
      const lower = targetTopic.toLowerCase();
      if (lower.includes('java') || lower.includes('oop') || lower.includes('exception') || lower.includes('inheritance')) {
        setSubject('Java Programming & OOP');
      } else if (lower.includes('deadlock') || lower.includes('banker') || lower.includes('cpu') || lower.includes('semaphore') || lower.includes('operating')) {
        setSubject('Operating Systems');
      } else if (lower.includes('bcnf') || lower.includes('normal') || lower.includes('sql') || lower.includes('dbms') || lower.includes('database')) {
        setSubject('Database Management Systems');
      } else if (lower.includes('knn') || lower.includes('dimension') || lower.includes('learning') || lower.includes('regression')) {
        setSubject('Machine Learning');
      }
      setViewState('setup');
    }
  }, [targetTopic]);

  const currentSubjectObj = SYLLABUS_SUBJECTS.find(s => s.name === subject) || SYLLABUS_SUBJECTS[0];

  // Subject change updates default topics
  const handleSubjectChange = (newSub: string) => {
    setSubject(newSub);
    const subObj = SYLLABUS_SUBJECTS.find(s => s.name === newSub);
    if (subObj && subObj.topics.length > 0) {
      setTopic(subObj.topics[0]);
    }
  };

  // 1. Generate Quiz (AI or from Study Material)
  const handleGenerateQuiz = async (overrideTopic?: string) => {
    setIsGenerating(true);
    setGenerateError(null);

    const targetTopic = overrideTopic || customTopic.trim() || topic;
    const chosenMaterial = materials.find(m => m.id === selectedMaterialId);

    try {
      const payload: any = {
        subject,
        topic: targetTopic,
        difficulty,
        questionCount,
        fromMaterial: fromMaterial && Boolean(chosenMaterial),
        studyMaterialContext: fromMaterial && chosenMaterial ? (chosenMaterial.content || chosenMaterial.summary || '') : '',
        studyMaterialName: fromMaterial && chosenMaterial ? chosenMaterial.title : '',
      };

      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('No questions received from server.');
      }

      setCurrentQuestions(data.questions);
      setActiveQuizTitle(`${subject}: ${targetTopic}`);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setViewState('active');
    } catch (err: any) {
      console.warn('AI quiz generation notice, loading calibrated syllabus drill:', err?.message);
      // Fallback seamlessly to calibrated sample questions
      const matchingQuestions = sampleQuestions.filter(
        q => q.topic.toLowerCase().includes(subject.toLowerCase()) || subject.toLowerCase().includes(q.topic.toLowerCase())
      );
      const fallbackList = matchingQuestions.length >= 3 ? matchingQuestions : sampleQuestions;
      setCurrentQuestions(fallbackList.slice(0, questionCount));
      setActiveQuizTitle(`${subject}: ${targetTopic} (Practice Drill)`);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setViewState('active');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Answering Questions (Change answer freely before submission)
  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // 3. Submit Quiz & Calculate Diagnostics
  const handleSubmitQuiz = () => {
    setShowSubmitModal(false);

    let correctCount = 0;
    const weakTopicsSet = new Set<string>();

    currentQuestions.forEach((q, idx) => {
      const studentAns = userAnswers[idx];
      if (studentAns === q.correctAnswerIndex) {
        correctCount++;
      } else {
        weakTopicsSet.add(q.topic || topic);
      }
    });

    const total = currentQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const weakTopicsArray = Array.from(weakTopicsSet);

    const newAttempt: QuizAttempt = {
      id: 'att-' + Date.now(),
      subject,
      topic: customTopic.trim() || topic,
      difficulty,
      questionCount: total,
      score: correctCount,
      totalQuestions: total,
      percentage,
      date: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: 'Just now',
      weakTopics: weakTopicsArray,
      questions: currentQuestions,
      userAnswers: { ...userAnswers },
      isDemo: false,
    };

    setLastAttempt(newAttempt);
    setAttemptsList(prev => [newAttempt, ...prev]);

    if (onQuizCompleted) {
      onQuizCompleted(newAttempt);
    }

    setViewState('result');
  };

  // 4. Retake Quiz Action
  const handleRetakeQuiz = (attempt?: QuizAttempt) => {
    const target = attempt || lastAttempt;
    if (target) {
      setCurrentQuestions(target.questions);
      setActiveQuizTitle(`${target.subject}: ${target.topic}`);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setViewState('active');
    }
  };

  // 5. Practice Weak Topics Action
  const handlePracticeWeakTopics = (weakList?: string[]) => {
    const topicsToPractice = weakList || (lastAttempt ? lastAttempt.weakTopics : []);
    const targetTopic = topicsToPractice.length > 0 
      ? topicsToPractice.join(' & ') 
      : 'Targeted Remedial Practice';
    
    setQuestionCount(5);
    setDifficulty('Medium');
    handleGenerateQuiz(targetTopic);
  };

  // Performance message helper
  const getPerformanceFeedback = (percentage: number) => {
    if (percentage >= 90) {
      return {
        rating: 'Outstanding Mastery! 🌟',
        desc: 'You have solid grasp of this unit. Expected to score A+ in university exams.',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (percentage >= 75) {
      return {
        rating: 'Strong Performance! 👍',
        desc: 'Good conceptual foundation. Revise identified weak topics to aim for 100%.',
        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }
    if (percentage >= 50) {
      return {
        rating: 'Average — Needs Revision ⚠️',
        desc: 'You answered several key questions incorrectly. Use Quick Revision before retesting.',
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      rating: 'Critical Attention Required ❗',
      desc: 'Score is below 50%. Review study material notes and take practice drills.',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  };

  const answeredCount = Object.keys(userAnswers).length;
  const activeQuestion = currentQuestions[currentQuestionIndex] || currentQuestions[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Assessment &amp; Practice Drills</span>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
              MCQ Engine
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-generated questions calibrated to university exams. Test, diagnose weak topics, and retest.
          </p>
        </div>

        {/* Tab Switcher: Create vs History */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewState('setup')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border ${
              viewState === 'setup' || viewState === 'active' || viewState === 'result'
                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Drill</span>
          </button>

          <button
            onClick={() => setViewState('history')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border ${
              viewState === 'history'
                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5 text-orange-500" />
            <span>Quiz History</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
              {attemptsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SETUP & CONFIGURATION (Phase 3 Requirement) */}
      {viewState === 'setup' && (
        <div className="grid md:grid-cols-12 gap-6 items-start">
          
          {/* Setup Form (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-900" />
                <span>Configure AI Practice Quiz</span>
              </h2>
              <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                Semester Pattern
              </span>
            </div>

            {/* Targeted Weak-Topic Alert Banner if arriving from Diagnostics */}
            {customTopic && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-600 shrink-0" />
                  <div>
                    <span className="font-bold text-orange-950">Targeted Practice: </span>
                    <span className="text-orange-900">{customTopic}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCustomTopic('');
                    if (onClearTargetTopic) onClearTargetTopic();
                  }}
                  className="p-1 hover:bg-orange-100 rounded text-orange-700 transition-colors"
                  title="Clear targeted topic"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                1. Select Subject
              </label>
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              >
                {SYLLABUS_SUBJECTS.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Topic / Unit Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                2. Select Unit &amp; Topic
              </label>
              <select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setCustomTopic('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              >
                {currentSubjectObj.topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or type a specific sub-topic (e.g., Banker's Algorithm Safety Test)..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Question Count (5, 10, 15, 20) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  3. Number of Questions
                </label>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  {questionCount} MCQs
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      questionCount === num
                        ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level (Easy, Medium, Hard) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                4. Select Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Easy', label: 'Easy', sub: 'Foundations' },
                  { id: 'Medium', label: 'Medium', sub: 'Internal Tests' },
                  { id: 'Hard', label: 'Hard', sub: 'University / GATE' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id as any)}
                    className={`p-2.5 text-center rounded-xl border transition-all ${
                      difficulty === item.id
                        ? 'bg-blue-50/80 border-blue-600 text-blue-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* "Generate from My Study Material" Checkbox (Phase 3 Requirement) */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fromMaterial}
                  onChange={(e) => setFromMaterial(e.target.checked)}
                  className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-800" />
                  <span>Generate from My Study Material</span>
                </span>
              </label>

              {fromMaterial && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-slate-600 block">
                    Choose uploaded material to ground questions in:
                  </span>
                  {materials.length === 0 ? (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                      No materials found. Upload notes in "My Study Material" first.
                    </p>
                  ) : (
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title} ({m.subject} · {m.unit || 'Notes'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Generate Action Button */}
            <button
              onClick={() => handleGenerateQuiz()}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 hover:from-blue-950 hover:to-indigo-950 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm border border-blue-900 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                  <span>Generating {questionCount} University MCQs with Sathi AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Generate &amp; Start Practice Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Right: Practice Info & Recent Performance (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Exam Pattern Info Box */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-500" />
                <span>College Exam MCQ Calibration</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Questions are generated according to standard internal assessment and university paper patterns.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Answers stay hidden during the test to simulate real exams.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Detailed step-by-step solutions provided upon submission.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Weak topics are automatically flagged for targeted retesting.</span>
                </li>
              </ul>
            </div>

            {/* Quick Retake from History Banner */}
            {attemptsList.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    Latest Drill Attempt
                  </h3>
                  {attemptsList[0].isDemo ? (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                      Demo
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                      Recent
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">
                    {attemptsList[0].subject}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {attemptsList[0].topic} · {attemptsList[0].date}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold font-mono text-emerald-700">
                      Score: {attemptsList[0].score}/{attemptsList[0].totalQuestions} ({attemptsList[0].percentage}%)
                    </span>
                    <button
                      onClick={() => handleRetakeQuiz(attemptsList[0])}
                      className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retake</span>
                    </button>
                  </div>
                </div>

                {attemptsList[0].weakTopics && attemptsList[0].weakTopics.length > 0 && (
                  <button
                    onClick={() => handlePracticeWeakTopics(attemptsList[0].weakTopics)}
                    className="w-full py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5 text-orange-600" />
                    <span>Practice Weak Topics ({attemptsList[0].weakTopics.length})</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE QUIZ INTERFACE (Phase 3 Requirement) */}
      {viewState === 'active' && activeQuestion && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
          
          {/* Active Quiz Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-mono">
                  {difficulty} Difficulty
                </span>
                {fromMaterial && (
                  <span className="text-[10px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <FileText className="w-3 h-3 text-purple-600" />
                    <span>From Study Material</span>
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">
                  {activeQuestion.topic || subject}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-1">
                {activeQuizTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                Answered: <strong className="text-blue-900">{answeredCount}/{currentQuestions.length}</strong>
              </span>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                Submit Quiz
              </button>
            </div>
          </div>

          {/* Progress Indicator Bar */}
          <div className="w-full bg-slate-100 h-1.5">
            <div 
              className="bg-blue-900 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Nav Pills */}
          <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {currentQuestions.map((_, idx) => {
              const isAnswered = userAnswers[idx] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center shrink-0 border ${
                    isCurrent
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs ring-2 ring-blue-900/30'
                      : isAnswered
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                Q {currentQuestionIndex + 1} of {currentQuestions.length}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug flex-1">
                {activeQuestion.question}
              </h3>
            </div>

            {/* 4 Options (A, B, C, D) - Student can change answer freely before submission */}
            <div className="space-y-2.5 pt-2">
              {activeQuestion.options.map((opt, oIdx) => {
                const isSelected = userAnswers[currentQuestionIndex] === oIdx;
                const letter = String.fromCharCode(65 + oIdx);

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 text-blue-950 font-medium shadow-2xs ring-1 ring-blue-600/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-xs leading-relaxed pt-0.5">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Quiz Footer Controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 rounded-xl text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {currentQuestionIndex < currentQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(currentQuestions.length - 1, prev + 1))}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit Confirmation Modal */}
          {showSubmitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5 text-blue-900">
                  <ListChecks className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Submit Practice Drill?
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  You have answered <strong>{answeredCount} of {currentQuestions.length}</strong> questions.
                  {answeredCount < currentQuestions.length && (
                    <span className="text-amber-700 block mt-1 font-semibold">
                      ⚠️ You have {currentQuestions.length - answeredCount} unanswered question(s).
                    </span>
                  )}
                </p>

                <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold shadow-2xs"
                  >
                    Confirm &amp; See Score
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 3: QUIZ RESULT & DETAILED ANSWER REVIEW (Phase 3 Requirement) */}
      {viewState === 'result' && lastAttempt && (
        <div className="space-y-6">
          
          {/* Result Score Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Assessment Results
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {lastAttempt.subject} — {lastAttempt.topic}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Completed {lastAttempt.date} · Difficulty: {lastAttempt.difficulty}
                </p>
              </div>

              {/* Score Display (e.g. 8 / 10 Correct — 80%) */}
              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                  {lastAttempt.score} / {lastAttempt.totalQuestions} Correct
                </div>
                <div className="text-sm font-bold text-blue-900 font-mono">
                  {lastAttempt.percentage}% Score
                </div>
              </div>
            </div>

            {/* Performance Feedback Banner */}
            {(() => {
              const fb = getPerformanceFeedback(lastAttempt.percentage);
              return (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${fb.badgeColor}`}>
                  <Award className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{fb.rating}</h4>
                    <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{fb.desc}</p>
                  </div>
                </div>
              );
            })()}

            {/* Identified Weak Topics & Remedial Practice Action (Phase 3 Requirement) */}
            {lastAttempt.weakTopics && lastAttempt.weakTopics.length > 0 ? (
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="text-xs font-bold text-orange-950">
                      Identified Weak Topics ({lastAttempt.weakTopics.length}):
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                    Requires Revision
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {lastAttempt.weakTopics.map((wt, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-orange-200 text-orange-900 rounded-lg text-xs font-semibold"
                    >
                      {wt}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handlePracticeWeakTopics()}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Practice Weak Topics (5-Q Drill)</span>
                  </button>

                  {onNavigateToTutor && (
                    <button
                      onClick={() => onNavigateToTutor(lastAttempt.weakTopics[0])}
                      className="px-3.5 py-2 bg-white hover:bg-orange-50 border border-orange-200 text-orange-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>Ask AI Sathi to Explain</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero weak topics detected! Perfect score across all evaluated concepts.</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => setViewState('setup')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                ← Setup New Drill
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRetakeQuiz()}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-blue-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake This Quiz</span>
                </button>

                <button
                  onClick={() => setViewState('history')}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  View All Attempts
                </button>
              </div>
            </div>
          </div>

          {/* Question-by-Question Detailed Answer Review (Phase 3 Requirement) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-blue-900" />
              <span>Question-by-Question Solution Review</span>
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {lastAttempt.questions.map((q, idx) => {
                const studentAns = lastAttempt.userAnswers[idx];
                const isCorrect = studentAns === q.correctAnswerIndex;
                const wasAttempted = studentAns !== undefined;

                return (
                  <div key={idx} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                          isCorrect 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {q.question}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Topic: {q.topic}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isStudentChoice = studentAns === oIdx;
                        const isActualCorrect = q.correctAnswerIndex === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                              isActualCorrect
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                                : isStudentChoice && !isCorrect
                                ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-mono font-bold shrink-0">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isActualCorrect && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded shrink-0">
                                Correct Answer
                              </span>
                            )}
                            {isStudentChoice && !isCorrect && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1 rounded shrink-0">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {q.explanation && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <strong className="text-blue-900 block font-semibold mb-0.5">
                          Solution Explanation:
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 4: QUIZ HISTORY (Phase 3 Requirement) */}
      {viewState === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Previous Quiz Attempts &amp; Diagnostic Records
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review past scores, retake drills, or practice identified weak topics.
              </p>
            </div>
            <button
              onClick={() => setViewState('setup')}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Drill</span>
            </button>
          </div>

          {attemptsList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">No quiz attempts recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-2">
              {attemptsList.map((att) => (
                <div key={att.id} className="pt-3.5 first:pt-0 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {att.subject}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {att.topic}
                      </span>
                      {att.isDemo && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          Demo
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>{att.date}</span>
                      <span>·</span>
                      <span>Difficulty: {att.difficulty}</span>
                      <span>·</span>
                      <span>{att.totalQuestions} Questions</span>
                    </div>

                    {att.weakTopics && att.weakTopics.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                          Weak: {att.weakTopics.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-slate-900">
                        {att.score}/{att.totalQuestions}
                      </div>
                      <div className={`text-[11px] font-bold font-mono ${
                        att.percentage >= 75 ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {att.percentage}%
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setLastAttempt(att);
                          setViewState('result');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                      >
                        Review
                      </button>

                      <button
                        onClick={() => handleRetakeQuiz(att)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1"
                        title="Retake this assessment drill"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retake</span>
                      </button>

                      {att.weakTopics && att.weakTopics.length > 0 && (
                        <button
                          onClick={() => handlePracticeWeakTopics(att.weakTopics)}
                          className="px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors flex items-center gap-1"
                          title="Generate a 5-question drill targeting these weak topics"
                        >
                          <Target className="w-3 h-3" />
                          <span>Practice</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
