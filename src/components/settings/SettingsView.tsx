import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  RotateCcw,
  Globe,
  Sliders,
  Shield,
  GraduationCap
} from 'lucide-react';
import { UserProfile, AppLanguage, ExplanationMode } from '../../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onResetData: () => void;
  currentLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
}

const COURSES = [
  'B.Tech CSE',
  'B.Tech CSE-AIML',
  'BCA',
  'MCA',
  'B.Sc Computer Science',
  'B.Tech ECE',
  'Other',
];

const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onResetData,
  currentLanguage,
  onLanguageChange,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [studentId, setStudentId] = useState(user.studentId || '2024-CSE-042');
  const [college, setCollege] = useState(user.college || user.university || 'Delhi Technological University (DTU)');
  const [course, setCourse] = useState(user.course || user.major || 'B.Tech CSE');
  const [year, setYear] = useState(user.year || '3rd Year');
  const [semester, setSemester] = useState(user.semester || 'Semester 5');
  const [preferredLanguage, setPreferredLanguage] = useState<AppLanguage>(user.preferredLanguage || currentLanguage);

  // Preferences
  const [tutorPersona, setTutorPersona] = useState('Exam Ready (7-Mark Structure)');
  const [dailyGoalHours, setDailyGoalHours] = useState('3.0');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      studentId,
      college,
      university: college,
      course,
      major: course,
      year,
      semester,
      preferredLanguage,
    });
    onLanguageChange(preferredLanguage);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Account &amp; Academic Settings</span>
            <span className="text-xs font-mono font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
              Sathi Profile
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your student identity, college curriculum, and Sathi AI explanation preferences.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Student Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-900" />
              <span>Student Academic Profile</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Indian College Enrollment</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-900/20 shadow-2xs"
            />
            <div>
              <div className="text-sm font-bold text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{course} · {college}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-mono font-bold">
                  Roll / Student ID: {studentId}
                </span>
                <span className="text-[11px] text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 font-bold">
                  {year} ({semester})
                </span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course / Degree
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 text-slate-800 font-medium"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 text-slate-800 font-medium"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily Revision Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 text-slate-800 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Preferred Language & Sathi AI Mode (Requirement 6 & 7) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-600" />
              <span>Language &amp; Explanation Settings</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Bilingual Support</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Preferred Explanation Language
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferredLanguage('English')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  preferredLanguage === 'English'
                    ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs">English</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Standard university exam terminology, technical code, and definitions.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreferredLanguage('Hindi')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  preferredLanguage === 'Hindi'
                    ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs">हिन्दी / Hinglish (Hindi)</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Concept intuitive explanations in easy Hinglish with technical keywords intact.
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Default AI Sathi Explanation Mode
            </label>
            <div className="grid sm:grid-cols-3 gap-2 text-xs">
              {[
                { title: 'Simple Explanation', desc: 'Beginner-friendly real life analogies' },
                { title: 'Exam Ready (7-Mark Structure)', desc: 'Full mark scheme layout with headings & points' },
                { title: 'Quick Revision', desc: 'Bullet points and high-yield formulas' },
              ].map((style) => (
                <button
                  key={style.title}
                  type="button"
                  onClick={() => setTutorPersona(style.title)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    tutorPersona === style.title
                      ? 'border-orange-500 bg-orange-50/60 text-orange-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{style.title}</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onResetData}
            className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data to Defaults
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 hover:from-blue-950 hover:to-indigo-950 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border border-blue-900"
          >
            <Save className="w-3.5 h-3.5 text-orange-400" />
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
};
