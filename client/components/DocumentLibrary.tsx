import React, { useState } from 'react';
import { LegalDocument } from '../types';
import { UploadDropzone } from './UploadDropzone';
import { DocumentCard } from './DocumentCard';
import { FolderOpen, Search, CheckSquare, Square } from 'lucide-react';

interface DocumentLibraryProps {
  documents: LegalDocument[];
  activeDocumentId: string | null;
  selectedDocumentIds: string[];
  onDocumentUploaded: (doc: LegalDocument) => void;
  onSelectDocument: (id: string) => void;
  onToggleDocumentCheck: (id: string, checked: boolean) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  activeDocumentId,
  selectedDocumentIds,
  onDocumentUploaded,
  onSelectDocument,
  onToggleDocumentCheck,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = documents.length > 0 && selectedDocumentIds.length === documents.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      documents.forEach((d) => onToggleDocumentCheck(d._id, false));
    } else {
      documents.forEach((d) => onToggleDocumentCheck(d._id, true));
    }
  };

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden text-slate-800 dark:text-slate-200 transition-colors z-10 flex-shrink-0">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Contracts
          </h2>
        </div>
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
          {documents.length}
        </span>
      </div>

      {/* Upload Zone */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <UploadDropzone onDocumentUploaded={onDocumentUploaded} />
      </div>

      {/* Search Input & Select All Action Bar */}
      {documents.length > 0 && (
        <div className="px-3 pt-3 pb-2 space-y-2 border-b border-slate-100 dark:border-slate-800/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
            >
              {allSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {selectedDocumentIds.length} active
            </span>
          </div>
        </div>
      )}

      {/* Document Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-10 px-3 text-slate-400 dark:text-slate-500 text-xs">
            {documents.length === 0
              ? 'No contracts uploaded yet.'
              : 'No matching contracts found.'}
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              isSelected={activeDocumentId === doc._id}
              isChecked={selectedDocumentIds.includes(doc._id)}
              onSelect={() => onSelectDocument(doc._id)}
              onToggleCheck={(checked) => onToggleDocumentCheck(doc._id, checked)}
              onDelete={() => onDeleteDocument(doc._id)}
            />
          ))
        )}
      </div>
    </aside>
  );
};

