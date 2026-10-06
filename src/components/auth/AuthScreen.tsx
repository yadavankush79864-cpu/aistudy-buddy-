import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  BookOpen, 
  ShieldCheck,
  Check,
  Globe
} from 'lucide-react';
import { UserProfile, AppLanguage } from '../../types';
import { DEMO_PROFILES } from '../../data/mockData';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
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

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrStudentId, setEmailOrStudentId] = useState('aarav.sharma@dtu.ac.in');
  const [password, setPassword] = useState('sathi2026');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup fields
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('B.Tech CSE');
  const [year, setYear] = useState('3rd Year');
  const [preferredLanguage, setPreferredLanguage] = useState<AppLanguage>('English');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrStudentId.trim() || !password.trim()) {
      setError('Please enter both your Student ID / Email and password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setError('');

    if (isSignUp) {
      const newUser: UserProfile = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        email: emailOrStudentId.includes('@') ? emailOrStudentId : `${emailOrStudentId.toLowerCase()}@college.edu.in`,
        studentId: emailOrStudentId.includes('@') ? '2024-STU-' + Math.floor(Math.random() * 899 + 100) : emailOrStudentId,
        college: college.trim() || 'Engineering College',
        university: college.trim() || 'State Technical University',
        course: course,
        major: course,
        year: year,
        semester: year === '1st Year' ? 'Semester 1' : year === '2nd Year' ? 'Semester 3' : year === '3rd Year' ? 'Semester 5' : 'Semester 7',
        preferredLanguage: preferredLanguage,
        avatarUrl: '/src/assets/images/aarav_sharma_avatar_1791269387086.jpg',
      };
      onLogin(newUser);
    } else {
      // Find matching demo profile or fallback
      const found = DEMO_PROFILES.find(p => p.email.toLowerCase() === emailOrStudentId.toLowerCase() || p.studentId === emailOrStudentId);
      if (found) {
        onLogin(found);
      } else {
        onLogin({
          ...DEMO_PROFILES[0],
          name: emailOrStudentId.split('@')[0] || 'Aarav Sharma',
          email: emailOrStudentId,
        });
      }
    }
  };

  const handleSelectDemoUser = (demoUser: UserProfile) => {
    setError('');
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-950 font-sans">
      
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-800 border border-blue-700/40 flex items-center justify-center shadow-xs relative">
            <GraduationCap className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                Sathi AI
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 font-bold border border-orange-200">
                साथी
              </span>
            </div>
            <span className="text-xs text-slate-500 block mt-0.5 font-medium">
              Your Personal AI Study Companion
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600">
          <span className="text-[11px] text-slate-500 font-medium italic">
            "Learn better. Revise smarter. Ask freely."
          </span>
          <span className="font-mono text-[11px] text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            Indian College Edition
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1 flex items-center">
        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Story & Exam Prep Value */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Empowering Indian University Students for Mid-Sems &amp; End-Sems
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Master Your Semester Syllabus with <span className="text-blue-900 underline decoration-orange-500 decoration-3">Sathi AI</span>
              </h1>

              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                Your 24/7 college companion for unit-wise lecture notes, <strong>7-mark model answers</strong>, viva preparation, and Socratic concept explanations in simple English or Hinglish.
              </p>
            </div>

            {/* 3 Academic Pillars Cards */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center mb-2 font-bold text-xs">
                  01
                </div>
                <h3 className="text-xs font-bold text-slate-900">AI Sathi Tutor</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Ask doubts from Unit 1 to 5. Get beginner-friendly explanations.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center mb-2 font-bold text-xs">
                  02
                </div>
                <h3 className="text-xs font-bold text-slate-900">7-Mark Answers</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  University exam structures with diagrams, headings, and code.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center mb-2 font-bold text-xs">
                  03
                </div>
                <h3 className="text-xs font-bold text-slate-900">Unit Study Material</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Organized by Subject, Semester, and Unit for fast revision.
                </p>
              </div>
            </div>

            {/* Demo Indian Student Profiles Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  Try Instant Demo Accounts (1-Click Test Drive)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Sample Profiles Only</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {DEMO_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(profile)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/80 hover:border-blue-300 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 group-hover:ring-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                        {profile.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{profile.course}</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">{profile.college.split(',')[0]}</div>
                    <span className="mt-1.5 inline-block text-[10px] font-semibold text-blue-700 group-hover:text-blue-900">
                      Login →
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Clean Indian Student Login & Signup Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {isSignUp ? 'Create Sathi AI Account' : 'Student Login'}
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400">
                    {isSignUp ? 'New Registration' : 'Student Portal'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isSignUp 
                    ? 'Enter your college and course details to personalize your AI study companion.' 
                    : 'Sign in with your College Email or Student ID.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-2.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {isSignUp ? (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Aarav Sharma / Priya Verma"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    {/* Email / Student ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={emailOrStudentId}
                          onChange={(e) => setEmailOrStudentId(e.target.value)}
                          placeholder="student@college.edu.in"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    {/* College / University */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        College / University
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="e.g. DTU / Anna University / Mumbai University"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Course & Year */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Course
                        </label>
                        <select
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800"
                        >
                          {COURSES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Year
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Preferred Language */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preferred Explanation Language
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['English', 'Hindi'] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setPreferredLanguage(lang)}
                            className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                              preferredLanguage === lang
                                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {lang === 'Hindi' ? 'हिन्दी (Hindi)' : 'English'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a secure password"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Login: Email or Student ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email / Student ID
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={emailOrStudentId}
                          onChange={(e) => setEmailOrStudentId(e.target.value)}
                          placeholder="aarav.sharma@dtu.ac.in or 2024-CSE-042"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Tip: Preloaded demo credentials ready for test drive.
                      </span>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Password
                        </label>
                        <span className="text-[11px] text-blue-800 hover:underline cursor-pointer">
                          Forgot password?
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                      />
                      <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
                        Remember me on this college device
                      </label>
                    </div>
                  </>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 hover:from-blue-950 hover:to-indigo-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs border border-blue-900"
                >
                  <span>{isSignUp ? 'Register & Begin Learning' : 'Login to Sathi AI'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                </button>
              </form>

              {/* Mode Toggle */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-xs text-slate-600 hover:text-blue-900 transition-colors"
                >
                  {isSignUp ? (
                    <>Already registered? <span className="font-bold text-blue-900 underline">Login here</span></>
                  ) : (
                    <>New to Sathi AI? <span className="font-bold text-blue-900 underline">Create your account</span></>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Sathi AI (साथी)</span>
          <span>·</span>
          <span>Your Personal AI Study Companion</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>Indian College Curriculum</span>
          <span>·</span>
          <span>Privacy Assured</span>
        </div>
      </footer>

    </div>
  );
};
