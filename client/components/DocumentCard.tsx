import React from 'react';
import { FileText, Trash2, CheckCircle2, AlertTriangle, Loader2, BookOpen } from 'lucide-react';
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
  const getStatusBadge = () => {
    switch (document.status) {
      case 'ready':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready ({document.pageCount || 1} pgs)</span>
          </span>
        );
      case 'processing':
      case 'uploading':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 overflow-hidden">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onToggleCheck(e.target.checked);
            }}
            className="mt-1 w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 cursor-pointer"
          />
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300 flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-200 truncate" title={document.originalName}>
              {document.originalName}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="uppercase text-[9px] font-bold tracking-wider text-slate-400 bg-slate-700/40 px-1.5 py-0.5 rounded">
                {document.fileType}
              </span>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
          title="Delete document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {document.status === 'failed' && document.error && (
        <div className="mt-2.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-300">
          <p className="font-semibold text-rose-400">Processing Error:</p>
          <p>{document.error}</p>
        </div>
      )}
    </div>
  );
};
