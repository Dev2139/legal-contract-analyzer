import React, { useState } from 'react';
import { LegalDocument, ResearchRun, ResearchStep, Citation } from '../types';
import { streamResearchApi } from '../lib/api';
import { Sparkles, CheckCircle2, Loader2, Bot, Search, FileText, AlertCircle } from 'lucide-react';
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
      setError('Please upload or select at least one contract for research.');
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
    <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Research Controls Banner */}
      <div className="p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">Agentic Multi-Round Contract Research</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
              placeholder="e.g. Find all termination notice periods and financial penalties across clauses..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={handleStartResearch}
              disabled={isRunning || !question.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs px-5 py-2 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-blue-600/20"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isRunning ? 'Agent Researching...' : 'Run Agentic Research'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Step-by-Step Live Timeline */}
        {steps.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Agentic Multi-Round Tool Activity Timeline</span>
            </h3>

            <div className="space-y-2.5">
              {steps.map((st, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-blue-400 uppercase text-[10px] tracking-wider mr-2">
                      Tool: {st.tool}
                    </span>
                    <span className="text-slate-300">{st.result || `Executing step ${st.stepNumber}...`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Research Findings */}
        {researchRun && researchRun.finalAnswer && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Synthesized Agentic Research Findings</h3>
            </div>

            <div className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed font-sans">
              {researchRun.finalAnswer}
            </div>

            {researchRun.citations && researchRun.citations.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Supporting Verified Quotations:
                </h4>
                {researchRun.citations.map((cit, cIdx) => (
                  <CitationCard key={cIdx} citation={cit} onSelectCitation={onSelectCitation} />
                ))}
              </div>
            )}
          </div>
        )}

        {!isRunning && steps.length === 0 && (
          <div className="text-center py-20 text-slate-500 text-xs">
            Enter a research prompt above and click "Run Agentic Research" to launch multi-round tool calling.
          </div>
        )}
      </div>
    </div>
  );
};
