'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { DocumentLibrary } from '../components/DocumentLibrary';
import { ChatWindow } from '../components/ChatWindow';
import { ComparisonView } from '../components/ComparisonView';
import { ResearchTimeline } from '../components/ResearchTimeline';
import { DocumentViewer } from '../components/DocumentViewer';
import { fetchDocuments, deleteDocumentById } from '../lib/api';
import { LegalDocument, Citation } from '../types';
import { MessageSquare, GitCompare, Search } from 'lucide-react';

export default function Home() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'comparison' | 'research'>('chat');
  const [targetCitation, setTargetCitation] = useState<Citation | null>(null);

  // Responsive Sidebar Toggle States
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const loadDocuments = () => {
    fetchDocuments()
      .then((docs) => {
        setDocuments(docs);
        if (docs.length > 0 && !activeDocId) {
          setActiveDocId(docs[0]._id);
          setSelectedDocIds([docs[0]._id]);
        }
      })
      .catch((err) => console.error('Error fetching documents:', err));
  };

  useEffect(() => {
    loadDocuments();
    const interval = setInterval(loadDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDocumentUploaded = (newDoc: LegalDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc._id);
    if (!selectedDocIds.includes(newDoc._id)) {
      setSelectedDocIds((prev) => [...prev, newDoc._id]);
    }
  };

  const handleSelectDocument = (id: string) => {
    setActiveDocId(id);
    if (!selectedDocIds.includes(id)) {
      setSelectedDocIds([id]);
    }
  };

  const handleToggleDocumentCheck = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDocIds((prev) => [...prev, id]);
    } else {
      setSelectedDocIds((prev) => prev.filter((dId) => dId !== id));
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocumentById(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      setSelectedDocIds((prev) => prev.filter((dId) => dId !== id));
      if (activeDocId === id) {
        const remaining = documents.filter((d) => d._id !== id);
        setActiveDocId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleSelectCitation = (citation: Citation) => {
    if (citation.documentId) {
      setActiveDocId(citation.documentId);
    }
    setTargetCitation(citation);
    setRightSidebarOpen(true);
  };

  const activeDoc = documents.find((d) => d._id === activeDocId) || null;
  const selectedDocs = documents.filter((d) => selectedDocIds.includes(d._id));
  const readyCount = documents.filter((d) => d.status === 'ready').length;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
        <Header
          documentCount={documents.length}
          readyCount={readyCount}
          activeDocName={activeDoc?.originalName}
          leftSidebarOpen={leftSidebarOpen}
          setLeftSidebarOpen={setLeftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Panel: Contract Library */}
          {leftSidebarOpen && (
            <DocumentLibrary
              documents={documents}
              activeDocumentId={activeDocId}
              selectedDocumentIds={selectedDocIds}
              onDocumentUploaded={handleDocumentUploaded}
              onSelectDocument={handleSelectDocument}
              onToggleDocumentCheck={handleToggleDocumentCheck}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {/* Center Main Panel: Tabs & Views */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
            {/* Segmented Tab Navigation Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 text-xs">
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Q&A Assistant</span>
                </button>

                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'comparison'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare Versions</span>
                </button>

                <button
                  onClick={() => setActiveTab('research')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'research'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Deep Analysis</span>
                </button>
              </div>

              {selectedDocs.length > 0 && (
                <div className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Querying {selectedDocs.length} contract(s)
                </div>
              )}
            </div>

            {/* Active Workspace View */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {activeTab === 'chat' && (
                <ChatWindow
                  selectedDocuments={selectedDocs}
                  onSelectCitation={handleSelectCitation}
                />
              )}
              {activeTab === 'comparison' && <ComparisonView documents={documents} />}
              {activeTab === 'research' && (
                <ResearchTimeline
                  documents={documents}
                  onSelectCitation={handleSelectCitation}
                />
              )}
            </div>
          </main>

          {/* Right Panel: Document Viewer */}
          {rightSidebarOpen && (
            <DocumentViewer document={activeDoc} targetCitation={targetCitation} />
          )}
        </div>
      </div>
    </div>
  );
}

