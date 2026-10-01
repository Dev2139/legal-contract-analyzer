import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Citation } from '../types';

interface CitationCardProps {
  citation: Citation;
  onSelectCitation: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onSelectCitation }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-1.5 inline-block w-full">
      <div
        onClick={() => citation.verified && onSelectCitation(citation)}
        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
          citation.verified
            ? 'bg-slate-900 border-slate-700/80 hover:border-blue-500 hover:bg-slate-850'
            : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {citation.verified ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}

          <div className="min-w-0 flex-1 truncate text-xs">
            <span className="font-semibold text-slate-200 mr-2">
              {citation.verified ? 'Verified Evidence' : 'Unverified Quote'}
            </span>
            <span className="text-slate-400 italic truncate">
              "{citation.quote}"
            </span>
          </div>
        </div>

        {citation.verified && (
          <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold flex-shrink-0 ml-2">
            <span>Page {citation.page}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};
