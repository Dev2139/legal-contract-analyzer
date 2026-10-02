import React, { useMemo } from 'react';
import { LegalDocument, Citation } from '../types';
import { ShieldAlert, FileText, ChevronRight, Scale, Clock, Lock, DollarSign, Award, ShieldCheck } from 'lucide-react';
import { ClientLegalEngine } from '../lib/clientLegalEngine';

interface ClauseExtractorProps {
  document: LegalDocument | null;
  onSelectCitation: (citation: Citation) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Liability Cap':
      return ShieldAlert;
    case 'Termination':
      return Clock;
    case 'Governing Law':
      return Scale;
    case 'Confidentiality':
      return Lock;
    case 'Payment Terms':
      return DollarSign;
    default:
      return ShieldCheck;
  }
};

export const ClauseExtractor: React.FC<ClauseExtractorProps> = ({ document, onSelectCitation }) => {
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400 dark:text-slate-500 text-xs">
        <Award className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-700" />
        <h4 className="font-bold text-slate-600 dark:text-slate-400">No Contract Selected</h4>
        <p className="mt-1 max-w-xs text-center text-[11px]">
          Select any contract from the left sidebar to automatically parse and extract key legal clauses.
        </p>
      </div>
    );
  }

  const extractedClauses = useMemo(() => {
    return ClientLegalEngine.extractStandardClauses(document);
  }, [document]);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Standard Clause Extraction</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Automated clause detection for {document.originalName}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
          {extractedClauses.length} Clauses Extracted
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 max-w-4xl mx-auto">
        {extractedClauses.map((clause, idx) => {
          const IconComp = getCategoryIcon(clause.category);
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{clause.title}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Category: {clause.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onSelectCitation({
                      documentId: document._id,
                      quote: clause.quote,
                      verified: true,
                      page: clause.page,
                      startLocation: 0,
                      endLocation: 0,
                      section: clause.title,
                    })
                  }
                  className="flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/40 transition-colors"
                >
                  <span>Page {clause.page}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {clause.summary}
              </p>

              <blockquote className="text-[11px] italic text-slate-600 dark:text-slate-400 border-l-2 border-blue-500 pl-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-r-md">
                &ldquo;{clause.quote}&rdquo;
              </blockquote>
            </div>
          );
        })}
      </div>
    </div>
  );
};
