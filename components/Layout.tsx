
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  Menu, 
  X,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  Moon,
  Sun,
  Layers,
  Settings,
  Camera,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const EditProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, resetData } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [position, setPosition] = useState(currentUser?.position || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPosition(currentUser.position || '');
      setEmail(currentUser.email);
      setAvatarUrl(currentUser.avatar || '');
    }
    if (isOpen) {
        setShowResetConfirm(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      ...currentUser,
      name,
      position,
      email,
      avatar: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      {showResetConfirm ? (
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 p-6 animate-scale-up">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4 text-red-500 mx-auto">
                 <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center">Reset Application?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center leading-relaxed">
                 This will remove <strong>all categories, logs, and tasks</strong> to give you a fresh start. Your user profile will be preserved.
              </p>
              <div className="flex gap-3">
                 <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                 <button onClick={() => { resetData(); onClose(); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-all hover:-translate-y-0.5">Yes, Reset</button>
              </div>
           </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-scale-up overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-md">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Edit Profile</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex justify-center mb-6">
                    <div className="relative group">
                        <img src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-md object-cover" alt="Profile" />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Display Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-slate-700 text-slate-800 dark:text-white" placeholder="Your Name" required />
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Position / Title</label>
                    <input value={position} onChange={e => setPosition(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-slate-700 text-slate-800 dark:text-white" placeholder="e.g. Designer" />
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Avatar URL (Optional)</label>
                    <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-slate-700 text-slate-800 dark:text-white" placeholder="https://..." />
                    </div>

                    <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5">Save Changes</button>
                </form>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Danger Zone</h4>
                    <button 
                        type="button" 
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full py-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} /> Reset All Data
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { currentUser } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const NavItem = ({ to, icon: Icon, label, description }: { to: string, icon: any, label: string, description?: string }) => {
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
        onClick={() => setIsSidebarOpen(false)}
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

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0b1120] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500">
      <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900/95 border-r border-slate-100 dark:border-slate-800 transform transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-2xl lg:shadow-none backdrop-blur-xl lg:backdrop-blur-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100 dark:scrollbar-thumb-slate-800 py-4 relative z-10">
            {!isCollapsed && <div className="px-4 mb-3 mt-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2"><div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>Menu<div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div></div>}
            
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" description="Stats" />
            <NavItem to="/timesheet" icon={Clock} label="Timesheet" description="Log Activity" />
            <NavItem to="/categories" icon={Layers} label="Categories" description="Manage Tags" />
            <NavItem to="/help" icon={HelpCircle} label="Help" description="Guide" />
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
                    onClick={() => setIsProfileModalOpen(true)}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#f8fafc] dark:bg-[#0b1120]">
        {/* Mobile Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:hidden flex items-center px-4 justify-between shrink-0 shadow-sm z-30 sticky top-0">
          <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white">
             <div className="w-8 h-8 bg-slate-900 dark:bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm shadow-md">TS</div>
             <span>TimeSync</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleSidebar} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-95 transition-transform">
                <Menu size={24} />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8 pb-24">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
