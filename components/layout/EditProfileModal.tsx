
import React, { useState, useEffect } from 'react';
import { X, Camera, AlertTriangle, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const EditProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
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
