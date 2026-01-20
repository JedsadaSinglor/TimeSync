
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Clock, Layers, HelpCircle, X, 
  Sun, Moon, PanelLeftOpen, PanelLeftClose, Settings 
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
    onEditProfile: () => void;
}

const NavItem = ({ to, icon: Icon, label, description, isCollapsed, onClose }: any) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`group relative flex items-center px-4 py-3.5 my-1.5 rounded-2xl transition-all duration-300 ease-out
          ${isActive 
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 dark:shadow-indigo-900/20 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-indigo-700' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
          } 
          ${isCollapsed ? 'justify-center' : 'justify-between'}
        `}
        onClick={onClose}
        title={isCollapsed ? label : ''}
      >
        <div className="flex items-center gap-3.5 z-10">
          <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:scale-110'} ${!isActive && 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
          {!isCollapsed && (
            <div className="flex flex-col">
                 <span className={`font-bold text-sm tracking-wide leading-none ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{label}</span>
                 {description && isActive && <span className="text-[10px] text-indigo-200 font-medium mt-1 leading-none opacity-90">{description}</span>}
            </div>
          )}
        </div>
        {!isCollapsed && isActive && (
             <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10"></div>
        )}
      </Link>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, toggleCollapse, onEditProfile }) => {
    const { currentUser } = useApp();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900/95 border-r border-slate-100 dark:border-slate-800 transform transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-2xl lg:shadow-none backdrop-blur-xl lg:backdrop-blur-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-24' : 'w-72'}
      `}>
        <div className="flex flex-col h-full relative">
          {/* Decorative background orb */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent pointer-events-none opacity-50" />

          {/* Logo Area */}
          <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} relative z-10`}>
            <div className="flex items-center gap-3.5 group cursor-default">
              <div className="w-11 h-11 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-600 dark:to-indigo-800 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-slate-200 dark:shadow-indigo-900/20 shrink-0 border-2 border-white dark:border-slate-700 transition-transform group-hover:scale-105">
                TS
              </div>
              {!isCollapsed && (
                <div className="animate-fade-in">
                  <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">TimeSync</h1>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase mt-1">Personal</p>
                </div>
              )}
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100 dark:scrollbar-thumb-slate-800 py-4 relative z-10">
            {!isCollapsed && <div className="px-4 mb-3 mt-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2"><div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>Menu<div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div></div>}
            
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" description="Stats" isCollapsed={isCollapsed} onClose={() => onClose()} />
            <NavItem to="/timesheet" icon={Clock} label="Timesheet" description="Log Activity" isCollapsed={isCollapsed} onClose={() => onClose()} />
            <NavItem to="/categories" icon={Layers} label="Categories" description="Manage Tags" isCollapsed={isCollapsed} onClose={() => onClose()} />
            <NavItem to="/help" icon={HelpCircle} label="Help" description="Guide" isCollapsed={isCollapsed} onClose={() => onClose()} />
          </nav>

           {/* Collapse Toggle & Dark Mode */}
           <div className={`flex items-center ${isCollapsed ? 'flex-col justify-center gap-4' : 'justify-between'} px-6 py-4 relative z-10 border-t border-slate-100 dark:border-slate-800/50`}>
              <button 
                 onClick={toggleTheme}
                 className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-yellow-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                 title="Toggle Dark Mode"
              >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button 
                onClick={toggleCollapse}
                className="hidden lg:block p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                  {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
           </div>

          {/* User Profile Footer */}
          <div className={`p-4 bg-slate-50/50 dark:bg-slate-900/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
             <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
                <div 
                    onClick={onEditProfile}
                    className={`relative flex items-center gap-3 p-3 rounded-2xl transition-all bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm flex-1 cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700 ${isCollapsed ? 'justify-center w-full' : ''}`}
                >
                  <div className="relative">
                    <img 
                        src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm shrink-0 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></div>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 animate-fade-in">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <Settings size={10} /> Edit Profile
                        </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </aside>
    );
};
