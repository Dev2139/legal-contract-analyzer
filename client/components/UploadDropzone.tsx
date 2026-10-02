import React, { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle, FilePlus } from 'lucide-react';
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
      setErrorMessage('Please upload a PDF or DOCX contract.');
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
          accept=".pdf,.docx"
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
            <span className="font-medium">Upload PDF / DOCX</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-2 text-rose-600 dark:text-rose-400 text-[11px] flex items-center space-x-1.5 p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

