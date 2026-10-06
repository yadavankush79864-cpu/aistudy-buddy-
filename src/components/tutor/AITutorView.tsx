import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  CheckCircle2, 
  Info, 
  Copy, 
  Check, 
  FileCheck2,
  AlertCircle,
  Loader2,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  X,
  FolderOpen,
  ArrowRight,
  FileText
} from 'lucide-react';
import { ChatMessage, ExplanationMode, AppLanguage, StudyMaterial } from '../../types';

interface AITutorViewProps {
  initialMessages: ChatMessage[];
  currentLanguage?: AppLanguage;
  materials?: StudyMaterial[];
  selectedMaterialIds?: string[];
  onToggleSelectMaterial?: (id: string) => void;
  onSelectAllMaterials?: () => void;
  onClearSelectedMaterials?: () => void;
  onNavigateToMaterials?: () => void;
}

const EXPLANATION_MODES: {
  id: ExplanationMode;
  label: string;
  badge: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: 'simple',
    label: 'Simple Explanation',
    badge: 'Beginner',
    desc: 'Easy everyday language & real-life analogies',
    icon: '🌱',
  },
  {
    id: 'detailed',
    label: 'Detailed Explanation',
    badge: 'Conceptual',
    desc: 'Complete theoretical breakdown & derivations',
    icon: '📚',
  },
  {
    id: 'exam-ready',
    label: 'Exam Ready',
    badge: '7-Mark Format',
    desc: 'Structured with headings, points & university keywords',
    icon: '🎯',
  },
  {
    id: 'quick-revision',
    label: 'Quick Revision',
    badge: 'Last Minute',
    desc: 'Short bullet points, formulas & high-yield takeaways',
    icon: '⚡',
  },
];

const SUGGESTED_PROMPTS = [
  "What is inheritance in Java?",
  "Explain KNN in simple language.",
  "Give me an exam-ready answer about supervised learning.",
  "Recursion kya hai?",
  "Explain this like I'm a beginner",
  "Ask me viva questions on this topic",
];

export const AITutorView: React.FC<AITutorViewProps> = ({ 
  initialMessages,
  currentLanguage = 'English',
  materials = [],
  selectedMaterialIds = [],
  onToggleSelectMaterial,
  onSelectAllMaterials,
  onClearSelectedMaterials,
  onNavigateToMaterials,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Java Programming & OOP');
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('exam-ready');
  const [askFromStudyMaterial, setAskFromStudyMaterial] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMaterialPicker, setShowMaterialPicker] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  
  // Real AI Chat States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSelectedMaterials = materials.filter((m) => selectedMaterialIds.includes(m.id));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const content = textToSend || input;
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-usr-' + Date.now(),
      sender: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add user message immediately & clear input
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);

    // Prepare study material context if enabled
    const useMaterial = Boolean(askFromStudyMaterial && activeSelectedMaterials.length > 0);
    let studyMaterialContext = '';
    let studyMaterialName = '';

    if (useMaterial) {
      studyMaterialContext = activeSelectedMaterials
        .map((m) => `=== MATERIAL: ${m.title} (${m.subject} · ${m.unit || 'General'}) ===\n${m.content || m.summary || ''}`)
        .join('\n\n');
      studyMaterialName = activeSelectedMaterials.map((m) => m.title).join('; ');
    }

    try {
      // Build history for context (exclude system intros or failed turns)
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          explanationMode,
          language: currentLanguage,
          subject: selectedSubject,
          fromMaterial: useMaterial,
          studyMaterialContext: useMaterial ? studyMaterialContext : '',
          studyMaterialName: useMaterial ? studyMaterialName : '',
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      const assistantMessage: ChatMessage = {
        id: 'msg-ast-' + Date.now(),
        sender: 'assistant',
        explanationMode: explanationMode,
        fromMaterial: data.usedMaterial || useMaterial,
        sourceMaterialName: data.sourceMaterialName || (useMaterial ? studyMaterialName : undefined),
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subjectTag: selectedSubject,
        suggestedFollowUps: data.suggestedFollowUps || [
          "Ask me 3 viva questions on this",
          "Give me an exam-ready answer",
          "Explain with another example",
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to get AI Sathi response:', err);
      const errMsg = err?.message || 'Unable to connect to Sathi AI. Please try again.';
      setErrorMessage(errMsg);

      const errorNoticeMessage: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        explanationMode: explanationMode,
        content: `⚠️ **Error communicating with Sathi AI**: ${errMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subjectTag: selectedSubject,
      };

      setMessages((prev) => [...prev, errorNoticeMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  const handleRestoreInitial = () => {
    setMessages(initialMessages);
    setErrorMessage(null);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPickerMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    m.subject.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    (m.unit && m.unit.toLowerCase().includes(pickerSearch.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8.5rem)] min-h-[580px] flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      
      {/* Top Header of AI Sathi */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                AI Sathi (साथी)
              </h1>
              <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-100 border border-blue-200 px-1.5 py-0.2 rounded">
                Live AI Assistant
              </span>
              <span className="text-[10px] font-medium text-orange-800 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                Lang: {currentLanguage}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Ask doubts, understand concepts and revise smarter with grounded notes.
            </p>
          </div>
        </div>

        {/* Subject & Actions */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
            <BookOpen className="w-3.5 h-3.5 text-blue-800" />
            <span className="text-[11px] text-slate-400">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="Java Programming & OOP">Java Programming &amp; OOP</option>
              <option value="Machine Learning">Machine Learning (Unit 1-5)</option>
              <option value="Operating Systems">Operating Systems (Unit 1-5)</option>
              <option value="Database Management Systems">Database Management Systems</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>

          {messages.length > 0 ? (
            <button
              onClick={handleResetChat}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          ) : (
            <button
              onClick={handleRestoreInitial}
              className="px-2.5 py-1 text-xs text-blue-800 font-semibold bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Load Sample Discussion
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Modes + Study Material Grounding (Requirement 4 & 9) */}
      <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Explanation Modes */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-0.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Mode:
          </span>
          {EXPLANATION_MODES.map((mode) => {
            const isSelected = explanationMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setExplanationMode(mode.id)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60'
                }`}
                title={mode.desc}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-blue-950 text-blue-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {mode.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* "Use my study material" Toggle & Picker Button (Requirement 4) */}
        <div className="flex items-center gap-2 relative">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={askFromStudyMaterial}
              onChange={(e) => setAskFromStudyMaterial(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
            />
            <FileCheck2 className="w-3.5 h-3.5 text-blue-800" />
            <span>Use my study material</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
              askFromStudyMaterial && activeSelectedMaterials.length > 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {activeSelectedMaterials.length} Active
            </span>
          </label>

          {askFromStudyMaterial && (
            <button
              onClick={() => setShowMaterialPicker(!showMaterialPicker)}
              className="px-2.5 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
              title="Select which uploaded materials to use as AI context"
            >
              <span>Select Material(s)</span>
              {showMaterialPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Material Selection Popover (Requirement 4) */}
          {showMaterialPicker && askFromStudyMaterial && (
            <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-blue-900" />
                  <span className="text-xs font-bold text-slate-900">Select Study Materials</span>
                </div>
                <button
                  onClick={() => setShowMaterialPicker(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Search */}
              <input
                type="text"
                placeholder="Search notes by topic or unit..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 text-slate-800"
              />

              {/* Materials List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredPickerMaterials.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No materials found. Upload notes in the Study Material page.
                  </p>
                ) : (
                  filteredPickerMaterials.map((mat) => {
                    const isSelected = selectedMaterialIds.includes(mat.id);
                    return (
                      <div
                        key={mat.id}
                        onClick={() => onToggleSelectMaterial && onToggleSelectMaterial(mat.id)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-medium'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="pt-0.5 text-blue-900">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-900" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold truncate text-[11px]">
                              {mat.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                            <span>{mat.subject}</span>
                            {mat.unit && (
                              <>
                                <span>·</span>
                                <span className="text-orange-600 font-semibold">{mat.unit}</span>
                              </>
                            )}
                            <span>·</span>
                            <span className="uppercase font-mono text-[9px] font-bold text-slate-400">
                              {mat.fileType}
                            </span>
                            {mat.isDemo && (
                              <span className="bg-slate-100 text-slate-500 px-1 rounded text-[9px]">Demo</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Actions & Navigation Link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectAllMaterials && onSelectAllMaterials()}
                    className="text-[11px] font-semibold text-blue-900 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => onClearSelectedMaterials && onClearSelectedMaterials()}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Clear All
                  </button>
                </div>

                {onNavigateToMaterials && (
                  <button
                    onClick={() => {
                      setShowMaterialPicker(false);
                      onNavigateToMaterials();
                    }}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <span>+ Upload More</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Materials Context Strip (Requirement 4 & 5) */}
      {askFromStudyMaterial && (
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="text-[11px] font-bold text-blue-900 shrink-0 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-orange-500" />
              <span>Grounded In:</span>
            </span>
            {activeSelectedMaterials.length === 0 ? (
              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                No materials selected. Click "Select Material(s)" to ground answers in your course notes.
              </span>
            ) : (
              activeSelectedMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white border border-blue-200 text-blue-950 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-3 h-3 text-blue-800" />
                  <span className="truncate max-w-[200px]" title={mat.title}>
                    {mat.title}
                  </span>
                  <button
                    onClick={() => onToggleSelectMaterial && onToggleSelectMaterial(mat.id)}
                    className="text-slate-400 hover:text-rose-600 ml-0.5"
                    title="Remove from current context"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          <span className="text-[10px] text-slate-500 font-mono">
            {activeSelectedMaterials.length} document{activeSelectedMaterials.length === 1 ? '' : 's'} indexed
          </span>
        </div>
      )}

      {/* Main Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
        
        {/* Notice of Sathi AI Foundation */}
        <div className="max-w-2xl mx-auto p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-950">
          <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-bold text-blue-900">AI Sathi Connected:</span> Mode: <strong>{EXPLANATION_MODES.find(m => m.id === explanationMode)?.label}</strong> · Language: <strong>{currentLanguage === 'Hindi' ? 'हिन्दी (Hindi/Hinglish)' : 'English'}</strong> · {askFromStudyMaterial && activeSelectedMaterials.length > 0 ? <span className="text-emerald-700 font-bold">Grounded in {activeSelectedMaterials.length} course material(s)</span> : <span>General College Knowledge</span>}.
          </div>
        </div>

        {/* Error Banner if any */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1 leading-relaxed">
              <span className="font-bold text-rose-950">Request Failed:</span> {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-600 hover:text-rose-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty State */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-10 px-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center shadow-xs">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                What concept would you like to master today?
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed font-medium">
                Ask doubts from Unit 1 to Unit 5, request 7-mark model answers, or test yourself with viva questions before practicals.
              </p>
            </div>

            {/* Quick Suggested Prompts in Empty State */}
            <div className="w-full pt-2 space-y-2 text-left">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Frequently Asked College Questions:
              </div>
              <div className="space-y-1.5">
                {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="w-full text-left p-3 text-xs text-slate-700 hover:text-blue-900 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/90 rounded-xl transition-colors flex items-center justify-between group disabled:opacity-60"
                  >
                    <span className="font-medium">{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Render Active Messages */
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isNotFoundInMaterial = 
              msg.content.includes("I couldn't find this information in your selected study material") ||
              msg.content.includes("couldn't find this information in your selected study material");

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Sender Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-gradient-to-tr from-blue-900 to-indigo-900 text-white'
                  }`}
                >
                  {isUser ? 'You' : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : ''}`}>
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    
                    {/* Source Indication Banner (Requirement 5) */}
                    {!isUser && msg.fromMaterial && msg.sourceMaterialName && (
                      <div className="mb-3">
                        {isNotFoundInMaterial ? (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-[11px] flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold text-amber-950">Not In Selected Study Material:</span>
                              <p className="text-amber-800 mt-0.5">
                                Topic wasn't found in <em>{msg.sourceMaterialName}</em>. Sathi AI answered using general curriculum knowledge.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/90 text-blue-950 text-[11px] flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center shrink-0">
                                <BookOpen className="w-3 h-3 text-orange-400" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block font-mono">
                                  Source Grounding
                                </span>
                                <span className="font-semibold text-slate-800 truncate block">
                                  Source: {msg.sourceMaterialName}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified from Notes</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="space-y-2 whitespace-pre-line font-normal">
                      {msg.content}
                    </div>

                    {/* Metadata footer */}
                    <div
                      className={`flex items-center justify-between gap-3 mt-3 pt-2 text-[10px] ${
                        isUser
                          ? 'border-t border-slate-800 text-slate-400'
                          : 'border-t border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        {msg.fromMaterial && !isNotFoundInMaterial && (
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-semibold px-1 rounded">
                            Verified from Notes
                          </span>
                        )}
                      </div>

                      {!isUser && (
                        <div className="flex items-center gap-2">
                          {msg.subjectTag && (
                            <span className="font-semibold text-slate-600">
                              {msg.subjectTag}
                            </span>
                          )}
                          <button
                            onClick={() => copyToClipboard(msg.id, msg.content)}
                            className="hover:text-slate-800 transition-colors p-0.5"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggested Follow-ups */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-orange-500" />
                        <span>Recommended Follow-ups:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(item)}
                            disabled={isLoading}
                            className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-900 rounded-lg transition-colors font-medium text-left disabled:opacity-60"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-900 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-50 border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-none p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                <span>
                  Sathi is reading your {activeSelectedMaterials.length > 0 ? `${activeSelectedMaterials.length} course document(s)` : 'syllabus'} and preparing your answer...
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-[10px]">
                  Mode: {EXPLANATION_MODES.find(m => m.id === explanationMode)?.label} · {currentLanguage === 'Hindi' ? 'हिन्दी' : 'English'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Horizontal Scroller */}
      <div className="px-5 py-2 bg-slate-50/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">
          Quick Prompts:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:text-blue-900 hover:border-blue-400 rounded-lg transition-colors whitespace-nowrap shrink-0 font-medium disabled:opacity-60"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="relative border border-slate-200 rounded-xl bg-slate-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-900/20 focus-within:border-blue-900 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask AI Sathi about ${selectedSubject} (e.g., "What is inheritance in Java?", "Explain KNN in simple language", "Recursion kya hai?")...`}
            rows={2}
            className="w-full px-4 pt-3 pb-10 text-xs bg-transparent focus:outline-none text-slate-900 placeholder-slate-400 resize-none disabled:opacity-60"
          />

          <div className="absolute left-3 bottom-2.5 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 bg-slate-200 rounded text-[10px] text-slate-700 font-mono">Enter</kbd> to send</span>
            <span className="hidden sm:inline">·</span>
            <span>Shift+Enter for newline</span>
          </div>

          <div className="absolute right-2.5 bottom-2 flex items-center gap-2">
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border border-blue-900 disabled:border-slate-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Ask Sathi</span>
                  <Send className="w-3 h-3 text-orange-400" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
