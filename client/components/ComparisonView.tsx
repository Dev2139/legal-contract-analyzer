import React, { useState } from 'react';
import { LegalDocument, ComparisonResult, ContractChange } from '../types';
import { compareTwoContracts } from '../lib/api';
import { GitCompare, AlertTriangle, Filter, Loader2, PlusCircle, MinusCircle, RefreshCw, BarChart2 } from 'lucide-react';

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
      setError('Please select both Document A and Document B.');
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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">
            High Significance
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium Significance
          </span>
        );
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Low Significance
          </span>
        );
    }
  };

  const getChangeTypeBadge = (ct: 'added' | 'removed' | 'modified') => {
    switch (ct) {
      case 'added':
        return (
          <span className="text-emerald-400 font-extrabold uppercase text-[10px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center space-x-1">
            <PlusCircle className="w-3 h-3" />
            <span>Clause Added</span>
          </span>
        );
      case 'removed':
        return (
          <span className="text-rose-400 font-extrabold uppercase text-[10px] bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center space-x-1">
            <MinusCircle className="w-3 h-3" />
            <span>Clause Removed</span>
          </span>
        );
      case 'modified':
        return (
          <span className="text-amber-400 font-extrabold uppercase text-[10px] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>Substantive Change</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Selector Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-2 mb-3">
          <GitCompare className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">Compare Two Contract Versions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Base Document A (Original Version)
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 shadow-inner"
            >
              <option value="">-- Select Original Document A --</option>
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.originalName} ({d.fileType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Revised Document B (Target Version)
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 shadow-inner"
            >
              <option value="">-- Select Revised Document B --</option>
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.originalName} ({d.fileType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCompare}
            disabled={loading || !docAId || !docBId}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
            <span>{loading ? 'Analyzing Differences...' : 'Compare Contracts'}</span>
          </button>

          {/* Significance Filter */}
          {comparison && (
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-semibold">Filter Significance:</span>
              {(['all', 'high', 'medium', 'low'] as const).map((sig) => (
                <button
                  key={sig}
                  onClick={() => setSignificanceFilter(sig)}
                  className={`capitalize px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    significanceFilter === sig
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {sig}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comparison Metrics Banner */}
      {comparison && (
        <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Changes</span>
            <span className="text-base font-extrabold text-white">{comparison.changes.length}</span>
          </div>
          <div className="bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20 text-center">
            <span className="text-rose-400 block text-[10px] font-bold uppercase">High Risk Changes</span>
            <span className="text-base font-extrabold text-rose-400">{highSigCount}</span>
          </div>
          <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20 text-center">
            <span className="text-emerald-400 block text-[10px] font-bold uppercase">Added Clauses</span>
            <span className="text-base font-extrabold text-emerald-400">{addedCount}</span>
          </div>
          <div className="bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20 text-center">
            <span className="text-amber-400 block text-[10px] font-bold uppercase">Modified Clauses</span>
            <span className="text-base font-extrabold text-amber-400">{modifiedCount}</span>
          </div>
        </div>
      )}

      {/* Comparison Results Cards */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!comparison ? (
          <div className="text-center py-20 text-slate-500 text-xs">
            Select two contract versions above and click "Compare Contracts" to run clause-level difference analysis.
          </div>
        ) : filteredChanges.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs font-semibold">
            No changes found matching "{significanceFilter}" filter.
          </div>
        ) : (
          filteredChanges.map((change, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-md space-y-3.5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h4 className="text-xs font-extrabold text-slate-100">{change.section}</h4>
                  {getChangeTypeBadge(change.changeType)}
                </div>
                {getSignificanceBadge(change.significance)}
              </div>

              <p className="text-xs text-slate-300 font-medium bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {change.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {change.oldText && (
                  <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3.5">
                    <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block mb-1.5">
                      Document A Original:
                    </span>
                    <p className="text-xs font-mono text-rose-200/90 whitespace-pre-wrap leading-relaxed">
                      {change.oldText}
                    </p>
                  </div>
                )}

                {change.newText && (
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3.5">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1.5">
                      Document B Revised:
                    </span>
                    <p className="text-xs font-mono text-emerald-200/90 whitespace-pre-wrap leading-relaxed">
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
