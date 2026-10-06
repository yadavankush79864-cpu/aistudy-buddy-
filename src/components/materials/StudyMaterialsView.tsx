import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Filter, 
  FileCheck, 
  BookOpen, 
  Trash2, 
  Info, 
  Sparkles, 
  CheckCircle, 
  X, 
  FolderOpen,
  Plus,
  Loader2,
  FileCode,
  FileSpreadsheet,
  AlertTriangle,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { StudyMaterial, NavigationTab } from '../../types';

interface StudyMaterialsViewProps {
  materials: StudyMaterial[];
  onNavigate: (tab: NavigationTab) => void;
  onAddMaterial: (mat: StudyMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onSelectForTutor?: (matId: string) => void;
  selectedMaterialIds?: string[];
  onToggleSelectMaterial?: (id: string) => void;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  materials,
  onNavigate,
  onAddMaterial,
  onDeleteMaterial,
  onSelectForTutor,
  selectedMaterialIds = [],
  onToggleSelectMaterial,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);

  // Upload Form State
  const [uploadSubject, setUploadSubject] = useState('Machine Learning');
  const [uploadUnit, setUploadUnit] = useState('Unit 3');
  const [uploadTopic, setUploadTopic] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Manual Quick Note Modal
  const [showQuickNoteModal, setShowQuickNoteModal] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // AI Summarizer State (Phase 8 Requirement)
  const [summarizeMaterial, setSummarizeMaterial] = useState<StudyMaterial | null>(null);
  const [summarizeLength, setSummarizeLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [summarizeIsLoading, setSummarizeIsLoading] = useState<boolean>(false);
  const [summarizeResult, setSummarizeResult] = useState<{
    shortSummary: string;
    keyPoints: string[];
    importantTerms: { term: string; meaning: string }[];
    examImportantPoints: string[];
    quickRevisionNotes: string;
  } | null>(null);
  const [summaryCopied, setSummaryCopied] = useState<boolean>(false);

  const subjects = [
    'All',
    'Machine Learning',
    'Operating Systems',
    'Java Programming & OOP',
    'Database Management Systems',
    'Software Engineering',
  ];

  const units = ['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
  const fileTypes = ['All', 'pdf', 'docx', 'txt', 'notes'];

  // Filtering
  const filteredMaterials = materials.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.unit && item.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.topic && item.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesUnit = selectedUnit === 'All' || item.unit === selectedUnit;
    const matchesType = selectedFileType === 'All' || item.fileType === selectedFileType;

    return matchesSearch && matchesSubject && matchesUnit && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Real File Upload & Text Extraction Handler
  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setUploadError(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    const isTxt = ext === 'txt' || ext === 'md';
    const isPdf = ext === 'pdf';
    const isDocx = ext === 'docx' || ext === 'doc';

    let determinedType: 'pdf' | 'docx' | 'txt' | 'notes' = 'notes';
    if (isPdf) determinedType = 'pdf';
    else if (isDocx) determinedType = 'docx';
    else if (isTxt) determinedType = 'txt';

    try {
      let extractedText = '';
      let pages = 1;
      let summaryText = '';

      if (isTxt) {
        // Direct browser text read for TXT files
        extractedText = await file.text();
        pages = Math.max(1, Math.ceil(extractedText.length / 2200));
        summaryText = extractedText.slice(0, 240) + (extractedText.length > 240 ? '...' : '');
      } else {
        // Read as base64 using native FileReader for PDF/DOCX
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = (reader.result as string) || '';
            const b64 = res.includes(',') ? res.split(',')[1] : res;
            resolve(b64);
          };
          reader.onerror = () => reject(new Error('Failed to read file from disk.'));
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/materials/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: determinedType,
            fileContentBase64: base64Data,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to extract text from file.');
        }

        extractedText = data.text || '';
        pages = data.pageCount || 1;
        summaryText = data.summary || '';
      }

      const newMaterial: StudyMaterial = {
        id: 'mat-' + Date.now(),
        title: file.name,
        subject: uploadSubject,
        course: 'B.Tech CSE',
        semester: 'Semester 5',
        unit: uploadUnit,
        topic: uploadTopic.trim() || file.name.replace(/\.[^/.]+$/, ""),
        fileType: determinedType,
        fileSize: formatFileSize(file.size),
        pageCount: pages,
        uploadedAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'indexed',
        isDemo: false,
        summary: summaryText || `Uploaded notes for ${uploadSubject} (${uploadUnit}). Ready for AI Sathi Q&A.`,
        content: extractedText,
      };

      onAddMaterial(newMaterial);
      setUploadNotice(`Added "${file.name}" to ${uploadSubject} (${uploadUnit}). Text extracted & ready for Sathi!`);
      setUploadTopic('');
      setTimeout(() => setUploadNotice(null), 5000);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadError(err?.message || 'Could not process the uploaded file. Please verify format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Quick Manual Notes Creation
  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newMaterial: StudyMaterial = {
      id: 'mat-' + Date.now(),
      title: noteTitle.trim(),
      subject: uploadSubject,
      course: 'B.Tech CSE',
      semester: 'Semester 5',
      unit: uploadUnit,
      topic: uploadTopic.trim() || 'Classroom Notes',
      fileType: 'notes',
      fileSize: formatFileSize(new Blob([noteContent]).size),
      pageCount: Math.max(1, Math.ceil(noteContent.length / 2000)),
      uploadedAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'indexed',
      isDemo: false,
      summary: noteContent.slice(0, 220) + (noteContent.length > 220 ? '...' : ''),
      content: noteContent.trim(),
    };

    onAddMaterial(newMaterial);
    setShowQuickNoteModal(false);
    setNoteTitle('');
    setNoteContent('');
    setUploadNotice(`Created note "${newMaterial.title}". Ready for AI Sathi Q&A.`);
    setTimeout(() => setUploadNotice(null), 4000);
  };

  const handleAskWithMaterial = (material: StudyMaterial) => {
    if (onSelectForTutor) {
      onSelectForTutor(material.id);
    } else {
      onNavigate('tutor');
    }
  };

  const handleOpenSummarize = (mat: StudyMaterial) => {
    setSummarizeMaterial(mat);
    setSummarizeResult(null);
    setSummaryCopied(false);
    handleRunSummarize(mat, 'medium');
  };

  const handleRunSummarize = async (mat: StudyMaterial, len: 'short' | 'medium' | 'detailed') => {
    setSummarizeIsLoading(true);
    setSummarizeLength(len);
    try {
      const res = await fetch('/api/summarizer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialTitle: mat.title,
          materialContent: mat.content || mat.summary || '',
          length: len,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummarizeResult(data);
      }
    } catch (err) {
      console.warn('Summarizer fallback notice:', err);
    } finally {
      setSummarizeIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!summarizeResult || !summarizeMaterial) return;
    const text = `# SUMMARY: ${summarizeMaterial.title}\n\n## Overview\n${summarizeResult.shortSummary}\n\n## Key Points\n${summarizeResult.keyPoints.join('\n')}\n\n## Important Terms\n${summarizeResult.importantTerms.map(t => `- **${t.term}**: ${t.meaning}`).join('\n')}\n\n## Exam Points\n${summarizeResult.examImportantPoints.join('\n')}\n\n## Quick Revision Notes\n${summarizeResult.quickRevisionNotes}`;
    navigator.clipboard?.writeText(text);
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  const handleDownloadSummary = () => {
    if (!summarizeResult || !summarizeMaterial) return;
    const text = `# ${summarizeMaterial.title} - AI Revision Summary\n\n## Overview\n${summarizeResult.shortSummary}\n\n## Key Points\n${summarizeResult.keyPoints.map(p => `- ${p}`).join('\n')}\n\n## Important Terms\n${summarizeResult.importantTerms.map(t => `- **${t.term}**: ${t.meaning}`).join('\n')}\n\n## Exam Important Points\n${summarizeResult.examImportantPoints.map(p => `- ${p}`).join('\n')}\n\n## Quick Revision Cram Sheet\n${summarizeResult.quickRevisionNotes}\n\n---\nGenerated by Sathi AI Study Companion`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summarizeMaterial.title.replace(/[^a-zA-Z0-9]/g, '_')}_Summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>My Study Material</span>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
              Semester Documents
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload PDF slides, textbook excerpts, or TXT notes. Sathi AI will ground answers in your selected documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickNoteModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-900" />
            <span>+ Create Text Note</span>
          </button>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
            {materials.length} Materials
          </span>
        </div>
      </div>

      {/* Notice Banner */}
      {uploadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadNotice}</span>
          </div>
          <button onClick={() => setUploadNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Notes Card (Requirement 1) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-blue-900" />
              <span>Add / Upload Study Material</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or drop your PDF documents, TXT lecture summaries, or notes.
            </p>
          </div>

          {/* Academic Hierarchy Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-slate-500 text-[11px]">Subject:</span>
              <select
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                className="bg-transparent text-slate-900 font-semibold focus:outline-none"
              >
                {subjects.filter(s => s !== 'All').map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-slate-500 text-[11px]">Unit:</span>
              <select
                value={uploadUnit}
                onChange={(e) => setUploadUnit(e.target.value)}
                className="bg-transparent text-slate-900 font-semibold focus:outline-none"
              >
                {units.filter(u => u !== 'All').map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Topic / Unit Name (Optional)"
              value={uploadTopic}
              onChange={(e) => setUploadTopic(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-7 text-center transition-colors ${
            dragActive 
              ? 'border-blue-900 bg-blue-50/50' 
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
          }`}
        >
          <div className="max-w-md mx-auto space-y-2.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              {isProcessing ? (
                <p className="text-xs font-bold text-blue-900 animate-pulse">
                  Extracting text and indexing document for AI Sathi...
                </p>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-800">
                    Drag and drop your study material here, or{' '}
                    <label className="text-blue-900 underline hover:text-blue-950 cursor-pointer font-bold">
                      browse files
                      <input
                        type="file"
                        accept=".pdf,.txt,.docx,.doc,.md"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supported formats: <strong>PDF</strong>, <strong>TXT</strong>, <strong>DOC/DOCX</strong> · Text is automatically extracted for AI Sathi
                  </p>
                </>
              )}
            </div>

            {!isProcessing && (
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <label className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 border border-blue-900">
                  <UploadCloud className="w-3.5 h-3.5 text-orange-400" />
                  <span>Upload Material (PDF / TXT)</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx,.doc,.md"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickNoteModal(true)}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  + Paste Notes Directly
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic, unit, or keywords (e.g. KNN, Normalization, Banker)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Unit Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-medium">Unit:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-slate-600">
              {units.map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedUnit === u
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-medium">Type:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-slate-600">
              {fileTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFileType(type)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                    selectedFileType === type
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold mr-1 shrink-0">Subject:</span>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Cards Grid (Requirement 2 & 3) */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              No study materials match your search filters
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try choosing "All Subjects" or "All Units" to view all available semester course files.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSubject('All');
              setSelectedUnit('All');
              setSelectedFileType('All');
            }}
            className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-950 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2 rounded-xl text-xs font-bold ${
                    item.fileType === 'pdf'
                      ? 'bg-rose-50 text-rose-700'
                      : item.fileType === 'docx'
                      ? 'bg-blue-50 text-blue-700'
                      : item.fileType === 'txt'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Demo Tag (Requirement 2) */}
                    {item.isDemo ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                        Demo
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Uploaded
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <span>{item.fileSize}</span>
                      <span>·</span>
                      <span>{item.pageCount} pgs</span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Academic Hierarchy Label */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-900 mb-1">
                    <span>{item.subject}</span>
                    {item.unit && (
                      <>
                        <span className="text-slate-300">→</span>
                        <span className="text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded font-mono font-bold">
                          {item.unit}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-medium">
                    <span>{item.uploadedAt}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Indexed
                    </span>
                  </div>
                </div>

                {item.summary && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-normal">
                    {item.summary}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPreviewMaterial(item)}
                  className="text-slate-700 hover:text-blue-900 font-bold hover:underline text-[11px]"
                >
                  View Notes
                </button>

                <div className="flex items-center gap-2">
                  {onToggleSelectMaterial && (
                    <button
                      onClick={() => onToggleSelectMaterial(item.id)}
                      className={`px-2 py-1 text-[11px] rounded-lg transition-colors flex items-center gap-1 font-semibold border ${
                        selectedMaterialIds.includes(item.id)
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                      title={selectedMaterialIds.includes(item.id) ? 'Selected as context for AI Sathi. Click to remove.' : 'Click to select as context for AI Sathi'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedMaterialIds.includes(item.id) ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                      <span>{selectedMaterialIds.includes(item.id) ? 'In Sathi Context' : '+ Sathi Context'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenSummarize(item)}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    title="Generate AI summary from this study material"
                  >
                    <BookOpen className="w-3 h-3 text-blue-800" />
                    <span>Summarize</span>
                  </button>

                  <button
                    onClick={() => handleAskWithMaterial(item)}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    title="Ask AI Sathi questions using this material"
                  >
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    <span>Ask Sathi</span>
                  </button>

                  <button
                    onClick={() => onDeleteMaterial(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete notes"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Detail Preview Modal (Requirement 3) */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/60 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 font-mono">
                    {previewMaterial.subject} · {previewMaterial.unit}
                  </span>
                  {previewMaterial.isDemo ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-bold">
                      Demo
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Uploaded Notes
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {previewMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Format</span>
                  <span className="font-bold text-slate-800 uppercase">{previewMaterial.fileType}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Size</span>
                  <span className="font-bold text-slate-800 font-mono">{previewMaterial.fileSize}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Pages</span>
                  <span className="font-bold text-slate-800 font-mono">{previewMaterial.pageCount} pgs</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Document Summary
                </label>
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-normal">
                  {previewMaterial.summary || 'Summary indexed and ready for AI Sathi Q&A.'}
                </div>
              </div>

              {/* Extracted Text Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Extracted Text Content (Used for AI Context)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {previewMaterial.content ? `${previewMaterial.content.length} chars` : 'Full content'}
                  </span>
                </div>
                <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-mono text-[11px]">
                  {previewMaterial.content || 'Content extracted and indexed for Sathi AI grounding.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2 text-xs bg-slate-50/50 shrink-0">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const targetMat = previewMaterial;
                  setPreviewMaterial(null);
                  handleAskWithMaterial(targetMat);
                }}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-950 font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Ask AI Sathi with this Material</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Quick Note Modal */}
      {showQuickNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Create Text Study Note
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste notes, formulas, or syllabus text to index for AI Sathi.
                </p>
              </div>
              <button
                onClick={() => setShowQuickNoteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNote} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 KNN Distance Formulas & Solved Examples"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-medium"
                  >
                    {subjects.filter(s => s !== 'All').map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={uploadUnit}
                    onChange={(e) => setUploadUnit(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-medium"
                  >
                    {units.filter(u => u !== 'All').map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes Content / Syllabus Text
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste lecture notes, definitions, formulas, or exam questions here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickNoteModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold shadow-2xs"
                >
                  Save &amp; Index Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
