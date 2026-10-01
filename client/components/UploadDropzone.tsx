import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { uploadDocumentFile } from '../lib/api';
import { LegalDocument } from '../types';

interface UploadDropzoneProps {
  onDocumentUploaded: (doc: LegalDocument) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onDocumentUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setErrorMessage('Invalid file format. Only PDF and DOCX documents are supported.');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedDoc = await uploadDocumentFile(file);
      onDocumentUploaded(uploadedDoc);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
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
        className={`group relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 shadow-inner'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files)}
          accept=".pdf,.docx"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-3 text-blue-400">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse"></div>
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 relative z-10" />
            </div>
            <p className="text-xs font-bold text-slate-200">Processing Contract Text...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Extracting pages & building clause index</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
              Upload Contract (PDF or DOCX)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Drag & drop file or click to browse (up to 150+ pgs)
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-start space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-xs backdrop-blur-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
