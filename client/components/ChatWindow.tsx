import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, MessageSquare, Bot, User, Check, Copy, HelpCircle, FileText, ArrowRight, ShieldCheck, Mic, MicOff, Download, EyeOff, Eye } from 'lucide-react';
import { Message, Citation, LegalDocument } from '../types';
import { streamChatApi } from '../lib/api';
import { CitationCard } from './CitationCard';
import { FormattedAnswer } from './FormattedAnswer';
import { exportAnswerAsFile } from '../lib/export';
import { anonymizeText, deanonymizeText } from '../lib/anonymize';

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
  const [isListening, setIsListening] = useState(false);
  const [isAnonymized, setIsAnonymized] = useState(false);
  const [anonymizeMap, setAnonymizeMap] = useState<Record<string, string>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickPrompts = [
    'What is the liability cap?',
    'What is the termination notice period?',
    'What is the governing law?',
    'Are there any penalty or indemnity clauses?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Voice Input Speech Recognition Setup
  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInputMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Toggle PII Anonymization on displayed text
  const handleToggleAnonymize = () => {
    setIsAnonymized((prev) => !prev);
  };

  const handleSendMessage = (textToSend?: string) => {
    let query = textToSend || inputMessage;
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
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Top Controls Bar (Anonymize PII Toggle) */}
      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleAnonymize}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              isAnonymized
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-900/40'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
            title="Mask names, emails, and phone numbers with placeholders like [PERSON_1]"
          >
            {isAnonymized ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isAnonymized ? 'PII Anonymized' : 'Anonymize PII'}</span>
          </button>
        </div>

        {selectedDocuments.length > 0 && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Active: {selectedDocuments.map((d) => d.originalName).join(', ')}
          </span>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8 sm:py-14 px-4 max-w-xl mx-auto">
            <div className="w-12 h-12 bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-slate-700">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Contract Q&A Assistant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Ask questions about your uploaded agreements to instantly get answers verified against exact page text.
            </p>

            {/* Starter Prompts */}
            <div className="mt-6">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                Suggested Questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {quickPrompts.map((promptText, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(promptText)}
                    disabled={selectedDocuments.length === 0}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs p-3 rounded-xl transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-white flex items-center justify-between group"
                  >
                    <span>{promptText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const displayContent = isAnonymized ? anonymizeText(msg.content).text : msg.content;
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white font-medium shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs'
                  }`}
                >
                  {/* Copy & Export Buttons */}
                  {msg.content && msg.role === 'assistant' && (
                    <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          exportAnswerAsFile(
                            messages[idx - 1]?.content || 'Question',
                            msg.content,
                            msg.citations,
                            selectedDocuments[0]?.originalName
                          )
                        }
                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                        title="Export Report TXT/PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopyText(msg.content, idx)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded"
                        title="Copy answer"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  <FormattedAnswer content={displayContent} />

                  {/* Verified Citations List */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
                        <span>Verified Contract Passages (Click to View):</span>
                      </p>
                      {msg.citations.map((cit, cIdx) => (
                        <CitationCard key={cIdx} citation={cit} onSelectCitation={onSelectCitation} />
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          {/* Voice Input Microphone Button */}
          <button
            onClick={handleToggleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isListening ? 'Listening... Click to stop' : 'Click to speak question'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={
              isListening
                ? 'Listening... Speak your question now'
                : selectedDocuments.length > 0
                ? 'Ask any question about selected contract(s)...'
                : 'Select a contract from left sidebar to begin...'
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={selectedDocuments.length === 0}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
          />

          {isStreaming ? (
            <button
              onClick={handleStopGeneration}
              className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={() => handleSendMessage()}
              disabled={selectedDocuments.length === 0 || !inputMessage.trim()}
              className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
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


