import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  HelpCircle, 
  LineChart, 
  Settings,
  Sparkles,
  Calendar,
  Flame,
  BookOpen,
  GraduationCap,
  Award
} from 'lucide-react';
import { NavigationTab, AppLanguage } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  currentLanguage: AppLanguage;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  hindiLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', hindiLabel: 'डैशबोर्ड', icon: LayoutDashboard },
  { id: 'tutor', label: 'AI Sathi', hindiLabel: 'एआई साथी', icon: Bot, badge: 'Active', badgeColor: 'bg-orange-500/20 text-orange-300' },
  { id: 'materials', label: 'My Study Material', hindiLabel: 'अध्ययन सामग्री', icon: FileText },
  { id: 'quiz', label: 'Practice Quiz', hindiLabel: 'अभ्यास क्विज़', icon: HelpCircle },
  { id: 'exam-prep', label: 'Exam Prep Hub', hindiLabel: 'परीक्षा तैयारी', icon: Award, badge: '7-Mark', badgeColor: 'bg-blue-500/20 text-blue-300' },
  { id: 'progress', label: 'My Progress', hindiLabel: 'मेरी प्रगति', icon: LineChart },
  { id: 'settings', label: 'Settings', hindiLabel: 'सेटिंग्स', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  mobileMenuOpen,
  onCloseMobileMenu,
  currentLanguage,
}) => {
  const handleItemClick = (id: NavigationTab) => {
    onNavigate(id);
    onCloseMobileMenu();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1528] text-slate-100 select-none border-r border-slate-800/80">
      
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Concept: Minimal Modern Book + Companion Sparkle + Subtle Saffron Accent */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 border border-blue-500/30 flex items-center justify-center shadow-sm relative">
            <GraduationCap className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-[#0B1528]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white leading-tight">
                Sathi AI
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30">
                साथी
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 leading-none">
              Your AI Study Companion
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-400 flex items-center justify-between">
          <span>{currentLanguage === 'Hindi' ? 'नेविगेशन' : 'Academic Navigation'}</span>
          <span className="text-[9px] text-slate-500">College Edition</span>
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const displayLabel = currentLanguage === 'Hindi' ? item.hindiLabel : item.label;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{displayLabel}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Indian University Exam Widget */}
        <div className="pt-5 px-1">
          <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span>Semester Exam</span>
              </span>
              <span className="text-[11px] font-mono text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">
                18 days left
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">
                CS-501: Machine Learning
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Unit 1 - Unit 5 · End-Sem Revision
              </p>
            </div>
            <div className="w-full bg-slate-700/70 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 h-full w-[78%] rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Syllabus covered</span>
              <span className="font-mono text-slate-200">78%</span>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="px-1 pt-2">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 border border-slate-800 rounded-lg text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Study Streak</span>
            </span>
            <span className="font-mono font-semibold text-orange-400">
              12 Days 🔥
            </span>
          </div>
        </div>
      </nav>

      {/* Sathi Mission Statement Footer */}
      <div className="p-3.5 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
        <div className="text-slate-300 font-medium">Sathi AI · v1.2</div>
        <div className="text-slate-500 italic">"Learn better. Revise smarter. Ask freely."</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileMenu}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
