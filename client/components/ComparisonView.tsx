import React, { useState } from 'react';
import { LegalDocument, ComparisonResult } from '../types';
import { compareTwoContracts } from '../lib/api';
import { GitCompare, AlertTriangle, Filter, Loader2, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';

interface ComparisonViewProps {
  documents: LegalDocument[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ documents }) => {
  const [docAId, setDocAId] = useState<string>('');
  const [docBId, setDocBId] = useState<string>('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [significanceFilter, setSignificanceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const handleCompare = async () => {
    if (!docAId || !docBId) {
      setError('Please select both Original Document A and Revised Document B.');
      return;
    }
    if (docAId === docBId) {
      setError('Document A and Document B must be different contracts.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await compareTwoContracts(docAId, docBId);
      setComparison(result);
    } catch (err: any) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredChanges = comparison
    ? comparison.changes.filter(
        (c) => significanceFilter === 'all' || c.significance === significanceFilter
      )
    : [];

  const highSigCount = comparison ? comparison.changes.filter((c) => c.significance === 'high').length : 0;
  const addedCount = comparison ? comparison.changes.filter((c) => c.changeType === 'added').length : 0;
  const modifiedCount = comparison ? comparison.changes.filter((c) => c.changeType === 'modified').length : 0;
  const removedCount = comparison ? comparison.changes.filter((c) => c.changeType === 'removed').length : 0;

  const getSignificanceBadge = (sig: 'high' | 'medium' | 'low') => {
    switch (sig) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
            High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Low
          </span>
        );
    }
  };

  const getChangeTypeBadge = (ct: 'added' | 'removed' | 'modified') => {
    switch (ct) {
      case 'added':
        return (
          <span className="text-emerald-700 dark:text-emerald-300 font-bold uppercase text-[10px] bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40 flex items-center space-x-1">
            <PlusCircle className="w-3 h-3" />
            <span>Clause Added</span>
          </span>
        );
      case 'removed':
        return (
          <span className="text-rose-700 dark:text-rose-300 font-bold uppercase text-[10px] bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/40 flex items-center space-x-1">
            <MinusCircle className="w-3 h-3" />
            <span>Clause Removed</span>
          </span>
        );
      case 'modified':
        return (
          <span className="text-amber-700 dark:text-amber-300 font-bold uppercase text-[10px] bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>Substantive Change</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden text-slate-800 dark:text-slate-200 transition-colors">
      {/* Selector Control Panel */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 mb-3">
          <GitCompare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Contract Version Comparison
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Base Contract (Original Version A)
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select Original Contract --</option>
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.originalName} ({d.fileType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Revised Contract (Target Version B)
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select Revised Contract --</option>
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.originalName} ({d.fileType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCompare}
            disabled={loading || !docAId || !docBId}
            className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center space-x-2 transition-all shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
            <span>{loading ? 'Analyzing Differences...' : 'Compare Versions'}</span>
          </button>

          {/* Significance Filter */}
          {comparison && (
            <div className="flex items-center space-x-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Filter:</span>
              {(['all', 'high', 'medium', 'low'] as const).map((sig) => (
                <button
                  key={sig}
                  onClick={() => setSignificanceFilter(sig)}
                  className={`capitalize px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    significanceFilter === sig
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {sig}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Metrics Bar */}
      {comparison && (
        <div className="bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Total Changes</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{comparison.changes.length}</span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-200 dark:border-rose-900/30 text-center">
            <span className="text-rose-600 dark:text-rose-400 block text-[10px] font-bold uppercase">High Risk</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{highSigCount}</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/30 text-center">
            <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] font-bold uppercase">Added Clauses</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{addedCount}</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200 dark:border-amber-900/30 text-center">
            <span className="text-amber-600 dark:text-amber-400 block text-[10px] font-bold uppercase">Modified Clauses</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{modifiedCount}</span>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-5xl mx-auto w-full">
        {!comparison ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs">
            Select two contract versions above and click "Compare Versions" to run side-by-side clause analysis.
          </div>
        ) : filteredChanges.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            No changes found matching "{significanceFilter}" filter.
          </div>
        ) : (
          filteredChanges.map((change, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{change.section}</h4>
                  {getChangeTypeBadge(change.changeType)}
                </div>
                {getSignificanceBadge(change.significance)}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                {change.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                {change.oldText && (
                  <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg p-3">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">
                      Original Text (Document A):
                    </span>
                    <p className="font-sans text-rose-900 dark:text-rose-200/90 whitespace-pre-wrap leading-relaxed">
                      {change.oldText}
                    </p>
                  </div>
                )}

                {change.newText && (
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-3">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                      Revised Text (Document B):
                    </span>
                    <p className="font-sans text-emerald-900 dark:text-emerald-200/90 whitespace-pre-wrap leading-relaxed">
                      {change.newText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

