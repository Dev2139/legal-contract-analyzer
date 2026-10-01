import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Sparkles, MessageSquare, Bot, User, HelpCircle, Check, Copy, Quote, ShieldCheck, Clock } from 'lucide-react';
import { Message, Citation, LegalDocument } from '../types';
import { streamChatApi } from '../lib/api';
import { CitationCard } from './CitationCard';

interface ChatWindowProps {
  selectedDocuments: LegalDocument[];
  onSelectCitation: (citation: Citation) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ selectedDocuments, onSelectCitation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'What is the liability cap?',
    'Compare termination notice periods',
    'What is the governing law & jurisdiction?',
    'Are there any financial penalty clauses?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isStreaming) return;

    if (selectedDocuments.length === 0) {
      alert('Please select at least one document from the library on the left.');
      return;
    }

    const docIds = selectedDocuments.map((d) => d._id);
    setInputMessage('');

    const userMessage: Message = {
      role: 'user',
      content: query.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const assistantMessageIndex = messages.length + 1;
    let streamedText = '';

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        citations: [],
        createdAt: new Date().toISOString(),
      },
    ]);

    streamChatApi(
      docIds,
      query.trim(),
      conversationId,
      (data) => {
        if (data.conversationId) setConversationId(data.conversationId);
      },
      (chunk) => {
        streamedText += chunk;
        setMessages((prev) => {
          const newArr = [...prev];
          if (newArr[assistantMessageIndex]) {
            newArr[assistantMessageIndex] = {
              ...newArr[assistantMessageIndex],
              content: streamedText,
            };
          }
          return newArr;
        });
      },
      (doneData) => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        setMessages((prev) => {
          const newArr = [...prev];
          if (newArr[assistantMessageIndex]) {
            newArr[assistantMessageIndex] = {
              ...newArr[assistantMessageIndex],
              content: doneData.answer || streamedText,
              citations: doneData.citations || [],
            };
          }
          return newArr;
        });
      },
      (errMsg) => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        console.error('Chat error:', errMsg);
      },
      abortController.signal
    );
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  /**
   * Formats raw markdown & blockquotes into polished React response elements.
   */
  const renderFormattedResponse = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((line, lIdx) => {
      const trimmed = line.trim();

      // Headers (### Header)
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={lIdx} className="text-xs font-bold text-blue-300 mt-3 mb-1.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{trimmed.replace(/^###\s*/, '')}</span>
          </h3>
        );
      }

      // Blockquotes (> "...")
      if (trimmed.startsWith('>') || trimmed.startsWith('Quote:')) {
        const cleanQuote = trimmed.replace(/^>\s*"?|"?$/g, '');
        return (
          <div
            key={lIdx}
            className="my-2.5 p-3.5 bg-slate-950 border-l-4 border-amber-400 rounded-r-xl shadow-inner text-amber-200/90 font-mono text-[11px] leading-relaxed relative overflow-hidden"
          >
            <Quote className="w-6 h-6 text-amber-500/10 absolute top-2 right-2 pointer-events-none" />
            <p className="italic">"{cleanQuote}"</p>
          </div>
        );
      }

      // Bullet items (- Bullet)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.replace(/^[-*]\s*/, '');
        // Highlight bold text (**bold**)
        const parts = bulletText.split(/(\*\*[^*]+\*\*)/);
        return (
          <div key={lIdx} className="flex items-start space-x-2 my-1 text-slate-300 leading-relaxed">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
            <span>
              {parts.map((part, pIdx) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={pIdx} className="text-white font-bold">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  part
                )
              )}
            </span>
          </div>
        );
      }

      // Normal text with bold parsing
      const parts = line.split(/(\*\*[^*]+\*\*)/);
      return (
        <p key={lIdx} className="my-1 leading-relaxed text-slate-200">
          {parts.map((part, pIdx) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={pIdx} className="text-blue-200 font-bold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Selected Documents Bar */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-100">Contract Analysis Assistant</span>
        </div>
        <div>
          {selectedDocuments.length > 0 ? (
            <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full font-bold text-[11px] shadow-sm flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Querying {selectedDocuments.length} contract(s)</span>
            </span>
          ) : (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-bold text-[11px]">
              No contract selected
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-14 px-4 max-w-lg mx-auto">
            <div className="p-4 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-xl shadow-blue-500/10">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              AI Contract Legal Assistant
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Query liability caps, termination notice periods, governing law, payment terms, or absence of provisions across your uploaded agreements.
            </p>

            {/* Quick Starter Prompt Chips */}
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Suggested Questions:</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((promptText, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(promptText)}
                    disabled={selectedDocuments.length === 0}
                    className="bg-slate-900/90 hover:bg-blue-600/20 hover:border-blue-500/50 border border-slate-800 text-slate-300 text-xs px-3.5 py-2 rounded-xl transition-all font-semibold disabled:opacity-40 shadow-sm"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="p-2.5 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 rounded-2xl border border-blue-500/30 flex-shrink-0 mt-0.5 shadow-md">
                  <Bot className="w-4.5 h-4.5 text-blue-400" />
                </div>
              )}

              <div
                className={`group relative max-w-2xl rounded-2xl p-5 shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none font-medium text-xs leading-relaxed shadow-blue-600/10'
                    : 'bg-slate-900/95 border border-slate-800 text-slate-100 rounded-tl-none text-xs leading-relaxed backdrop-blur-md'
                }`}
              >
                {/* Assistant Message Header Bar */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-blue-400">Lexi AI Legal Analysis</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-[10px] text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        GPT-4o Verified Engine
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyText(msg.content, idx)}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors flex items-center space-x-1"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Response Text / Formatted Markdown */}
                {msg.role === 'assistant' ? (
                  renderFormattedResponse(msg.content)
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}

                {/* Verified Citations Cards */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Supporting Contract Evidence ({msg.citations.length}):</span>
                      </p>
                    </div>
                    {msg.citations.map((cit, cIdx) => (
                      <CitationCard
                        key={cIdx}
                        citation={cit}
                        onSelectCitation={onSelectCitation}
                      />
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="p-2.5 bg-slate-800 text-slate-300 rounded-2xl border border-slate-700 flex-shrink-0 mt-0.5 shadow-md">
                  <User className="w-4.5 h-4.5 text-slate-200" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={
              selectedDocuments.length > 0
                ? "Ask a question about selected contract(s)..."
                : "Select a document on the left to start chat..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={selectedDocuments.length === 0}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors shadow-inner"
          />

          {isStreaming ? (
            <button
              onClick={handleStopGeneration}
              className="bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 px-4 py-3 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={() => handleSendMessage()}
              disabled={selectedDocuments.length === 0 || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white px-5.5 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
