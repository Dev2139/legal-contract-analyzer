import React from 'react';
import { FileText, Trash2, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
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
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-600/10 border-blue-500/80 shadow-sm'
          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onToggleCheck(e.target.checked);
            }}
            className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
          />
          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-200 truncate" title={document.originalName}>
              {document.originalName}
            </h4>
            <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-400">
              <span className="uppercase font-bold text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                {document.fileType}
              </span>
              <span>•</span>
              {document.status === 'ready' && (
                <span className="text-emerald-400 font-medium">Ready ({document.pageCount || 1} pgs)</span>
              )}
              {document.status === 'processing' && (
                <span className="text-blue-400 font-medium flex items-center space-x-1">
                  <Loader2 className="w-3 h-3 animate-spin inline" />
                  <span>Processing...</span>
                </span>
              )}
              {document.status === 'failed' && (
                <span className="text-rose-400 font-medium">Error</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors ml-2"
          title="Delete document"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {document.status === 'failed' && document.error && (
        <p className="mt-2 text-[11px] text-rose-300 bg-rose-500/10 p-2 rounded border border-rose-500/20">
          {document.error}
        </p>
      )}
    </div>
  );
};
