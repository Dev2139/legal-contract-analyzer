import React, { useEffect, useState, useRef } from 'react';
import { LegalDocument, DocumentPage, Citation } from '../types';
import { fetchDocumentPages } from '../lib/api';
import { BookOpen, ChevronLeft, ChevronRight, Search, Highlighter, CheckCircle2, FileText, ZoomIn, ZoomOut, RotateCcw, Copy, Check } from 'lucide-react';

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
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-8 border-l border-slate-800">
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 mb-3">
          <BookOpen className="w-10 h-10 text-slate-700" />
        </div>
        <h3 className="text-sm font-bold text-slate-300">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs text-center leading-relaxed">
          Select a contract from the library or click a verified quote card in chat to inspect its exact source text.
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
        <mark key={i} className="bg-amber-400/30 text-amber-200 px-1 py-0.5 rounded border border-amber-400/50 font-bold shadow-sm">
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
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-200 truncate max-w-[200px]" title={document.originalName}>
            {document.originalName}
          </h3>
        </div>

        {/* Search, Zoom & Page Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search in viewer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-36 transition-all"
            />
          </div>

          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
              className="text-slate-400 hover:text-white p-0.5"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-400 px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="text-slate-400 hover:text-white p-0.5"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="text-slate-500 hover:text-slate-300 p-0.5 ml-1 border-l border-slate-800"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
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
            <span className="font-bold text-slate-300 text-[11px]">
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

      {/* Target Citation Highlight Banner */}
      {targetCitation && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center space-x-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">Verified Quote Highlight on Page {targetCitation.page}:</span>
            <span className="italic truncate text-amber-200">"{targetCitation.quote}"</span>
          </div>
        </div>
      )}

      {/* Pages Stream View */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs font-bold">
            Loading document pages...
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs font-semibold">
            No page text available.
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
                style={{ fontSize: `${(zoomLevel / 100) * 0.75}rem` }}
                className={`group relative bg-slate-900 border rounded-2xl p-6 shadow-md transition-all duration-300 ${
                  isTargetPage
                    ? 'border-amber-500/80 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Page {p.pageNumber}
                    </span>
                    {isTargetPage && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        Target Passage
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopyPageText(p.text, p.pageNumber)}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors text-xs flex items-center space-x-1"
                    title="Copy page text"
                  >
                    {copiedPage === p.pageNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="whitespace-pre-wrap font-mono text-slate-300 leading-relaxed">
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
