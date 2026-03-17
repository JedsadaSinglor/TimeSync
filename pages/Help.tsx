
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Layers, LayoutDashboard, Sparkles, HelpCircle, ArrowRight, Download, CalendarClock, Settings, Shield, Zap, Filter, Bookmark } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-12 font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-indigo-900 dark:to-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-white relative overflow-hidden group">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-indigo-300 font-bold uppercase tracking-widest text-xs">
                <HelpCircle size={16} /> Comprehensive User Manual
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Mastering Your <br/><span className="text-indigo-400">TimeSync Pro</span></h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
                Your all-in-one workspace for time tracking, routine automation, team collaboration, and productivity analytics. Discover how to leverage every feature to maximize your efficiency.
            </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12 group-hover:skew-x-6 transition-transform duration-700"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Core Features Grid */}
      <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 px-2">
              <Zap className="text-amber-500" size={24} /> Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Smart Grid Timesheet */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                 <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <Clock size={28} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">1. Smart Grid Timesheet</h3>
                 <div className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium space-y-3">
                     <p>The core engine for logging your work. Choose between <strong>Daily, Weekly, or Monthly</strong> views and toggle between <strong>Table and List</strong> layouts.</p>
                     <ul className="list-disc pl-5 space-y-1">
                         <li><strong>Flexible Layouts:</strong> Use the Table view for high-density data entry or the List view for a more focused, chronological stream.</li>
                         <li><strong>Input Modes:</strong> Enter raw time or quantities. The system automatically calculates totals based on your category settings.</li>
                         <li><strong>Rich Notes:</strong> Add context to any entry by clicking the message icon. Notes are visible in both the timesheet and the dashboard activity feed.</li>
                         <li><strong>Keyboard Shortcuts:</strong> Tab through cells for rapid data entry across multiple days.</li>
                     </ul>
                 </div>
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
                 <div className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium space-y-3">
                     <p>Eliminate repetitive manual entry by setting up automated routines.</p>
                     <ul className="list-disc pl-5 space-y-1">
                         <li><strong>Recurring Tasks:</strong> Define tasks that happen daily, weekly (on specific days), or monthly.</li>
                         <li><strong>Auto-fill:</strong> Click the magic wand icon in the timesheet to instantly populate the current view with your predefined routines.</li>
                         <li><strong>Smart Detection:</strong> The system prevents duplicate entries when auto-filling over existing data.</li>
                     </ul>
                 </div>
                 <Link to="/timesheet" className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/10 px-4 py-2 rounded-xl transition-colors">
                    Configure Routines <ArrowRight size={16} />
                 </Link>
              </div>

              {/* Card 3: Analytics */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                 <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <LayoutDashboard size={28} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">3. Dynamic Analytics</h3>
                 <div className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium space-y-3">
                     <p>A fully customizable workspace to visualize your productivity patterns in real-time.</p>
                     <ul className="list-disc pl-5 space-y-1">
                         <li><strong>Custom Layouts:</strong> Click "Customize" to drag, resize, and reorder widgets to fit your specific needs.</li>
                         <li><strong>Widget Library:</strong> Add new components like Peak Hours, Weekly Rhythm, or Work Locations from the widget menu.</li>
                         <li><strong>Consolidated Controls:</strong> Use the sticky control bar to instantly filter by time range or specific categories across all charts.</li>
                         <li><strong>Quick Stats:</strong> Get an immediate snapshot of your total hours, daily averages, and top focus at the top of your dashboard.</li>
                     </ul>
                 </div>
                 <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl transition-colors">
                    Explore Dashboard <ArrowRight size={16} />
                 </Link>
              </div>

              {/* Card 4: Import/Export */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                 <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <Download size={28} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">4. Import & Export</h3>
                 <div className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium space-y-3">
                     <p>Your data remains yours. Move data in and out of the system easily.</p>
                     <ul className="list-disc pl-5 space-y-1">
                         <li><strong>Export to Excel:</strong> Download your current timesheet view as a formatted XLSX file.</li>
                         <li><strong>Import Data:</strong> Upload historical timesheets. The system intelligently maps columns to categories and dates to rows.</li>
                         <li><strong>Category Sync:</strong> Importing data with unknown categories will automatically create them for you.</li>
                     </ul>
                 </div>
                 <button disabled className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed">
                    Available in Timesheet
                 </button>
              </div>
          </div>
      </div>

      {/* Advanced Features */}
      <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 px-2">
              <Shield className="text-indigo-500" size={24} /> Advanced Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl"><Settings size={20} /></div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Day Configuration</h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Click the settings icon next to any date in the timesheet to mark it as a Holiday, Vacation, or a Working Weekend. This adjusts visual indicators and reporting logic.
                  </p>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl"><Filter size={20} /></div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Advanced Filtering</h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Use the filter menu in the timesheet to hide irrelevant categories or sub-categories, keeping your workspace clean and focused on current tasks.
                  </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl"><Bookmark size={20} /></div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Category Combos</h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Create "Combos" for frequently used category and sub-category pairs. This allows for one-click logging and better organization of your most common activities.
                  </p>
              </div>
          </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-3">Ready to customize your experience?</h3>
                <p className="text-indigo-700/80 dark:text-indigo-300/80 text-base mb-8 max-w-xl mx-auto font-medium">
                    Start by defining your own activity types, assigning color tags, and setting default minutes for faster logging.
                </p>
                <Link to="/categories" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl shadow-indigo-200 dark:shadow-none">
                    <Layers size={20} /> Configure Categories Now
                </Link>
            </div>
            <Layers className="absolute -left-10 -bottom-10 w-64 h-64 text-indigo-500/5 dark:text-indigo-400/5 pointer-events-none" />
            <Clock className="absolute -right-10 -top-10 w-64 h-64 text-indigo-500/5 dark:text-indigo-400/5 pointer-events-none" />
      </div>
    </div>
  );
};

export default Help;
