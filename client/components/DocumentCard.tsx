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
  const getStatusBadge = () => {
    switch (document.status) {
      case 'ready':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Ready ({document.pageCount || 1} pgs)</span>
          </span>
        );
      case 'processing':
      case 'uploading':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
      className={`group relative p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 shadow-sm'
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
            className="mt-1 w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
          />
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl flex-shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-200 transition-colors" title={document.originalName}>
              {document.originalName}
            </h4>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="uppercase text-[9px] font-extrabold tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
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
          className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all opacity-80 group-hover:opacity-100"
          title="Delete document"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {document.status === 'failed' && document.error && (
        <div className="mt-2.5 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 leading-relaxed">
          <p className="font-bold text-rose-400 flex items-center space-x-1 mb-0.5">
            <AlertTriangle className="w-3 h-3" />
            <span>Processing Error:</span>
          </p>
          <p>{document.error}</p>
        </div>
      )}
    </div>
  );
};
