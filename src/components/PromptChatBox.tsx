'use client';

import { Mic, MicOff } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const EMBEDDED_TEXTAREA_MIN_PX = 100;

interface PromptChatBoxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onAutoTune?: () => void;
  /** Embedded in optimizer composer: no outer card, shorter input, mic in textarea corner */
  variant?: 'panel' | 'embedded';
}

type RecordState = 'idle' | 'listening' | 'processing' | 'unsupported';

function initialRecordState(): RecordState {
  if (typeof window === 'undefined') return 'idle';
  const supported =
    typeof SpeechRecognition !== 'undefined' || typeof webkitSpeechRecognition !== 'undefined';
  return supported ? 'idle' : 'unsupported';
}

export function PromptChatBox({
  value,
  onChange,
  disabled,
  onAutoTune,
  variant = 'panel',
}: PromptChatBoxProps) {
  const embedded = variant === 'embedded';
  const [recState, setRecState] = useState<RecordState>(initialRecordState);
  const [interimText, setInterimText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseTextRef = useRef(''); // text before the current speech session
  // Always hold the latest callback so recognition.onend never uses a stale closure
  const onAutoTuneRef = useRef(onAutoTune);
  useEffect(() => { onAutoTuneRef.current = onAutoTune; }, [onAutoTune]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setInterimText('');
    setRecState('idle');
  }, []);

  const startRecording = useCallback(() => {
    const Api =
      (typeof SpeechRecognition !== 'undefined' ? SpeechRecognition : null) ??
      (typeof webkitSpeechRecognition !== 'undefined' ? webkitSpeechRecognition : null);

    if (!Api) return;

    const recognition = new Api();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Snapshot current text so we can append speech to it
    baseTextRef.current = value;

    recognition.onstart = () => setRecState('listening');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        const separator = baseTextRef.current.trim() ? ' ' : '';
        baseTextRef.current = baseTextRef.current + separator + final.trim();
        onChange(baseTextRef.current);
        setInterimText('');
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = () => {
      setInterimText('');
      setRecState('idle');
    };

    recognition.onend = () => {
      setInterimText('');
      if (baseTextRef.current.trim() && onAutoTuneRef.current) {
        setRecState('processing');
        setTimeout(() => {
          setRecState('idle');
          onAutoTuneRef.current?.();
        }, 400);
      } else {
        setRecState('idle');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [value, onChange]);

  const toggleRecording = () => {
    if (recState === 'listening') {
      stopRecording();
    } else if (recState === 'idle') {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => () => recognitionRef.current?.stop(), []);

  const isListening = recState === 'listening';
  const isProcessing = recState === 'processing';
  const isUnsupported = recState === 'unsupported';

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const syncEmbeddedHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el || !embedded) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(EMBEDDED_TEXTAREA_MIN_PX, el.scrollHeight)}px`;
  }, [embedded]);

  useLayoutEffect(() => {
    syncEmbeddedHeight();
  }, [value, interimText, embedded, isListening, syncEmbeddedHeight]);

  const outerClass = embedded
    ? ''
    : `card-animated-border rounded-[28px] border bg-white/50 p-5 shadow-sm backdrop-blur transition-all duration-300 dark:bg-zinc-950/30 md:p-7 ${
        isListening
          ? 'border-rose-400/50 shadow-rose-500/10 shadow-lg'
          : 'border-zinc-200/80 hover:border-violet-300/30 hover:shadow-violet-500/5 dark:border-zinc-800/80 dark:hover:border-violet-800/30'
      }`;

  return (
    <div className={outerClass}>
      {/* Header row */}
      {!embedded ? (
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold tracking-widest uppercase text-zinc-500 dark:text-zinc-500">
            Prompt
          </div>
          {isListening && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
              Listening…
            </span>
          )}
          {isProcessing && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-violet-500">
              <span className="inline-flex gap-0.5">
                <span className="thinking-dot h-1 w-1 rounded-full bg-violet-500" />
                <span className="thinking-dot h-1 w-1 rounded-full bg-violet-500" />
                <span className="thinking-dot h-1 w-1 rounded-full bg-violet-500" />
              </span>
              Tuning…
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-400 dark:text-zinc-600 tabular-nums">
            {wordCount > 0 ? `${wordCount} words` : ' '}
          </div>

          {/* Mic button (panel header) */}
          {!embedded && !isUnsupported && (
            <MicButton
              isListening={isListening}
              isProcessing={isProcessing}
              disabled={disabled}
              onClick={toggleRecording}
            />
          )}
        </div>
      </div>
      ) : (
        (isListening || isProcessing) && (
          <div className="mb-2 flex items-center gap-2">
            {isListening && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                Listening…
              </span>
            )}
            {isProcessing && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-violet-500">
                Tuning…
              </span>
            )}
          </div>
        )
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={isListening ? value + (interimText ? ` ${interimText}` : '') : value}
          onChange={(e) => {
            if (!isListening) onChange(e.target.value);
            if (embedded) requestAnimationFrame(syncEmbeddedHeight);
          }}
          disabled={disabled || isListening}
          placeholder={isListening ? 'Speak now… MindTune is listening.' : 'Speak or type messy. Get clarity.'}
          rows={embedded ? 2 : 16}
          className={`w-full resize-none rounded-2xl border text-sm leading-7 outline-none transition-[border-color,box-shadow,background-color] duration-300 ${
            embedded
              ? 'min-h-[9.65rem] max-h-[min(28rem,50vh)] overflow-y-auto py-3 pl-4 pr-12'
              : 'min-h-[420px] px-5 py-4'
          } ${
            isListening
              ? 'border-rose-400/40 bg-rose-50/30 text-zinc-900 placeholder:text-rose-400/50 dark:bg-rose-950/10 dark:text-zinc-50'
              : embedded
                ? 'border-zinc-800/80 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500/45 focus:ring-2 focus:ring-sky-500/15 disabled:opacity-50'
                : 'border-zinc-200/60 bg-white/60 text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400/50 focus:shadow-lg focus:shadow-violet-500/5 focus:bg-white/80 disabled:opacity-50 dark:border-zinc-800/60 dark:bg-zinc-950/40 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-violet-700/50 dark:focus:bg-zinc-950/60'
          }`}
        />
        {embedded && !isUnsupported && (
          <div className="absolute right-3 top-3">
            <MicButton
              isListening={isListening}
              isProcessing={isProcessing}
              disabled={disabled}
              onClick={toggleRecording}
              compact
            />
          </div>
        )}
        {isListening && interimText && (
          <div className={`pointer-events-none absolute text-xs italic text-rose-400/70 ${embedded ? 'bottom-3 left-4 right-4' : 'bottom-4 left-5 right-5'}`}>
            {interimText}
          </div>
        )}
      </div>

      {/* Helper text */}
      {!embedded && !isUnsupported && (
        <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-600">
          {isListening
            ? 'Speak naturally. Click the mic again or pause to stop.'
            : 'Click the mic to speak your idea. MindTune will tune it automatically.'}
        </p>
      )}
    </div>
  );
}

function MicButton({
  isListening,
  isProcessing,
  disabled,
  onClick,
  compact,
}: {
  isListening: boolean;
  isProcessing: boolean;
  disabled?: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isProcessing}
      title={isListening ? 'Stop recording' : 'Speak your prompt'}
      className={`relative inline-flex cursor-pointer items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40 ${
        compact ? 'h-9 w-9' : 'h-8 w-8'
      } ${
        isListening
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
          : 'border border-zinc-200/80 bg-white/60 text-zinc-500 hover:border-sky-400/45 hover:bg-white hover:text-sky-600 hover:shadow-md hover:shadow-sky-500/10 dark:border-zinc-700/80 dark:bg-zinc-900/50 dark:text-zinc-500 dark:hover:border-sky-600/45 dark:hover:bg-zinc-800 dark:hover:text-sky-400'
      }`}
    >
      {isListening && (
        <span className="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-25" />
      )}
      {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
    </button>
  );
}
