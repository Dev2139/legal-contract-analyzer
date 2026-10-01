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
import { MessageSquare, GitCompare, Sparkles } from 'lucide-react';

export default function Home() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'comparison' | 'research'>('chat');
  const [targetCitation, setTargetCitation] = useState<Citation | null>(null);

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
  };

  const activeDoc = documents.find((d) => d._id === activeDocId) || null;
  const selectedDocs = documents.filter((d) => selectedDocIds.includes(d._id));
  const readyCount = documents.filter((d) => d.status === 'ready').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header documentCount={documents.length} readyCount={readyCount} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Document Library */}
        <DocumentLibrary
          documents={documents}
          activeDocumentId={activeDocId}
          selectedDocumentIds={selectedDocIds}
          onDocumentUploaded={handleDocumentUploaded}
          onSelectDocument={handleSelectDocument}
          onToggleDocumentCheck={handleToggleDocumentCheck}
          onDeleteDocument={handleDeleteDocument}
        />

        {/* Center Column: Mode Tabs & Active Tool */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 border-r border-slate-800 overflow-hidden">
          {/* Navigation Bar Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border-b border-slate-800 px-4 py-2.5 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contract Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'comparison'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>Contract Comparison</span>
            </button>

            <button
              onClick={() => setActiveTab('research')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'research'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Agentic Research</span>
            </button>
          </div>

          {/* Active View Container */}
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

        {/* Right Column: Document Viewer & Highlight Overlay */}
        <DocumentViewer document={activeDoc} targetCitation={targetCitation} />
      </div>
    </div>
  );
};
