'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const SUGGESTED_QUESTIONS = [
  'How does compound interest work?',
  'What is the 50/20/30 budget rule?',
  'How do I start investing with ₹500?',
  'What is a credit score and why does it matter?',
  'How do I build an emergency fund?',
];

// Gate the entire feature behind an explicit flag. The backend (/api/chat)
// already 503s gracefully if OPENAI_API_KEY is missing, but that still means
// every user sees a floating button that always fails. Hide it until someone
// deliberately turns it on by setting NEXT_PUBLIC_FIN_EDUCATOR_ENABLED=true
// in Vercel (after OPENAI_API_KEY + ASSISTANT_ID are also set).
const FIN_EDUCATOR_ENABLED = process.env.NEXT_PUBLIC_FIN_EDUCATOR_ENABLED === 'true';

export function FinEducatorChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Feature flag check happens after hooks (rules of hooks) but before any
  // rendering or network calls — nothing mounts if the flag isn't on.
  if (!FIN_EDUCATOR_ENABLED) return null;

  const sendMessage = async (text: string) => {
    const userText = text.trim();
    if (!userText || loading) return;

    const userMsg: Message = { role: 'user', content: userText, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, threadId }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // Graceful message when the AI feature isn't activated yet
        if (res.status === 503 || (data.error && data.error.includes('not configured'))) {
          setError('The Fin Educator AI is coming soon! In the meantime, explore quests and games to learn.');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      if (data.threadId) setThreadId(data.threadId);

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply,
        id: (Date.now() + 1).toString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setThreadId(null);
    setError(null);
    setInput('');
  };

  return (
    <>
      {/* ── Floating trigger button ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-24 left-4 md:bottom-6 z-40 flex items-center gap-2 h-10 px-4 rounded-full shadow-lg transition-all duration-200',
          'bg-[#1A1F2E] text-white hover:bg-[#252B3B] hover:scale-105',
          open && 'opacity-0 pointer-events-none'
        )}
        title="Ask the Fin Educator"
        aria-label="Open financial educator chat"
      >
        <span className="text-base">🎓</span>
        <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Ask Fin Educator</span>
      </button>

      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full sm:max-w-lg h-[85vh] sm:h-[600px] bg-white sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-[#1A1F2E] flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#2E7D5A]/20 border border-[#2E7D5A]/30 flex items-center justify-center text-lg flex-shrink-0">
                🎓
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm">Fin Educator</p>
                <p className="text-[#4EA07A] text-[10px] font-bold uppercase tracking-widest">AI Financial Guide · SpendXP</p>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={resetChat}
                    className="text-slate-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-white/10"
                    title="Start new conversation"
                  >
                    New chat
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close chat"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="space-y-5">
                  <div className="text-center pt-4">
                    <div className="text-3xl mb-2">🎓</div>
                    <p className="text-slate-700 font-bold text-sm">Hi! I'm your Fin Educator.</p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-xs mx-auto">
                      Ask me anything about money — budgeting, investing, credit, saving, or career finance. I'm here to help.
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">Try asking</p>
                    <div className="space-y-2">
                      {SUGGESTED_QUESTIONS.map(q => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="w-full text-left text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-[#2E7D5A] hover:bg-[#F0FAF4] transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-[#1A1F2E] flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">
                          🎓
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'bg-[#2E7D5A] text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="w-7 h-7 rounded-full bg-[#1A1F2E] flex items-center justify-center text-sm mr-2 flex-shrink-0">
                        🎓
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1 items-center h-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-700 font-medium">
                      {error}
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-slate-100">
              <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-[#2E7D5A] transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about money…"
                  rows={1}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none resize-none max-h-32 disabled:opacity-60"
                  style={{ minHeight: '24px' }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: input.trim() && !loading ? '#2E7D5A' : '#CBD5E1' }}
                  aria-label="Send message"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M13 1L6 8M13 1L9 13L6 8M13 1L1 5L6 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="text-[9px] text-slate-400 text-center mt-1.5 font-medium">
                Powered by OpenAI · For educational purposes only
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
