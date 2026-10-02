import React from 'react';
import { CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Citation } from '../types';

interface CitationCardProps {
  citation: Citation;
  onSelectCitation: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onSelectCitation }) => {
  return (
    <div className="my-1.5 w-full">
      <div
        onClick={() => citation.verified && onSelectCitation(citation)}
        className={`flex items-start justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
          citation.verified
            ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-850'
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
        }`}
      >
        <div className="flex items-start space-x-2 min-w-0 flex-1">
          {citation.verified ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          )}

          <div className="min-w-0 flex-1 text-xs">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {citation.verified ? 'Verified Passage' : 'Unverified Excerpt'}
              </span>
              {citation.section && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  ({citation.section})
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed line-clamp-2">
              "{citation.quote}"
            </p>
          </div>
        </div>

        {citation.verified && (
          <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0 ml-3 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-900/40">
            <span>Page {citation.page}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};

