import React from 'react';
import { CheckCircle2, AlertCircle, FileText, ArrowUpRight } from 'lucide-react';
import { Citation } from '../types';

interface CitationCardProps {
  citation: Citation;
  onSelectCitation: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onSelectCitation }) => {
  return (
    <div
      onClick={() => citation.verified && onSelectCitation(citation)}
      className={`p-3 rounded-xl border transition-all duration-200 ${
        citation.verified
          ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/60 hover:bg-slate-800/80 cursor-pointer group'
          : 'bg-amber-500/5 border-amber-500/20 text-amber-200'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          {citation.verified ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified Quote</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Unverified / Paraphrased</span>
            </span>
          )}

          {citation.documentName && (
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
              {citation.documentName}
            </span>
          )}
        </div>

        {citation.verified && (
          <div className="flex items-center space-x-1 text-[11px] font-semibold text-blue-400 group-hover:text-blue-300">
            <span>Page {citation.page}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-300 italic font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
        "{citation.quote}"
      </p>

      {!citation.verified && citation.reasoning && (
        <p className="text-[11px] text-amber-300/80 mt-1.5">
          Note: {citation.reasoning}
        </p>
      )}
    </div>
  );
};
