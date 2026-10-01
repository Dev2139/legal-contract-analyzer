import React from 'react';
import { LegalDocument } from '../types';
import { UploadDropzone } from './UploadDropzone';
import { DocumentCard } from './DocumentCard';
import { FolderOpen } from 'lucide-react';

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
  return (
    <aside className="w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Clean Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Contracts</h2>
        </div>
        <span className="text-[11px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded-full">
          {documents.length}
        </span>
      </div>

      {/* Upload Zone */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <UploadDropzone onDocumentUploaded={onDocumentUploaded} />
      </div>

      {/* Selected Indicator */}
      {selectedDocumentIds.length > 0 && (
        <div className="bg-blue-600/10 border-b border-blue-500/20 px-3.5 py-1.5 text-[11px] text-blue-300 font-medium">
          ✓ {selectedDocumentIds.length} contract(s) selected for analysis
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-10 px-3 text-slate-500 text-xs">
            No contracts uploaded yet.
          </div>
        ) : (
          documents.map((doc) => (
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
