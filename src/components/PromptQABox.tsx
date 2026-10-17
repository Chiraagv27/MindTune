'use client';

import { Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { LazyMarkdown } from '@/components/LazyMarkdown';
import type { ProviderId } from '@/lib/types';

type QAMessage = { role: 'user' | 'assistant'; content: string };

interface PromptQABoxProps {
  optimizedPrompt: string;
  explanation: string;
  provider: ProviderId;
  apiKey: string;
  initialMessages?: QAMessage[];
  sessionId: string;
}

export function PromptQABox({ optimizedPrompt, explanation, provider, apiKey, initialMessages = [], sessionId }: PromptQABoxProps) {
  const [messages, setMessages] = useState<QAMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt: optimizedPrompt,
          explanation,
          question: userMessage,
          provider,
          apiKey,
          session_id: sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I could not answer that question. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="optimizer-output-card optimizer-qa-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="optimizer-output-card__title">Ask about this prompt</h3>
      </div>

      <div className="mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`optimizer-qa-message max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-sky-600/90 text-white ring-1 ring-sky-500/30'
                  : 'bg-zinc-900/90 text-zinc-100 ring-1 ring-zinc-700/80 prose dark:prose-invert max-w-none prose-p:my-2.5 prose-ul:my-2.5 prose-li:my-0.5 prose-headings:my-2'
              }`}
            >
              {msg.role === 'assistant' ? (
                <LazyMarkdown content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="optimizer-qa-message max-w-[85%] rounded-2xl bg-zinc-100 px-4 py-2.5 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask MindTune...."
          rows={1}
          className="optimizer-qa-input min-h-[44px] w-full resize-none overflow-hidden px-4 py-3 pr-12 shadow-sm transition disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="optimizer-qa-send absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-2 transition disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
