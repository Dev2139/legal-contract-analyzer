import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, CheckCircle2, AlertCircle, Loader2, Shield, Info, ExternalLink } from 'lucide-react';
import { ClientStorage, StoredAIConfig } from '../lib/storage';
import { AIProviderService } from '../lib/aiProvider';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (config: StoredAIConfig) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'local'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = ClientStorage.getAIConfig();
      setProvider(cfg.provider);
      setApiKey(cfg.apiKey || '');
      setModel(cfg.model || (cfg.provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash'));
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (newProvider: 'gemini' | 'openai' | 'local') => {
    setProvider(newProvider);
    setTestResult(null);
    if (newProvider === 'gemini') {
      setModel('gemini-1.5-flash');
    } else if (newProvider === 'openai') {
      setModel('gpt-4o-mini');
    } else {
      setModel('Local Intelligence');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await AIProviderService.testConnection({
        provider,
        apiKey: apiKey.trim(),
        model,
      });
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection test failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const newConfig: StoredAIConfig = {
      provider,
      apiKey: apiKey.trim(),
      model,
    };
    ClientStorage.saveAIConfig(newConfig);
    onConfigSaved(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Provider & API Key Setup</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">100% Client-Side • Zero Backend • Zero Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Privacy Note */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 rounded-xl flex items-start space-x-2 text-[11px] text-blue-900 dark:text-blue-300">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Pure Frontend Execution:</span> Your API key is stored securely in your browser&apos;s localStorage and sent directly to the AI endpoint. No backend server or database ever sees your key or documents.
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Select AI Engine
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  provider === 'gemini'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Google Gemini</span>
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold">Free Key</span>
                </div>
                <div className="text-[10px] mt-1 text-slate-500">Gemini 1.5/2.0 Flash</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('openai')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  provider === 'openai'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">OpenAI</div>
                <div className="text-[10px] mt-1 text-slate-500">GPT-4o Mini / GPT-4o</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('local')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  provider === 'local'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Built-in Engine</span>
                  <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">Offline</span>
                </div>
                <div className="text-[10px] mt-1 text-slate-500">No Key Required</div>
              </button>
            </div>
          </div>

          {/* API Key Input (if not local) */}
          {provider !== 'local' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  {provider === 'gemini' ? 'Google AI Studio API Key' : 'OpenAI API Key'}
                </label>
                {provider === 'gemini' ? (
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Get free key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <span>OpenAI dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Model Selection */}
          {provider === 'gemini' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Gemini Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash (Fast, Recommended)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Next-Gen Ultra Fast)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
              </select>
            </div>
          )}

          {provider === 'openai' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                OpenAI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost Effective)</option>
                <option value="gpt-4o">gpt-4o (Full Flagship Intelligence)</option>
              </select>
            </div>
          )}

          {provider === 'local' && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Deterministic Legal Intelligence Mode</span>
              </div>
              <p>
                Uses client-side lexical extraction, legal synonym dictionary mapping, financial metric parsing, and deterministic quotation verification. No external API key required.
              </p>
            </div>
          )}

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-center space-x-2 text-xs ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span className="font-medium">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          {provider !== 'local' ? (
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 flex items-center space-x-1.5"
            >
              {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
