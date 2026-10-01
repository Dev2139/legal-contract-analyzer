import React, { useEffect, useState, useRef } from 'react';
import { LegalDocument, DocumentPage, Citation } from '../types';
import { fetchDocumentPages } from '../lib/api';
import { BookOpen, ChevronLeft, ChevronRight, Search, Highlighter, CheckCircle2, FileText } from 'lucide-react';

interface DocumentViewerProps {
  document: LegalDocument | null;
  targetCitation: Citation | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, targetCitation }) => {
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Handle citation navigation & text highlight scroll
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
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-8">
        <BookOpen className="w-12 h-12 mb-3 text-slate-700" />
        <h3 className="text-base font-semibold text-slate-400">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Select a document from the library on the left or click a verified citation quote in chat to view its source passage.
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
        <mark key={i} className="bg-amber-400/40 text-amber-200 px-1 py-0.5 rounded border border-amber-400/60 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex-1 bg-slate-950 border-l border-slate-800 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Viewer Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <h3 className="text-xs font-bold text-slate-200 truncate" title={document.originalName}>
            {document.originalName}
          </h3>
        </div>

        {/* Search & Page Navigation Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs">
            <button
              disabled={currentPage <= 1}
              onClick={() => {
                const nextP = Math.max(1, currentPage - 1);
                setCurrentPage(nextP);
                pageRefs.current.get(nextP)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-300">
              Page {currentPage} of {pages.length || document.pageCount || 1}
            </span>
            <button
              disabled={currentPage >= pages.length}
              onClick={() => {
                const nextP = Math.min(pages.length, currentPage + 1);
                setCurrentPage(nextP);
                pageRefs.current.get(nextP)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="disabled:opacity-40 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Target Citation Highlight Banner */}
      {targetCitation && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center space-x-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">Highlighting verified quote on Page {targetCitation.page}:</span>
            <span className="italic truncate">"{targetCitation.quote}"</span>
          </div>
        </div>
      )}

      {/* Pages Render Stream */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">
            Loading document text...
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
                className={`bg-slate-900 border rounded-xl p-6 shadow-md transition-all duration-300 ${
                  isTargetPage
                    ? 'border-amber-500/80 ring-1 ring-amber-500/40 shadow-amber-500/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Page {p.pageNumber}
                  </span>
                  {isTargetPage && (
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Target Passage
                    </span>
                  )}
                </div>

                <div className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
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
