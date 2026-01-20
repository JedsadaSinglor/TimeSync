
import React, { useState } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { EditProfileModal } from './layout/EditProfileModal';
import { Sidebar } from './layout/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0b1120] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500">
      <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        onEditProfile={() => setIsProfileModalOpen(true)}
      />

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
