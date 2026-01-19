
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Layers, LayoutDashboard, Sparkles, HelpCircle, ArrowRight, Download, CalendarClock } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-indigo-900 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-white relative overflow-hidden group">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-indigo-300 font-bold uppercase tracking-widest text-xs">
                <HelpCircle size={16} /> User Manual
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight">Mastering Your <br/><span className="text-indigo-400">TimeSync Pro</span></h1>
            <p className="text-slate-300 text-lg max-w-xl leading-relaxed font-medium">
                Your all-in-one workspace for time tracking, routine automation, and productivity analytics. Here is how to make the most of it.
            </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12 group-hover:skew-x-6 transition-transform duration-700"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Timesheet */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
             <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Clock size={28} />
             </div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">1. Smart Grid Timesheet</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium">
                 The heart of the app. Switch between <strong>Daily, Weekly, and Monthly</strong> views. 
                 <br/><br/>
                 Rows represent activities, and columns represent dates. You can input <strong>Time (minutes)</strong> or <strong>Quantities</strong> depending on the category settings.
             </p>
             <Link to="/timesheet" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/10 px-4 py-2 rounded-xl transition-colors">
                Open Timesheet <ArrowRight size={16} />
             </Link>
          </div>

          {/* Card 2: Automation */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
             <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
             </div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">2. Recurring & Auto-fill</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium">
                 Stop manual entry. Set up <strong>Recurring Tasks</strong> (Daily, Weekly, Monthly) via the <CalendarClock className="inline w-3 h-3"/> button.
                 <br/><br/>
                 Use the <strong>Auto-fill</strong> button to instantly populate your grid with your planned routine for the selected date range.
             </p>
             <Link to="/timesheet" className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/10 px-4 py-2 rounded-xl transition-colors">
                Configure Routines <ArrowRight size={16} />
             </Link>
          </div>

          {/* Card 3: Analytics */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
             <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} />
             </div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">3. Analytics Dashboard</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium">
                 Visualize your productivity. Track <strong>Total Hours</strong>, <strong>Daily Averages</strong>, and <strong>Category Distribution</strong>.
                 <br/><br/>
                 Filter by date range or specific categories to spot trends and optimize your workflow.
             </p>
             <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl transition-colors">
                View Stats <ArrowRight size={16} />
             </Link>
          </div>

          {/* Card 4: Import/Export */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
             <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Download size={28} />
             </div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">4. Import & Export</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium">
                 Your data is portable. Export your timesheet to <strong>Excel (XLSX)</strong> for reporting.
                 <br/><br/>
                 You can also <strong>Import</strong> existing Excel sheets. Ensure the format matches: <em>Date (Rows) x Activities (Columns)</em>.
             </p>
             <button disabled className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed">
                Available in Timesheet
             </button>
          </div>
      </div>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-[2rem] p-8 text-center">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-2">Need to manage categories?</h3>
            <p className="text-indigo-600/80 dark:text-indigo-300/80 text-sm mb-6 max-w-lg mx-auto">
                Define your own activity types, assign color tags, and set default minutes for faster logging.
            </p>
            <Link to="/categories" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                <Layers size={18} /> Configure Categories
            </Link>
      </div>
    </div>
  );
};

export default Help;
