import React from 'react';
import { FileText, Trash2, Loader2, FileCode, Check } from 'lucide-react';
import { LegalDocument } from '../types';

interface DocumentCardProps {
  document: LegalDocument;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleCheck: (checked: boolean) => void;
  onDelete: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isSelected,
  isChecked,
  onSelect,
  onToggleCheck,
  onDelete,
}) => {
  const isPdf = document.fileType === 'pdf';

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
        isSelected
          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600/80 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850'
      }`}
    >
      <div className="flex items-start space-x-2.5">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck(!isChecked);
          }}
          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border cursor-pointer transition-colors ${
            isChecked
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-transparent hover:border-blue-400'
          }`}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 mb-1">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isPdf
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
              }`}
            >
              {document.fileType}
            </span>

            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
              {document.pageCount || 1} {document.pageCount === 1 ? 'page' : 'pages'}
            </span>
          </div>

          <h4
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug"
            title={document.originalName}
          >
            {document.originalName}
          </h4>

          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            {document.status === 'ready' && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Ready for analysis</span>
              </span>
            )}
            {document.status === 'processing' && (
              <span className="text-blue-600 dark:text-blue-400 font-medium text-[10px] flex items-center space-x-1">
                <Loader2 className="w-3 h-3 animate-spin inline" />
                <span>Extracting pages...</span>
              </span>
            )}
            {document.status === 'failed' && (
              <span className="text-rose-600 dark:text-rose-400 font-medium text-[10px]">
                Processing failed
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 rounded transition-all"
              title="Delete contract"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

