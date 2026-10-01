import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
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
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
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
          <div className="flex flex-col items-center justify-center py-2 text-blue-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm font-semibold">Uploading & parsing document...</p>
            <p className="text-xs text-slate-400 mt-1">Extracting text and structure</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-full mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Drop contract PDF or DOCX here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports large documents up to 150+ pages (max 50MB)
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-start space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
