import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Sparkles, MessageSquare, Bot, User, AlertCircle } from 'lucide-react';
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isStreaming) return;

    if (selectedDocuments.length === 0) {
      alert('Please select at least one document from the library on the left to ask questions.');
      return;
    }

    const docIds = selectedDocuments.map((d) => d._id);
    const userMsgText = inputMessage.trim();
    setInputMessage('');

    const userMessage: Message = {
      role: 'user',
      content: userMsgText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Create draft assistant message
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
      userMsgText,
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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Selected Documents Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-300">Contract Analysis Chat</span>
        </div>
        <div className="text-slate-400">
          {selectedDocuments.length > 0 ? (
            <span className="bg-blue-600/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full font-medium">
              Querying {selectedDocuments.length} document(s)
            </span>
          ) : (
            <span className="text-amber-400 font-medium">No document selected</span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-16 px-4 max-w-md mx-auto">
            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Ask Anything About Your Contracts</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Select one or multiple contracts from the left sidebar. Ask about liability caps, termination notice periods, governing law, payment terms, or absence of provisions.
            </p>
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
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium text-xs leading-relaxed'
                    : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-tl-none text-xs leading-relaxed'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Verified Citations Cards */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Verified Citations & Supporting Evidence:
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
                <div className="p-2 bg-slate-700 text-slate-300 rounded-xl flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
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
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />

          {isStreaming ? (
            <button
              onClick={handleStopGeneration}
              className="bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 px-4 py-3 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleSendMessage}
              disabled={selectedDocuments.length === 0 || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-colors shadow-lg shadow-blue-600/20"
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
