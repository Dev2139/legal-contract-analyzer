import React, { useEffect, useState, useRef } from 'react';
import { LegalDocument, DocumentPage, Citation } from '../types';
import { fetchDocumentPages } from '../lib/api';
import { BookOpen, ChevronLeft, ChevronRight, Search, FileText, ZoomIn, ZoomOut, RotateCcw, Copy, Check } from 'lucide-react';

interface DocumentViewerProps {
  document: LegalDocument | null;
  targetCitation: Citation | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, targetCitation }) => {
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [copiedPage, setCopiedPage] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!document) {
      setPages([]);
      return;
    }
    setLoading(true);
    fetchDocumentPages(document._id)
      .then((data) => {
        setPages(data);
        setCurrentPage(1);
      })
      .catch((err) => console.error('Failed to load document pages:', err))
      .finally(() => setLoading(false));
  }, [document]);

  // Handle citation navigation & scroll to target page
  useEffect(() => {
    if (targetCitation && targetCitation.page) {
      setCurrentPage(targetCitation.page);
      const pageEl = pageRefs.current.get(targetCitation.page);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [targetCitation]);

  if (!document) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-6 border-l border-slate-800">
        <BookOpen className="w-8 h-8 mb-2 text-slate-700" />
        <h3 className="text-xs font-semibold text-slate-400">Document Viewer</h3>
        <p className="text-[11px] text-slate-500 mt-1 max-w-xs text-center">
          Click a verified quote in chat to view and highlight its source passage.
        </p>
      </div>
    );
  }

  const highlightText = (text: string, highlightQuote?: string, search?: string) => {
    if (!highlightQuote && !search) return text;

    const term = highlightQuote || search || '';
    if (!term.trim()) return text;

    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-amber-400/30 text-amber-200 px-1 py-0.5 rounded border border-amber-400/50 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleCopyPageText = (text: string, pageNum: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPage(pageNum);
    setTimeout(() => setCopiedPage(null), 2000);
  };

  return (
    <div className="flex-1 bg-slate-950 border-l border-slate-800 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Viewer Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <h3 className="text-xs font-semibold text-slate-200 truncate max-w-[180px]" title={document.originalName}>
            {document.originalName}
          </h3>
        </div>

        {/* Search, Zoom & Page Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-28"
            />
          </div>

          {/* Page Navigator */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <button
              disabled={currentPage <= 1}
              onClick={() => {
                const nextP = Math.max(1, currentPage - 1);
                setCurrentPage(nextP);
                pageRefs.current.get(nextP)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="disabled:opacity-40 hover:text-white text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-300 text-[11px]">
              {currentPage} / {pages.length || document.pageCount || 1}
            </span>
            <button
              disabled={currentPage >= pages.length}
              onClick={() => {
                const nextP = Math.min(pages.length, currentPage + 1);
                setCurrentPage(nextP);
                pageRefs.current.get(nextP)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="disabled:opacity-40 hover:text-white text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages View Container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Loading document...
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No readable text pages found.
          </div>
        ) : (
          pages.map((p) => {
            const isTargetPage = targetCitation?.page === p.pageNumber;
            return (
              <div
                key={p._id || p.pageNumber}
                ref={(el) => {
                  if (el) pageRefs.current.set(p.pageNumber, el);
                }}
                className={`bg-slate-900 border rounded-xl p-5 shadow-sm transition-colors ${
                  isTargetPage
                    ? 'border-amber-500/80 ring-1 ring-amber-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[11px] text-slate-400 font-semibold">
                  <span>Page {p.pageNumber}</span>
                  {isTargetPage && (
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                      Highlighted Source
                    </span>
                  )}
                </div>

                {/* Clean Readable Sans-Serif Document Text */}
                <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                  {highlightText(
                    p.text,
                    isTargetPage ? targetCitation.quote : undefined,
                    searchQuery
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
