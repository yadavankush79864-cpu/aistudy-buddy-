import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  ChevronRight, 
  BookmarkCheck, 
  AlertCircle,
  Calendar,
  Clock,
  ListChecks,
  Printer,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { NavigationTab, ExamPrepItem, StudyMaterial, AppLanguage, StudyPlanDay } from '../../types';
import { INITIAL_EXAM_PREP_ITEMS, INITIAL_STUDY_PLAN_DAYS } from '../../data/mockData';

interface ExamPrepHubViewProps {
  onNavigate: (tab: NavigationTab) => void;
  materials?: StudyMaterial[];
  currentLanguage?: AppLanguage;
  initialPlan?: StudyPlanDay[];
}

export const ExamPrepHubView: React.FC<ExamPrepHubViewProps> = ({ 
  onNavigate,
  materials = [],
  currentLanguage = 'English',
  initialPlan = INITIAL_STUDY_PLAN_DAYS,
}) => {
  // Main Sub-Tab: 'revision' | 'planner' | 'questions' | 'pyqs'
  const [activeTab, setActiveTab] = useState<'revision' | 'planner' | 'questions' | 'pyqs'>('revision');

  // Copy notice
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyText = (sectionKey: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // ==========================================
  // PHASE 6: QUICK REVISION STATE & HANDLERS
  // ==========================================
  const [revSubject, setRevSubject] = useState<string>('Machine Learning');
  const [revTopic, setRevTopic] = useState<string>('Unit 3: KNN & Classification');
  const [revLanguage, setRevLanguage] = useState<AppLanguage>(currentLanguage);
  const [revSelectedMaterialId, setRevSelectedMaterialId] = useState<string>(materials[0]?.id || '');
  const [revIsLoading, setRevIsLoading] = useState<boolean>(false);
  const [revError, setRevError] = useState<string | null>(null);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});

  const [revisionData, setRevisionData] = useState<{
    keyConcepts: string[];
    importantDefinitions: { term: string; definition: string }[];
    importantFormulas: string[];
    importantPoints: string[];
    commonMistakes: string[];
    revisionQuestions: { q: string; a: string }[];
  }>({
    keyConcepts: [
      'KNN is an instance-based lazy learner that delays model computation until inference time.',
      'Distance metrics evaluate proximity: Euclidean (continuous), Manhattan (grid-like), Minkowski (generalized).',
      'Feature normalization is mandatory to prevent large numeric scales from dominating the distance.',
    ],
    importantDefinitions: [
      { term: 'K-Nearest Neighbors', definition: 'A non-parametric supervised algorithm that assigns the majority class of the K nearest data points in feature space.' },
      { term: 'Curse of Dimensionality', definition: 'The phenomenon where high-dimensional feature spaces cause data points to become equidistant, degrading distance-based neighborhood comparisons.' },
    ],
    importantFormulas: [
      'Euclidean Distance: d(p,q) = √[ ∑ (q_i - p_i)² ]',
      'Manhattan Distance: d(p,q) = ∑ |p_i - q_i|',
      'Min-Max Normalization: x_norm = (x - x_min) / (x_max - x_min)',
    ],
    importantPoints: [
      'Choose odd values of K in binary classification to eliminate vote ties.',
      'Small K leads to low bias but high variance (overfitting to noisy outliers).',
      'Large K leads to smooth decision boundaries but risks high bias (underfitting).',
      'Time complexity is O(n * d) per query; space complexity is O(n * d).',
    ],
    commonMistakes: [
      'Forgetting feature normalization before computing distance matrices.',
      'Confusing parametric linear classifiers with non-parametric instance-based classifiers.',
    ],
    revisionQuestions: [
      { q: 'Why is KNN called a Lazy Learner in university exams?', a: 'Because it performs no explicit training phase; it stores the training set and computes everything at query time.' },
      { q: 'What happens when K=1?', a: 'The model becomes extremely sensitive to noise and outliers, causing high variance and complex jagged decision boundaries.' },
      { q: 'How do you handle distance ties?', a: 'By distance-weighting the inverse of distances (1/d) or picking an odd value of K.' },
      { q: 'Which distance metric is best for high-dimensional sparse text?', a: 'Cosine similarity or Manhattan distance rather than standard Euclidean distance.' },
      { q: 'State 2 disadvantages of KNN.', a: 'High memory usage O(n*d) and slow query inference speed when the dataset is large.' },
    ]
  });

  const handleGenerateRevision = async () => {
    setRevIsLoading(true);
    setRevError(null);
    const chosenMat = materials.find(m => m.id === revSelectedMaterialId);

    try {
      const res = await fetch('/api/revision/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: revSubject,
          topic: revTopic,
          language: revLanguage,
          studyMaterialContext: chosenMat ? (chosenMat.content || chosenMat.summary || '') : '',
          studyMaterialName: chosenMat ? chosenMat.title : '',
        }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data && data.keyConcepts) {
        setRevisionData(data);
        setRevealedQuestions({});
      }
    } catch (e: any) {
      console.warn('Using standard revision fallback:', e?.message);
    } finally {
      setRevIsLoading(false);
    }
  };

  // ==========================================
  // PHASE 7: STUDY PLANNER STATE & HANDLERS
  // ==========================================
  const [planDays, setPlanDays] = useState<StudyPlanDay[]>(initialPlan);
  const [planTargetDate, setPlanTargetDate] = useState<string>('In 2 Weeks');
  const [planDailyHours, setPlanDailyHours] = useState<number>(2);
  const [planPriority, setPlanPriority] = useState<'High' | 'Moderate'>('High');
  const [planIsLoading, setPlanIsLoading] = useState<boolean>(false);

  const toggleTaskCompleted = (dayIndex: number) => {
    setPlanDays(prev => prev.map((d, i) => i === dayIndex ? { ...d, isCompleted: !d.isCompleted } : d));
  };

  const handleGeneratePlan = async () => {
    setPlanIsLoading(true);
    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDate: planTargetDate,
          subjects: ['Machine Learning', 'Operating Systems', 'Java OOP', 'DBMS'],
          topics: ['KNN & Classification', 'Banker’s Algorithm', 'Inheritance', 'Normalization'],
          dailyHours: planDailyHours,
          priority: planPriority,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.days) && data.days.length > 0) {
          setPlanDays(data.days.map((d: any) => ({ ...d, isCompleted: false })));
        }
      }
    } catch (err) {
      console.warn('Planner generator using cached plan:', err);
    } finally {
      setPlanIsLoading(false);
    }
  };

  // ==========================================
  // PHASE 9: IMPORTANT QUESTIONS STATE & HANDLERS
  // ==========================================
  const [iqSubject, setIqSubject] = useState<string>('Operating Systems');
  const [iqTopic, setIqTopic] = useState<string>('Unit 2: Banker’s Algorithm & Deadlocks');
  const [iqUnit, setIqUnit] = useState<string>('Unit 2');
  const [iqDifficulty, setIqDifficulty] = useState<string>('Exam Level');
  const [iqIsLoading, setIqIsLoading] = useState<boolean>(false);

  const [importantQuestionsData, setImportantQuestionsData] = useState<{
    twoMarkQuestions: { question: string; answer: string }[];
    fiveMarkQuestions: { question: string; answer: string }[];
    sevenMarkQuestions: {
      question: string;
      structuredAnswer: {
        definition: string;
        mainExplanation: string;
        importantPoints: string[];
        example: string;
        conclusion: string;
      };
    }[];
    vivaQuestions: { question: string; answer: string; examinerTip: string }[];
  }>({
    twoMarkQuestions: [
      { question: 'Define Deadlock in an Operating System.', answer: 'Deadlock is a condition where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process in the set.' },
      { question: 'State the four Coffman conditions necessary for deadlock to occur.', answer: '1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.' },
      { question: 'What is a Safe State in Banker’s Algorithm?', answer: 'A state is safe if the system can allocate resources to each process (up to its maximum) in some sequence and still avoid a deadlock.' },
    ],
    fiveMarkQuestions: [
      { question: 'Differentiate between Deadlock Prevention and Deadlock Avoidance.', answer: 'Deadlock Prevention negates at least one of the four necessary conditions before execution. Deadlock Avoidance dynamically inspects resource allocation states (e.g. Banker’s Algorithm) to ensure circular wait never occurs.' },
      { question: 'Explain the working of Resource Allocation Graphs (RAG).', answer: 'A directed graph with Process nodes (circles) and Resource nodes (rectangles). Request edge goes from Process to Resource; Assignment edge goes from Resource to Process. If a graph has no cycles, deadlock cannot exist.' },
    ],
    sevenMarkQuestions: [
      {
        question: 'Explain Banker’s Algorithm for Deadlock Avoidance in detail with safety state matrix example. (7 Marks)',
        structuredAnswer: {
          definition: 'Banker’s Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra. It tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources, and then makes an "s-state" check to test for possible activities before deciding whether allocation should be allowed.',
          mainExplanation: 'Data Structures Maintained:\n1. Available: Vector of length m indicating available instances of each resource type.\n2. Max: n × m matrix defining maximum demand of each process.\n3. Allocation: n × m matrix defining resources currently assigned to each process.\n4. Need: n × m matrix where Need[i][j] = Max[i][j] - Allocation[i][j].\n\nSafety Algorithm Steps:\n1. Let Work = Available and Finish[i] = false for all i.\n2. Find an index i such that Finish[i] == false and Need[i] <= Work. If no such i exists, go to step 4.\n3. Work = Work + Allocation[i]; Finish[i] = true; go to step 2.\n4. If Finish[i] == true for all i, then system is in a SAFE state.',
          importantPoints: [
            'Avoidance mechanism rather than detection: ensures system never enters an unsafe state.',
            'Requires advance knowledge of maximum resource requests by every process.',
            'Fixed number of processes and resources assumed throughout execution.',
            'High computational overhead O(m * n²) during dynamic resource allocation checks.'
          ],
          example: 'Consider 5 processes (P0 to P4) and 3 resource types A(10), B(5), C(7). If Available is [3, 3, 2], the safety sequence <P1, P3, P4, P0, P2> can successfully execute to completion without deadlock.',
          conclusion: 'In conclusion, Banker’s Algorithm guarantees freedom from deadlock in systems where maximum resource bounds are fixed and known in advance, serving as a fundamental benchmark in operating systems architecture.'
        }
      }
    ],
    vivaQuestions: [
      { question: 'Why is Banker’s Algorithm rarely implemented in general purpose OS like Linux or Windows?', answer: 'Because processes rarely know their maximum resource requirements in advance, and dynamic tracking incurs too high overhead.', examinerTip: 'Emphasize practicality vs theoretical elegance.' },
      { question: 'Does an unsafe state always mean deadlock will occur?', answer: 'No! An unsafe state is not necessarily a deadlock; it only means the OS cannot guarantee preventing a deadlock if processes simultaneously request their maximum claim.', examinerTip: 'Direct answer: Unsafe state is a risk, not an immediate deadlock.' }
    ]
  });

  const handleGenerateImportantQuestions = async () => {
    setIqIsLoading(true);
    try {
      const res = await fetch('/api/important-questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: iqSubject,
          topic: iqTopic,
          unit: iqUnit,
          difficulty: iqDifficulty,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.twoMarkQuestions) {
          setImportantQuestionsData(data);
        }
      }
    } catch (err) {
      console.warn('Using standard important questions fallback:', err);
    } finally {
      setIqIsLoading(false);
    }
  };

  // PYQs Curated Library State
  const [curatedFilter, setCuratedFilter] = useState<string>('all');
  const [activePyq, setActivePyq] = useState<ExamPrepItem | null>(INITIAL_EXAM_PREP_ITEMS[0]);

  const filteredPyqs = INITIAL_EXAM_PREP_ITEMS.filter(item => {
    if (curatedFilter === 'all') return true;
    return item.type === curatedFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Exam Preparation &amp; Revision Hub</span>
            <span className="text-xs font-mono font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
              High-Yield
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quick revision sheets, day-by-day study planner, structured 7-mark university answers, and repeat PYQs.
          </p>
        </div>

        <button
          onClick={() => onNavigate('quiz')}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
          <span>Launch MCQ Drill</span>
        </button>
      </div>

      {/* Primary Sub-Navigation Tabs: Phases 6, 7, 9 & PYQs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'revision', label: '1. Quick Revision Sheet', icon: Sparkles, badge: 'Phase 6' },
          { id: 'planner', label: '2. Study Planner', icon: Calendar, badge: 'Phase 7' },
          { id: 'questions', label: '3. Important Questions (7-Mark)', icon: Award, badge: 'Phase 9' },
          { id: 'pyqs', label: '4. Curated Model Answer Bank', icon: BookmarkCheck, badge: 'PYQs' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                isActive
                  ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* SUB-VIEW 1: PHASE 6 - QUICK REVISION SHEET                */}
      {/* ========================================================= */}
      {activeTab === 'revision' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>AI Quick Revision Sheet Generator</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate key concepts, formulas, definitions, common mistakes, and 5 rapid questions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = `QUICK REVISION: ${revSubject} - ${revTopic}\n\nKEY CONCEPTS:\n${revisionData.keyConcepts.join('\n')}\n\nFORMULAS:\n${revisionData.importantFormulas.join('\n')}\n\nPOINTS:\n${revisionData.importantPoints.join('\n')}`;
                    copyText('full-revision', text);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedSection === 'full-revision' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSection === 'full-revision' ? 'Copied Revision!' : 'Copy Sheet'}</span>
                </button>

                <button
                  onClick={handleGenerateRevision}
                  disabled={revIsLoading}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-60"
                >
                  {revIsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{revIsLoading ? 'Generating...' : 'Generate Notes'}</span>
                </button>
              </div>
            </div>

            {/* Config selectors */}
            <div className="grid sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject</label>
                <select
                  value={revSubject}
                  onChange={(e) => setRevSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Java Programming & OOP">Java Programming &amp; OOP</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Software Engineering">Software Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Topic</label>
                <input
                  type="text"
                  value={revTopic}
                  onChange={(e) => setRevTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                  placeholder="e.g. Unit 3: KNN & Classification"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Language (English / Hindi)</label>
                <select
                  value={revLanguage}
                  onChange={(e) => setRevLanguage(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी / Hinglish</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Grounding Material</label>
                <select
                  value={revSelectedMaterialId}
                  onChange={(e) => setRevSelectedMaterialId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700 focus:outline-none truncate"
                >
                  <option value="">General Syllabus (No notes)</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Revision Output Grid */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (7 cols): Key Concepts, Definitions & Formulas */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Key Concepts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Core Academic Concepts</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 divide-y divide-slate-100">
                  {revisionData.keyConcepts.map((kc, i) => (
                    <li key={i} className="pt-2 first:pt-0 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                      <span>{kc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Definitions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-800" />
                  <span>Important University Definitions</span>
                </h3>
                <div className="space-y-2.5">
                  {revisionData.importantDefinitions.map((def, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">{def.term}</span>
                      <p className="text-slate-600 leading-relaxed">{def.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulas & Rules */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span>Formulas, Equations &amp; Mathematical Rules</span>
                </h3>
                <div className="space-y-2">
                  {revisionData.importantFormulas.map((f, i) => (
                    <div key={i} className="p-2.5 bg-orange-50/70 border border-orange-200 rounded-xl font-mono text-xs text-orange-950 font-medium">
                      {f}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): Points, Common Mistakes, and 5 Rapid Questions */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Important Points & Common Mistakes */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Exam Traps &amp; Common Mistakes</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {revisionData.commonMistakes.map((cm, i) => (
                    <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 leading-relaxed">
                      ⚠️ {cm}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 Quick Revision Questions (Phase 6 Requirement) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-blue-900" />
                    <span>5 Rapid Revision Questions</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Click to reveal answer</span>
                </div>

                <div className="space-y-2.5">
                  {revisionData.revisionQuestions.map((rq, idx) => {
                    const isRevealed = revealedQuestions[idx];
                    return (
                      <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 transition-colors text-xs space-y-2">
                        <div 
                          onClick={() => setRevealedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className="font-bold text-slate-900 cursor-pointer flex items-start justify-between gap-2"
                        >
                          <span>Q{idx + 1}: {rq.q}</span>
                          {isRevealed ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />}
                        </div>

                        {isRevealed && (
                          <div className="pt-2 border-t border-slate-200 text-slate-700 leading-relaxed font-normal bg-white p-2.5 rounded-lg">
                            <strong className="text-emerald-700 block text-[11px] mb-0.5">Answer:</strong>
                            {rq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 2: PHASE 7 - STUDY PLANNER                       */}
      {/* ========================================================= */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          {/* Planner Setup Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-900" />
                  <span>Personalized Semester Study Planner</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate practical day-by-day tasks, spaced revision sessions, and practice drills.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const planText = planDays.map(d => `DAY ${d.day}: ${d.title} (${d.subject} - ${d.topic})\nTasks:\n${d.tasks.join('\n')}`).join('\n\n');
                    copyText('study-plan', planText);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedSection === 'study-plan' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSection === 'study-plan' ? 'Copied Plan!' : 'Copy Plan'}</span>
                </button>

                <button
                  onClick={handleGeneratePlan}
                  disabled={planIsLoading}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-60"
                >
                  {planIsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{planIsLoading ? 'Generating Plan...' : 'Generate 7-Day Plan'}</span>
                </button>
              </div>
            </div>

            {/* Inputs: Target Date, Daily Hours, Priority */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Exam Date</label>
                <input
                  type="text"
                  value={planTargetDate}
                  onChange={(e) => setPlanTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                  placeholder="e.g. October 24 (In 2 Weeks)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Daily Study Time</label>
                <select
                  value={planDailyHours}
                  onChange={(e) => setPlanDailyHours(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value={1}>1 Hour / day (Light)</option>
                  <option value={2}>2 Hours / day (Standard)</option>
                  <option value={3}>3 Hours / day (Exam Sprint)</option>
                  <option value={4}>4 Hours / day (Intensive)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Priority Focus</label>
                <select
                  value={planPriority}
                  onChange={(e) => setPlanPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="High">High (Targeting A+ &amp; 90%+)</option>
                  <option value="Moderate">Moderate (Core passing &amp; 75%+)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Day-by-Day Practical Schedule Cards */}
          <div className="space-y-3">
            {planDays.map((d, idx) => (
              <div
                key={d.day}
                className={`p-5 rounded-2xl border transition-all ${
                  d.isCompleted
                    ? 'bg-slate-50/80 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-900 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0">
                      D{d.day}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{d.title}</h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          d.type === 'weak-topic' ? 'bg-orange-50 text-orange-700' :
                          d.type === 'quiz' ? 'bg-purple-50 text-purple-700' :
                          d.type === 'revision' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {d.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{d.subject} · {d.topic}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{d.durationMinutes} mins</span>
                    </span>

                    <button
                      onClick={() => toggleTaskCompleted(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 border ${
                        d.isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {d.isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-sm border border-slate-300" />}
                      <span>{d.isCompleted ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                <ul className="pt-3 space-y-1.5 text-xs text-slate-700">
                  {d.tasks.map((task, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold shrink-0">•</span>
                      <span className={d.isCompleted ? 'line-through text-slate-400' : ''}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 3: PHASE 9 - IMPORTANT QUESTIONS & 7-MARK MODEL  */}
      {/* ========================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-900" />
                  <span>Important Questions &amp; Structured 7-Mark Model Answers</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generates 2-mark, 5-mark, structured 7-mark model answers (Definition, Explanation, Points, Example, Conclusion), and Viva questions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = `7-MARK MODEL ANSWER: ${importantQuestionsData.sevenMarkQuestions[0]?.question}\n\nDEFINITION:\n${importantQuestionsData.sevenMarkQuestions[0]?.structuredAnswer.definition}\n\nEXPLANATION:\n${importantQuestionsData.sevenMarkQuestions[0]?.structuredAnswer.mainExplanation}\n\nPOINTS:\n${importantQuestionsData.sevenMarkQuestions[0]?.structuredAnswer.importantPoints.join('\n')}\n\nEXAMPLE:\n${importantQuestionsData.sevenMarkQuestions[0]?.structuredAnswer.example}\n\nCONCLUSION:\n${importantQuestionsData.sevenMarkQuestions[0]?.structuredAnswer.conclusion}`;
                    copyText('7-mark', text);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedSection === '7-mark' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSection === '7-mark' ? 'Copied 7-Mark Answer!' : 'Copy 7-Mark Answer'}</span>
                </button>

                <button
                  onClick={handleGenerateImportantQuestions}
                  disabled={iqIsLoading}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-60"
                >
                  {iqIsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{iqIsLoading ? 'Generating...' : 'Generate Questions'}</span>
                </button>
              </div>
            </div>

            {/* Config selectors */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject</label>
                <select
                  value={iqSubject}
                  onChange={(e) => setIqSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Java Programming & OOP">Java Programming &amp; OOP</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Software Engineering">Software Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit &amp; Topic</label>
                <input
                  type="text"
                  value={iqTopic}
                  onChange={(e) => setIqTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                  placeholder="e.g. Unit 2: Banker's Algorithm & Deadlocks"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Calibration</label>
                <select
                  value={iqDifficulty}
                  onChange={(e) => setIqDifficulty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Exam Level">University Semester Exam Pattern</option>
                  <option value="Mid-Sem">Mid-Semester Internal Pattern</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: 7-Mark Structured Model Answer (Phase 9 Requirement) */}
          {importantQuestionsData.sevenMarkQuestions.map((smq, smIdx) => (
            <div key={smIdx} className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  7-Mark University Model Answer Structure
                </span>
                <span className="text-xs font-bold text-slate-400">Section C Pattern</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {smq.question}
              </h3>

              <div className="space-y-4 text-xs divide-y divide-slate-100">
                {/* 1. Definition / Introduction */}
                <div className="space-y-1 pt-2">
                  <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider font-mono">
                    1. Definition / Introduction
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {smq.structuredAnswer.definition}
                  </p>
                </div>

                {/* 2. Main Explanation */}
                <div className="space-y-1 pt-3">
                  <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider font-mono">
                    2. Main Technical Explanation
                  </h4>
                  <div className="text-slate-700 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line">
                    {smq.structuredAnswer.mainExplanation}
                  </div>
                </div>

                {/* 3. Important Points */}
                <div className="space-y-1 pt-3">
                  <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider font-mono">
                    3. Important Points &amp; High-Yield Takeaways
                  </h4>
                  <ul className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                    {smq.structuredAnswer.importantPoints.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold shrink-0">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Example */}
                <div className="space-y-1 pt-3">
                  <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider font-mono">
                    4. Concrete Example / Numerical / Code
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                    {smq.structuredAnswer.example}
                  </p>
                </div>

                {/* 5. Conclusion */}
                <div className="space-y-1 pt-3">
                  <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider font-mono">
                    5. Conclusion
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {smq.structuredAnswer.conclusion}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Section 2: 2-Mark & 5-Mark Questions Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* 2-Mark Short Questions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-100">
                <span>2-Mark Short Questions (Section A)</span>
                <span className="text-[10px] font-mono text-slate-400">Crisp Definitions</span>
              </h3>
              <div className="space-y-3">
                {importantQuestionsData.twoMarkQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">{i + 1}. {q.question}</span>
                    <p className="text-slate-600 leading-relaxed">{q.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-Mark Questions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-100">
                <span>5-Mark Questions (Section B)</span>
                <span className="text-[10px] font-mono text-slate-400">Differences &amp; Steps</span>
              </h3>
              <div className="space-y-3">
                {importantQuestionsData.fiveMarkQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">{i + 1}. {q.question}</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{q.answer}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section 3: Viva Questions with Examiner Evaluation Tips */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Lab Practical &amp; Oral Viva Drills (with Secret Examiner Tips)</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {importantQuestionsData.vivaQuestions.map((v, i) => (
                <div key={i} className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-purple-950 block">Q: {v.question}</span>
                  <p className="text-slate-700 leading-relaxed">Ans: {v.answer}</p>
                  <div className="text-[10px] text-purple-800 bg-purple-100/70 p-1.5 rounded-lg border border-purple-200 font-medium">
                    🎯 Examiner tip: {v.examinerTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 4: CURATED PYQ & MODEL ANSWERS BANK              */}
      {/* ========================================================= */}
      {activeTab === 'pyqs' && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['all', '7-mark', 'important-pyq', 'viva', 'quick-revision'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCuratedFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border capitalize ${
                    curatedFilter === cat
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredPyqs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActivePyq(item)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all text-left ${
                    activePyq?.id === item.id
                      ? 'bg-blue-50/70 border-blue-600 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-blue-900">{item.subject} · {item.unit}</span>
                    <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                      {item.highYieldTag}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {item.sampleQuestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            {activePyq ? (
              <>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {activePyq.subject} · {activePyq.unit}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{activePyq.title}</h3>
                  </div>
                  <button
                    onClick={() => copyText('pyq-detail', `${activePyq.title}\n${activePyq.sampleQuestion}\n${activePyq.description}`)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200"
                    title="Copy question"
                  >
                    {copiedSection === 'pyq-detail' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl text-xs text-orange-950">
                  <strong>Exam Question:</strong> {activePyq.sampleQuestion}
                </div>

                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {activePyq.description}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onNavigate('tutor')}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span>Ask AI Sathi to Expand Answer</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};
