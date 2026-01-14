import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Layers, LayoutDashboard, CheckCircle, HelpCircle, ArrowRight, Shield } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-indigo-900 dark:to-slate-900 rounded-3xl p-8 md:p-12 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-indigo-300 font-bold uppercase tracking-widest text-xs">
                <HelpCircle size={16} /> User Guide
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Getting Started with TimeSync</h1>
            <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Welcome aboard! This guide will help you understand how to track your time, manage categories, and view your productivity stats.
            </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
             <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Clock size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Tracking Time</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                 Go to the <strong>Timesheet</strong> page. You can switch between "Daily View" (Simple) for quick entry or "Weekly View" (Grid) for bulk editing.
             </p>
             <Link to="/timesheet" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Go to Timesheet <ArrowRight size={16} />
             </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
             <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <Layers size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Categories</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                 Before logging time, you need Categories. Go to <strong>Categories</strong> to create personal activities or (if you are a leader) team projects.
             </p>
             <Link to="/categories" className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                Manage Categories <ArrowRight size={16} />
             </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
             <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Dashboard</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                 View your progress on the <strong>Dashboard</strong>. Analyze your productivity trends with interactive charts.
             </p>
             <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                View Stats <ArrowRight size={16} />
             </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
             <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Roles</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                 <strong>Members</strong> log time. <strong>Team Leaders</strong> view their team's logs. <strong>Admins</strong> manage everything. Use the demo switcher in the sidebar to try different roles.
             </p>
          </div>
      </div>
    </div>
  );
};

export default Help;