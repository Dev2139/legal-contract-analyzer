import React, { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle, FilePlus, FileText, Check, Plus } from 'lucide-react';
import { uploadDocumentFile, uploadPastedContract } from '../lib/api';
import { LegalDocument } from '../types';

interface UploadDropzoneProps {
  onDocumentUploaded: (doc: LegalDocument) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onDocumentUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'docx', 'txt', 'md', 'json'];
    if (!ext || !validExts.includes(ext)) {
      setErrorMessage('Please upload a PDF, DOCX, TXT, or Markdown contract.');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedDoc = await uploadDocumentFile(file);
      onDocumentUploaded(uploadedDoc);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSavePastedContract = () => {
    if (!pastedContent.trim()) {
      setErrorMessage('Please paste the contract text.');
      return;
    }

    const title = pastedTitle.trim() || `Contract_${new Date().toLocaleTimeString().replace(/:/g, '-')}`;
    const newDoc = uploadPastedContract(title, pastedContent.trim());
    onDocumentUploaded(newDoc);
    setPastedTitle('');
    setPastedContent('');
    setShowPasteModal(false);
  };

  return (
    <div className="w-full space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
            : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files)}
          accept=".pdf,.docx,.txt,.md,.json"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex items-center justify-center space-x-2 py-1.5 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing contract...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
            <FilePlus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="font-medium">Upload PDF / DOCX / TXT</span>
          </div>
        )}
      </div>

      {/* Paste Contract Option Button */}
      <button
        type="button"
        onClick={() => setShowPasteModal(true)}
        className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5"
      >
        <FileText className="w-3.5 h-3.5 text-slate-500" />
        <span>Or Paste Contract Text</span>
      </button>

      {errorMessage && (
        <div className="mt-2 text-rose-600 dark:text-rose-400 text-[11px] flex items-center space-x-1.5 p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Paste Text Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-3 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Paste Legal Contract
              </h3>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Contract Title</label>
              <input
                type="text"
                placeholder="e.g. Master Services Agreement V3"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Contract Text / Clauses</label>
              <textarea
                rows={8}
                placeholder="Paste contract clauses, terms, or entire agreement here..."
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePastedContract}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
              >
                Add Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
