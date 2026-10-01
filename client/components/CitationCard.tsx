import React from 'react';
import { CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Citation } from '../types';

interface CitationCardProps {
  citation: Citation;
  onSelectCitation: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onSelectCitation }) => {
  return (
    <div
      onClick={() => citation.verified && onSelectCitation(citation)}
      className={`p-3.5 rounded-2xl border transition-all duration-300 ${
        citation.verified
          ? 'bg-slate-950/80 border-slate-800/90 hover:border-blue-500/70 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group'
          : 'bg-amber-500/5 border-amber-500/20 text-amber-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {citation.verified ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified Quote</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Unverified / Paraphrased</span>
            </span>
          )}

          {citation.documentName && (
            <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[150px]">
              {citation.documentName}
            </span>
          )}
        </div>

        {citation.verified && (
          <div className="flex items-center space-x-1 text-[11px] font-bold text-blue-400 group-hover:text-blue-300">
            <span>Page {citation.page}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-300 italic font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
        "{citation.quote}"
      </p>

      {!citation.verified && citation.reasoning && (
        <p className="text-[11px] text-amber-300/80 mt-2 font-medium">
          Note: {citation.reasoning}
        </p>
      )}
    </div>
  );
};
