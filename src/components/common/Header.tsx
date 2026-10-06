import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Bell, 
  Menu, 
  X,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { NavigationTab, UserProfile, AppLanguage } from '../../types';

interface HeaderProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  user: UserProfile;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  currentLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  textSize: 'sm' | 'base' | 'lg';
  onTextSizeChange: (size: 'sm' | 'base' | 'lg') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string; hindiTitle: string }> = {
  dashboard: { title: 'Student Dashboard', subtitle: 'Course progress, internal tests & study roadmap', hindiTitle: 'डैशबोर्ड' },
  tutor: { title: 'AI Sathi', subtitle: 'Ask doubts, understand concepts & revise smarter', hindiTitle: 'एआई साथी' },
  materials: { title: 'My Study Material', subtitle: 'Semester notes, lecture slides & unit-wise modules', hindiTitle: 'अध्ययन सामग्री' },
  quiz: { title: 'Practice Quiz', subtitle: 'Unit-wise MCQs, viva drills & diagnostic tests', hindiTitle: 'अभ्यास क्विज़' },
  'exam-prep': { title: 'Exam Preparation Hub', subtitle: '7-mark model answers, previous year questions & viva', hindiTitle: 'परीक्षा तैयारी' },
  progress: { title: 'My Progress', subtitle: 'Syllabus coverage, test accuracy & weak topic tracker', hindiTitle: 'मेरी प्रगति' },
  settings: { title: 'Account & Settings', subtitle: 'Academic profile, study goals & language preferences', hindiTitle: 'सेटिंग्स' },
};

const FUTURE_LANGUAGES = [
  'Bengali (বাংলা)',
  'Marathi (मराठी)',
  'Gujarati (ગુજરાતી)',
  'Tamil (தமிழ்)',
  'Telugu (తెలుగు)',
  'Kannada (ಕನ್ನಡ)',
  'Malayalam (മലയാളം)',
  'Punjabi (ਪੰਜਾਬੀ)',
  'Odia (ଓଡ଼ିଆ)',
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  user,
  onLogout,
  mobileMenuOpen,
  onToggleMobileMenu,
  currentLanguage,
  onLanguageChange,
  textSize,
  onTextSizeChange,
  highContrast,
  onToggleHighContrast,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const currentInfo = TAB_TITLES[currentTab] || TAB_TITLES.dashboard;

  return (
    <header className={`sticky top-0 z-30 transition-colors border-b ${
      highContrast 
        ? 'bg-black text-white border-yellow-400' 
        : 'bg-white/95 backdrop-blur-sm text-slate-900 border-slate-200/90'
    }`}>
      {/* Top Accessibility Bar inspired by Indian National Education Portals */}
      <div className={`px-4 sm:px-6 py-1 text-[11px] border-b flex items-center justify-between transition-colors ${
        highContrast 
          ? 'bg-neutral-900 border-neutral-800 text-yellow-300' 
          : 'bg-slate-50 border-slate-200/70 text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-900 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
            Sathi AI
          </span>
          <span className="hidden md:inline text-slate-400">·</span>
          <span className="hidden md:inline text-slate-500">
            {currentLanguage === 'Hindi' 
              ? 'आपका व्यक्तिगत एआई अध्ययन साथी' 
              : 'Your Personal AI Study Companion'}
          </span>
        </div>

        {/* Accessibility Tools: Text Size & High Contrast & Language */}
        <div className="flex items-center gap-3">
          {/* Text Size Scale */}
          <div className="flex items-center gap-1 border-r border-slate-200 pr-2.5">
            <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">Text:</span>
            <button
              onClick={() => onTextSizeChange('sm')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                textSize === 'sm' ? 'bg-blue-900 text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
              title="Decrease text size"
            >
              A-
            </button>
            <button
              onClick={() => onTextSizeChange('base')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                textSize === 'base' ? 'bg-blue-900 text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
              title="Default text size"
            >
              A
            </button>
            <button
              onClick={() => onTextSizeChange('lg')}
              className={`px-1.5 py-0.5 rounded text-[12px] font-bold transition-colors ${
                textSize === 'lg' ? 'bg-blue-900 text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
              title="Increase text size"
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={onToggleHighContrast}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 transition-colors ${
              highContrast 
                ? 'bg-yellow-400 text-black border-yellow-400 font-bold' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle High Contrast Display"
          >
            <span>Contrast</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-[11px] font-medium"
            >
              <Globe className="w-3 h-3 text-blue-700" />
              <span>{currentLanguage === 'Hindi' ? 'हिन्दी' : 'English'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Language
                </div>
                <button
                  onClick={() => {
                    onLanguageChange('English');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-50 ${
                    currentLanguage === 'English' ? 'font-semibold text-blue-900 bg-blue-50/70' : 'text-slate-700'
                  }`}
                >
                  <span>English</span>
                  {currentLanguage === 'English' && <span className="text-[10px] text-blue-600">✓ Active</span>}
                </button>

                <button
                  onClick={() => {
                    onLanguageChange('Hindi');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-50 ${
                    currentLanguage === 'Hindi' ? 'font-semibold text-blue-900 bg-blue-50/70' : 'text-slate-700'
                  }`}
                >
                  <span>हिन्दी (Hindi)</span>
                  {currentLanguage === 'Hindi' && <span className="text-[10px] text-blue-600">✓ Active</span>}
                </button>

                <div className="border-t border-slate-100 my-1 pt-1 px-3 text-[10px] text-slate-400 font-medium">
                  More Indian Languages (Coming Soon):
                </div>

                <div className="max-h-32 overflow-y-auto px-1">
                  {FUTURE_LANGUAGES.map((lang, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 text-[11px] text-slate-400 flex items-center justify-between"
                    >
                      <span>{lang}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">Soon</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              {currentLanguage === 'Hindi' ? currentInfo.hindiTitle : currentInfo.title}
            </span>
            <span className="hidden md:inline-block text-xs text-slate-400">
              / {currentInfo.subtitle}
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden lg:flex items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search units, PYQs, formulas, viva..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions & Student Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ask AI Sathi Shortcut */}
          <button
            onClick={() => onNavigate('tutor')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 hover:from-blue-950 hover:to-indigo-900 rounded-lg transition-all shadow-xs border border-blue-900"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Ask AI Sathi</span>
          </button>

          {/* Exam Prep Shortcut */}
          <button
            onClick={() => onNavigate('exam-prep')}
            className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            <span>7-Mark Prep</span>
          </button>

          {/* Student Profile Info & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <button
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2 group text-left"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 group-hover:ring-orange-500 transition-all"
              />
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-900 transition-colors leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 leading-none">
                  {user.course || 'B.Tech CSE'}
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
