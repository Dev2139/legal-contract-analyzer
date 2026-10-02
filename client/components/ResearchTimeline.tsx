import React, { useState } from 'react';
import { LegalDocument, ResearchRun, ResearchStep, Citation } from '../types';
import { streamResearchApi } from '../lib/api';
import { Search, CheckCircle2, Loader2, Bot, AlertCircle, FileText } from 'lucide-react';
import { CitationCard } from './CitationCard';

interface ResearchTimelineProps {
  documents: LegalDocument[];
  onSelectCitation: (citation: Citation) => void;
}

export const ResearchTimeline: React.FC<ResearchTimelineProps> = ({ documents, onSelectCitation }) => {
  const [question, setQuestion] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [steps, setSteps] = useState<ResearchStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [researchRun, setResearchRun] = useState<ResearchRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartResearch = () => {
    if (!question.trim()) return;
    const docIds = selectedDocId ? [selectedDocId] : documents.map((d) => d._id);

    if (docIds.length === 0) {
      setError('Please upload or select at least one contract for deep research.');
      return;
    }

    setError(null);
    setSteps([]);
    setResearchRun(null);
    setIsRunning(true);

    streamResearchApi(
      docIds,
      question.trim(),
      (newStep) => {
        setSteps((prev) => [...prev, newStep]);
      },
      (doneRun) => {
        setResearchRun(doneRun);
        setIsRunning(false);
      },
      (errStr) => {
        setError(errStr);
        setIsRunning(false);
      }
    );
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden text-slate-800 dark:text-slate-200 transition-colors">
      {/* Search & Control Banner */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 mb-3">
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Deep Contract Analysis
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">-- All Uploaded Contracts --</option>
            {documents.map((d) => (
              <option key={d._id} value={d._id}>
                {d.originalName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="e.g. Analyze all termination notice requirements & penalties across clauses..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleStartResearch}
            disabled={isRunning || !question.trim()}
            className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isRunning ? 'Analyzing...' : 'Run Deep Analysis'}</span>
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Results Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-4xl mx-auto w-full">
        {/* Analysis Progress Steps */}
        {steps.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Analysis Progress</span>
            </h3>

            <div className="space-y-2">
              {steps.map((st, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 mr-2">
                      Step {st.stepNumber}:
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">{st.result || `Scanning contract...`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Synthesized Findings */}
        {researchRun && researchRun.finalAnswer && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analysis Findings & Summary</h3>
            </div>

            <div className="whitespace-pre-wrap text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {researchRun.finalAnswer}
            </div>

            {researchRun.citations && researchRun.citations.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Verified Contract Quotations:
                </h4>
                {researchRun.citations.map((cit, cIdx) => (
                  <CitationCard key={cIdx} citation={cit} onSelectCitation={onSelectCitation} />
                ))}
              </div>
            )}
          </div>
        )}

        {!isRunning && steps.length === 0 && (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs">
            Enter a prompt above and click "Run Deep Analysis" to launch multi-pass clause extraction.
          </div>
        )}
      </div>
    </div>
  );
};

