import React from 'react';
import { Scale, CheckCircle } from 'lucide-react';

interface HeaderProps {
  documentCount?: number;
  readyCount?: number;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800/80 text-white px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Clean Brand Logo & Title */}
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">
            LexiContract AI
          </h1>
          <p className="text-[11px] text-slate-400">
            Legal Contract Analysis & Verified Citations
          </p>
        </div>
      </div>

      {/* Clean System Status */}
      <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-medium text-slate-300">System Ready</span>
      </div>
    </header>
  );
};
