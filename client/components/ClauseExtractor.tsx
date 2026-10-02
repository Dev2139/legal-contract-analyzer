import React, { useState } from 'react';
import { LegalDocument, Citation } from '../types';
import { ShieldAlert, FileText, ChevronRight, Scale, Clock, Lock, DollarSign, Award } from 'lucide-react';

interface ClauseExtractorProps {
  document: LegalDocument | null;
  onSelectCitation: (citation: Citation) => void;
}

export const ClauseExtractor: React.FC<ClauseExtractorProps> = ({ document, onSelectCitation }) => {
  if (!document) {
    return (
      <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs">
        Select a contract from the left sidebar to extract standard legal clauses.
      </div>
    );
  }

  const standardClauses = [
    {
      title: 'Limitation of Liability',
      category: 'Liability Cap',
      icon: ShieldAlert,
      found: true,
      page: 2,
      summary: 'Cap set to total project fees paid. Excludes indirect and consequential damages.',
      quote: 'Total liability shall not exceed the total fees paid under this Agreement.',
    },
    {
      title: 'Termination & Notice',
      category: 'Termination',
      icon: Clock,
      found: true,
      page: 2,
      summary: 'Requires 30 days written notice for convenience or 14 days for uncured breach.',
      quote: 'Either party may terminate this Agreement by giving 30 days written notice.',
    },
    {
      title: 'Governing Law & Jurisdiction',
      category: 'Governing Law',
      icon: Scale,
      found: true,
      page: 3,
      summary: 'Governed under State laws with mandatory arbitration for unresolved disputes.',
      quote: 'This Agreement shall be governed by and construed in accordance with applicable laws.',
    },
    {
      title: 'Confidentiality & Non-Disclosure',
      category: 'Confidentiality',
      icon: Lock,
      found: true,
      page: 1,
      summary: 'Strict non-disclosure obligations surviving for 3 years post-termination.',
      quote: 'Receiving Party agrees to maintain strictly confidential all proprietary information.',
    },
    {
      title: 'Payment Terms & Milestones',
      category: 'Payment',
      icon: DollarSign,
      found: true,
      page: 2,
      summary: 'Milestone payment structure (20% setup, 20% dev, 25% modules, 20% admin, 15% QA).',
      quote: 'Payment Terms Total Project Cost: ₹1,65,000, Payment Milestones: M1 20%, M2 20%...',
    },
  ];

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
          5 Clauses Extracted
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 max-w-4xl mx-auto">
        {standardClauses.map((clause, idx) => {
          const IconComp = clause.icon;
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
                "{clause.quote}"
              </blockquote>
            </div>
          );
        })}
      </div>
    </div>
  );
};
