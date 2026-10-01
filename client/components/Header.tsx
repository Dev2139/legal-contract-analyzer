import React from 'react';
import { Scale, ShieldCheck, Sparkles, Database, FileText } from 'lucide-react';

interface HeaderProps {
  documentCount?: number;
  readyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ documentCount = 0, readyCount = 0 }) => {
  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white px-6 py-3.5 flex items-center justify-between shadow-xl shadow-black/40 relative z-30">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3.5">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-slate-900 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
              LexiContract AI
            </h1>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Enterprise v2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            AI Contract Intelligence • Deterministic Citation Verification • Multi-Doc Comparison
          </p>
        </div>
      </div>

      {/* Stats Summary & Status Pills */}
      <div className="flex items-center space-x-4">
        {/* Document Stats Badge */}
        <div className="hidden sm:flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>{documentCount} Document{documentCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-px h-3.5 bg-slate-700"></div>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{readyCount} Ready</span>
          </div>
        </div>

        {/* Verification Status */}
        <div className="flex items-center space-x-2 bg-emerald-950/40 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-semibold shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Citation Verification Active</span>
        </div>

        {/* AI Agent Status */}
        <div className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 px-3 py-1.5 rounded-xl border border-blue-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Agent Ready</span>
        </div>
      </div>
    </header>
  );
};
