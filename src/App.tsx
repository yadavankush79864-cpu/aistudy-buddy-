import React, { useState } from 'react';
import { 
  NavigationTab, 
  UserProfile, 
  StudyMaterial, 
  ActivityItem, 
  SubjectProgress, 
  WeakTopic, 
  ChatMessage,
  AppLanguage,
  QuizAttempt
} from './types';
import { 
  INITIAL_USER, 
  INITIAL_MATERIALS, 
  INITIAL_ACTIVITIES, 
  INITIAL_SUBJECT_PROGRESS, 
  INITIAL_WEAK_TOPICS, 
  INITIAL_CHAT_MESSAGES,
  INITIAL_QUIZ_ATTEMPTS,
  SAMPLE_QUIZ_QUESTIONS 
} from './data/mockData';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AITutorView } from './components/tutor/AITutorView';
import { StudyMaterialsView } from './components/materials/StudyMaterialsView';
import { QuizView } from './components/quiz/QuizView';
import { ExamPrepHubView } from './components/exam/ExamPrepHubView';
import { ProgressView } from './components/progress/ProgressView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  // Authentication State - Starts on Login Screen as requested in Requirement 4
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Accessibility State (Requirement 6 & 12)
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>('English');
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Application Data States
  const [materials, setMaterials] = useState<StudyMaterial[]>(INITIAL_MATERIALS);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>(['mat-01']);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>(INITIAL_SUBJECT_PROGRESS);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>(INITIAL_WEAK_TOPICS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(INITIAL_QUIZ_ATTEMPTS);
  const [quizTargetTopic, setQuizTargetTopic] = useState<string | null>(null);

  // Toast Notice State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Auth Handlers
  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    if (newUser.preferredLanguage) {
      setCurrentLanguage(newUser.preferredLanguage);
    }
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
    showToast(`Namaste ${newUser.name.split(' ')[0]}! Welcome to Sathi AI.`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('Signed out from Sathi AI.');
  };

  // Materials Handlers
  const handleAddMaterial = (newMat: StudyMaterial) => {
    setMaterials((prev) => [newMat, ...prev]);
    const newActivity: ActivityItem = {
      id: 'act-' + Date.now(),
      type: 'material',
      title: `Uploaded ${newMat.title}`,
      subject: newMat.subject,
      unit: newMat.unit,
      timestamp: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev]);
    showToast(`"${newMat.title}" indexed under ${newMat.subject}.`);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setSelectedMaterialIds((prev) => prev.filter((mId) => mId !== id));
    showToast('Notes removed from library.');
  };

  const handleToggleSelectMaterial = (id: string) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAllMaterials = () => {
    setSelectedMaterialIds(materials.map((m) => m.id));
  };

  const handleClearSelectedMaterials = () => {
    setSelectedMaterialIds([]);
  };

  const handleSelectForTutor = (matId: string) => {
    setSelectedMaterialIds((prev) => (prev.includes(matId) ? prev : [matId, ...prev]));
    setCurrentTab('tutor');
    const target = materials.find((m) => m.id === matId);
    showToast(`Context set to "${target?.title || 'Material'}". Ask AI Sathi!`);
  };

  // Quiz Completion Handler
  const handleQuizCompleted = (attempt: QuizAttempt) => {
    setQuizAttempts((prev) => [attempt, ...prev]);

    const newActivity: ActivityItem = {
      id: 'act-' + Date.now(),
      type: 'quiz',
      title: `Completed ${attempt.subject} Quiz (${attempt.topic})`,
      subject: attempt.subject,
      timestamp: 'Just now',
      score: attempt.percentage,
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Update subject progress
    setSubjectProgress((prev) =>
      prev.map((sub) => {
        if (
          sub.subject.toLowerCase().includes(attempt.subject.toLowerCase()) ||
          attempt.subject.toLowerCase().includes(sub.subject.toLowerCase())
        ) {
          const newCount = sub.quizzesTaken + 1;
          const newAvg = Math.round((sub.averageScore * sub.quizzesTaken + attempt.percentage) / newCount);
          return {
            ...sub,
            quizzesTaken: newCount,
            averageScore: newAvg,
            progressPercent: Math.min(100, sub.progressPercent + 2),
          };
        }
        return sub;
      })
    );

    // Dynamic Weak Topic Detection & Update
    if (attempt.weakTopics && attempt.weakTopics.length > 0) {
      setWeakTopics((prev) => {
        const existingNames = new Set(prev.map((w) => w.topic.toLowerCase()));
        const newAdditions: WeakTopic[] = [];
        for (const wt of attempt.weakTopics) {
          if (!existingNames.has(wt.toLowerCase())) {
            newAdditions.push({
              id: 'weak-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              subject: attempt.subject,
              topic: wt,
              accuracyRate: Math.max(25, Math.min(65, attempt.percentage - 15)),
              recommendation: `Targeted review recommended. Take a 5-question remedial drill on "${wt}" or review study material.`,
            });
          }
        }
        return [...newAdditions, ...prev];
      });
    }

    showToast(`Quiz completed! Scored ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%)`);
  };

  // Reset Demo Data
  const handleResetData = () => {
    setUser(INITIAL_USER);
    setMaterials(INITIAL_MATERIALS);
    setSelectedMaterialIds(['mat-01']);
    setActivities(INITIAL_ACTIVITIES);
    setSubjectProgress(INITIAL_SUBJECT_PROGRESS);
    setWeakTopics(INITIAL_WEAK_TOPICS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
    setQuizTargetTopic(null);
    setCurrentLanguage('English');
    showToast('Reset Sathi demo data to semester defaults.');
  };

  // Font size class mapping
  const textSizeClass = 
    textSize === 'sm' ? 'text-[13px]' : textSize === 'lg' ? 'text-[17px]' : 'text-[15px]';

  // Unauthenticated Screen (Login / Signup)
  if (!isAuthenticated) {
    return (
      <div className={`${textSizeClass} ${highContrast ? 'contrast-125' : ''}`}>
        <AuthScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col antialiased selection:bg-orange-100 selection:text-orange-950 font-sans ${textSizeClass} ${
      highContrast 
        ? 'bg-neutral-950 text-white' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0B1528] text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-blue-900/80 animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          currentLanguage={currentLanguage}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Accessibility Controls */}
          <Header
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            user={user}
            onLogout={handleLogout}
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            textSize={textSize}
            onTextSizeChange={setTextSize}
            highContrast={highContrast}
            onToggleHighContrast={() => setHighContrast(!highContrast)}
          />

          {/* Main Body Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                user={user}
                onNavigate={setCurrentTab}
                activities={activities}
                subjectProgress={subjectProgress}
              />
            )}

            {currentTab === 'tutor' && (
              <AITutorView 
                initialMessages={chatMessages} 
                currentLanguage={currentLanguage}
                materials={materials}
                selectedMaterialIds={selectedMaterialIds}
                onToggleSelectMaterial={handleToggleSelectMaterial}
                onSelectAllMaterials={handleSelectAllMaterials}
                onClearSelectedMaterials={handleClearSelectedMaterials}
                onNavigateToMaterials={() => setCurrentTab('materials')}
              />
            )}

            {currentTab === 'materials' && (
              <StudyMaterialsView
                materials={materials}
                onNavigate={setCurrentTab}
                onAddMaterial={handleAddMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                selectedMaterialIds={selectedMaterialIds}
                onToggleSelectMaterial={handleToggleSelectMaterial}
                onSelectForTutor={handleSelectForTutor}
              />
            )}

            {currentTab === 'quiz' && (
              <QuizView
                sampleQuestions={SAMPLE_QUIZ_QUESTIONS}
                materials={materials}
                quizAttempts={quizAttempts}
                onQuizCompleted={handleQuizCompleted}
                targetTopic={quizTargetTopic}
                onClearTargetTopic={() => setQuizTargetTopic(null)}
                onNavigateToTutor={(topic) => {
                  setCurrentTab('tutor');
                  if (topic) {
                    showToast(`Switched to AI Sathi to clarify: ${topic}`);
                  }
                }}
                onNavigateToRevision={(topic) => {
                  setCurrentTab('exam-prep');
                  if (topic) {
                    showToast(`Opening Quick Revision for: ${topic}`);
                  }
                }}
              />
            )}

            {currentTab === 'exam-prep' && (
              <ExamPrepHubView 
                onNavigate={setCurrentTab}
                materials={materials}
                currentLanguage={currentLanguage}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressView
                subjectProgress={subjectProgress}
                weakTopics={weakTopics}
                activities={activities}
                quizAttempts={quizAttempts}
                materialsCount={materials.length}
                onNavigate={setCurrentTab}
                onPracticeTopic={(topic) => {
                  setQuizTargetTopic(topic);
                  setCurrentTab('quiz');
                  showToast(`Selected practice drill for: ${topic}`);
                }}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                user={user}
                onUpdateUser={(updated) => {
                  setUser(updated);
                  showToast('Updated student academic details.');
                }}
                onResetData={handleResetData}
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
