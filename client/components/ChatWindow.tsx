import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Sparkles, MessageSquare, Bot, User, Check, Copy, HelpCircle, FileText, ArrowRight } from 'lucide-react';
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
    'What is the termination notice period?',
    'What is the governing law?',
    'Are there any penalty clauses?',
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
      alert('Please upload or select a contract from the left sidebar first.');
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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-10 px-4 max-w-lg mx-auto">
            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Legal Contract Assistant
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Upload your agreement or select a contract from the left sidebar, then ask any question.
            </p>

            {/* Simple 3-Step Guide for First-Time Users */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-left border border-slate-800 bg-slate-900/60 p-3.5 rounded-xl">
              <div className="text-xs">
                <span className="font-bold text-blue-400 block mb-0.5">1. Upload</span>
                <span className="text-[11px] text-slate-400">PDF or DOCX contract</span>
              </div>
              <div className="text-xs">
                <span className="font-bold text-blue-400 block mb-0.5">2. Ask</span>
                <span className="text-[11px] text-slate-400">Any question below</span>
              </div>
              <div className="text-xs">
                <span className="font-bold text-blue-400 block mb-0.5">3. Verify</span>
                <span className="text-[11px] text-slate-400">Click quote to view page</span>
              </div>
            </div>

            {/* Quick Starter Prompts */}
            <div className="mt-5">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((promptText, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(promptText)}
                    disabled={selectedDocuments.length === 0}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
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
                <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`group relative max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {/* Copy Button */}
                {msg.content && msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopyText(msg.content, idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded transition-opacity opacity-0 group-hover:opacity-100"
                    title="Copy answer"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Verified Citations List */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Verified Citations (Click to View Source Page):
                    </p>
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
                <div className="p-2 bg-slate-800 text-slate-300 rounded-lg flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={
              selectedDocuments.length > 0
                ? "Ask a question about selected contract(s)..."
                : "Select a contract from left sidebar to ask questions..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={selectedDocuments.length === 0}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />

          {isStreaming ? (
            <button
              onClick={handleStopGeneration}
              className="bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={() => handleSendMessage()}
              disabled={selectedDocuments.length === 0 || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
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
