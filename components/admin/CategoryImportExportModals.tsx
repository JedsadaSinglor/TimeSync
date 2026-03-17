import React from 'react';
import ReactDOM from 'react-dom';
import { Layers, Upload, FileSpreadsheet, List } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    summary: {
        categoryCount: number;
        subCategoryCount: number;
    };
}

export const CategoryExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm, summary }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-scale-up">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 text-blue-500 mx-auto md:mx-0">
                    <FileSpreadsheet size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center md:text-left">Confirm Export</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center md:text-left">
                    You are about to export category data.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Layers size={14}/> Categories</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.categoryCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><List size={14}/> Sub-categories</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.subCategoryCount}</span>
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
    onConfirm: () => void;
    summary: {
        newCategories: number;
        newSubCategories: number;
    };
}

export const CategoryImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onConfirm, summary }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-scale-up">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-500 mx-auto md:mx-0">
                    <Upload size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center md:text-left">Confirm Import</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center md:text-left">
                    Found new data to import.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 space-y-3">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Layers size={14}/> New Categories</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.newCategories}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><List size={14}/> New Sub-categories</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{summary.newSubCategories}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:-translate-y-0.5">Import Data</button>
                </div>
            </div>
        </div>,
        document.body
    );
};
