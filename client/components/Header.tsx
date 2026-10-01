import React from 'react';
import { Scale, ShieldCheck, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
          <Scale className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            LexiContract AI
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Enterprise Legal Contract Analyzer & Citation Verification
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs font-medium text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Deterministic Citation Verification Active</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Agentic AI Ready</span>
        </div>
      </div>
    </header>
  );
};
