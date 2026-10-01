import React from 'react';
import { LegalDocument } from '../types';
import { UploadDropzone } from './UploadDropzone';
import { DocumentCard } from './DocumentCard';
import { FolderOpen, Layers } from 'lucide-react';

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
    <aside className="w-80 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold tracking-tight text-white">Document Library</h2>
        </div>
        <span className="bg-slate-800 text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-full">
          {documents.length}
        </span>
      </div>

      {/* Upload Zone */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <UploadDropzone onDocumentUploaded={onDocumentUploaded} />
      </div>

      {/* Document Selection Banner */}
      {selectedDocumentIds.length > 0 && (
        <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-2 flex items-center justify-between text-xs text-blue-300">
          <div className="flex items-center space-x-1.5 font-medium">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>{selectedDocumentIds.length} document(s) selected</span>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {documents.length === 0 ? (
          <div className="text-center py-10 px-4">
            <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No documents uploaded yet</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Upload PDF or DOCX contracts above to start analyzing.
            </p>
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
