import React from 'react';
import ReactDOM from 'react-dom';
import { FileSpreadsheet, Upload, Calendar, Clock, CheckCircle, AlertCircle, Check, Tag } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    summary: {
        startDate: string;
        endDate: string;
        totalDays: number;
        totalHours: number;
        categoryCount: number;
    };
}

export const ExportConfirmationModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm, summary }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-scale-up">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 text-blue-500 mx-auto md:mx-0">
                    <FileSpreadsheet size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center md:text-left">Confirm Export</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center md:text-left">
                    You are about to export timesheet data. Please review the summary below.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Calendar size={14}/> Period</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.startDate} - {summary.endDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Clock size={14}/> Total Hours</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.totalHours.toFixed(1)} hrs</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><CheckCircle size={14}/> Categories</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.categoryCount}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:-translate-y-0.5">Export Now</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (skipDuplicates: boolean) => void;
    summary: {
        count: number;
        duplicateCount: number;
        newCategoryCount: number;
        startDate: string;
        endDate: string;
    };
}

export const ImportConfirmationModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onConfirm, summary }) => {
    if (!isOpen) return null;
    const [skipDuplicates, setSkipDuplicates] = React.useState(true);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-scale-up">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-500 mx-auto md:mx-0">
                    <Upload size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center md:text-left">Confirm Import</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center md:text-left">
                    Found <strong>{summary.count}</strong> new entries and <strong>{summary.newCategoryCount}</strong> new categories to import.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 space-y-3">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Calendar size={14}/> Date Range</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.startDate} - {summary.endDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><CheckCircle size={14}/> Entries</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.count}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Tag size={14}/> New Categories</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.newCategoryCount}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 mb-6 cursor-pointer select-none" onClick={() => setSkipDuplicates(!skipDuplicates)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${skipDuplicates ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                        {skipDuplicates && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Skip duplicates ({summary.duplicateCount})</span>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                    <button onClick={() => onConfirm(skipDuplicates)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:-translate-y-0.5">Import Data</button>
                </div>
            </div>
        </div>,
        document.body
    );
};
