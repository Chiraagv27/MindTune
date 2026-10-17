'use client';

import { ChevronDown } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { CopyButton } from './CopyButton';

interface OutputCardProps {
  title: string;
  text: string;
  isLoading?: boolean;
  emptyText?: string;
  variant?: 'code' | 'prose';
  embedded?: boolean;
  /** Landing-style panel (optimizer workspace) */
  panel?: 'default' | 'landing';
  emphasis?: 'primary' | 'default';
  /** Allow long prose explanations to scroll inside the card */
  proseScroll?: boolean;
  /** Optimizer: tap header to expand / collapse body */
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Render inline **bold** markers
function renderInlineMd(content: string): React.ReactNode[] {
  return content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
          {m[1]}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Full markdown-aware renderer. Handles headings, bullets, numbered lists, paragraphs
export function renderPromptMarkdown(text: string, accent: 'violet' | 'indigo' | 'sky' = 'violet'): React.ReactNode[] {
  const dotCls =
    accent === 'sky' ? 'bg-sky-400/85' : accent === 'violet' ? 'bg-violet-400/80' : 'bg-indigo-400/80';

  return text
    .trim()
    .split(/\r?\n/)
    .map((line, i) => {
      // ### sub-heading (check deeper levels first)
      const h3 = line.match(/^###\s+(.*)/);
      if (h3) {
        return (
          <p key={i} className="optimizer-output-prose-h3">
            {renderInlineMd(h3[1])}
          </p>
        );
      }

      // ## section heading
      const h2 = line.match(/^##\s+(.*)/);
      if (h2) {
        return (
          <p key={i} className="optimizer-output-prose-h2">
            {renderInlineMd(h2[1])}
          </p>
        );
      }

      // # top-level heading
      const h1 = line.match(/^#\s+(.*)/);
      if (h1) {
        return (
          <p key={i} className="optimizer-output-prose-h2">
            {renderInlineMd(h1[1])}
          </p>
        );
      }

      // Indented sub-bullet (2+ spaces then - / * / •)
      const subBullet = line.match(/^(\s{2,})[-*•]\s+(.*)/);
      if (subBullet) {
        return (
          <div key={i} className="my-0.5 flex items-start gap-2 pl-5">
            <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
            <span className="optimizer-output-prose-p text-zinc-400">
              {renderInlineMd(subBullet[2])}
            </span>
          </div>
        );
      }

      // Top-level bullet: - / * / •
      const bullet = line.match(/^[-*•]\s+(.*)/);
      if (bullet) {
        return (
          <div key={i} className="my-1 flex items-start gap-2.5">
            <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotCls}`} />
            <span className="optimizer-output-prose-p">
              {renderInlineMd(bullet[1])}
            </span>
          </div>
        );
      }

      // Numbered list item (possibly indented): "  1. text"
      const numItem = line.match(/^(\s*)(\d+)\.\s+(.*)/);
      if (numItem) {
        return (
          <div
            key={i}
            className={`my-1 flex items-start gap-2 ${numItem[1].length > 0 ? 'pl-4' : ''}`}
          >
            <span className="min-w-[1.25rem] shrink-0 text-right font-semibold text-zinc-500">
              {numItem[2]}.
            </span>
            <span className="optimizer-output-prose-p">
              {renderInlineMd(numItem[3])}
            </span>
          </div>
        );
      }

      // Blank line, small spacer
      if (!line.trim()) {
        return <div key={i} className="h-1" />;
      }

      // Default paragraph
      return (
        <p key={i} className="optimizer-output-prose-p">
          {renderInlineMd(line)}
        </p>
      );
    });
}

function OutputCardInner({
  title,
  text,
  isLoading,
  emptyText,
  variant = 'code',
  embedded = false,
  panel = 'default',
  emphasis = 'default',
  proseScroll = false,
  collapsible = false,
  defaultExpanded = true,
}: OutputCardProps) {
  const display = text.trim();
  const isCode = variant === 'code';
  const isLandingPanel = panel === 'landing' && !embedded;
  const accent = isCode ? 'violet' : isLandingPanel ? 'sky' : 'indigo';
  const useCollapsible = collapsible && isLandingPanel;
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const isExpanded = useCollapsible ? (userExpanded ?? defaultExpanded) : true;

  const shellClass = embedded
    ? ''
    : isLandingPanel
      ? `optimizer-output-card${emphasis === 'primary' ? ' optimizer-output-card--primary' : ''}${useCollapsible ? ' optimizer-output-card--collapsible' : ''}${useCollapsible && !isExpanded ? ' optimizer-output-card--collapsed' : ''}`
      : 'rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900';

  const titleClass = isLandingPanel
    ? 'optimizer-output-card__title'
    : 'text-[11px] font-semibold uppercase tracking-wider text-zinc-400';

  const usePlainStream = Boolean(isLoading && display);
  const renderedMarkdown = useMemo(
    () => (display && !usePlainStream ? renderPromptMarkdown(display, accent) : null),
    [display, accent, usePlainStream],
  );

  const bodyBlock = (
    <div
      className={[
        'optimizer-output-card__body',
        proseScroll && display ? 'optimizer-output-card__prose-scroll max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain pr-1' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {display ? (
        <div>
          {usePlainStream ? (
            <pre className="optimizer-output-stream-plain whitespace-pre-wrap font-[inherit] text-[inherit] leading-[inherit]">
              {display}
            </pre>
          ) : (
            renderedMarkdown
          )}
          {isLoading ? <span className="ml-0.5 animate-pulse text-sky-400/90">▍</span> : null}
        </div>
      ) : (
        <div className="flex justify-center py-6">
          {isLoading ? (
            <span className="optimizer-output-empty flex items-center gap-2 text-zinc-400">
              <span className="inline-flex gap-1">
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-sky-500/80" />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-sky-500/80" />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-sky-500/80" />
              </span>
              Generating…
            </span>
          ) : (
            <p className="optimizer-output-empty text-zinc-500">{emptyText ?? 'Nothing yet.'}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={shellClass}>
      <div
        className={
          useCollapsible
            ? 'optimizer-output-card__header optimizer-output-card__header--collapsible'
            : 'optimizer-output-card__header mb-3 flex items-center justify-between gap-3'
        }
      >
        {useCollapsible ? (
          <button
            type="button"
            onClick={() => setUserExpanded((prev) => !(prev ?? defaultExpanded))}
            className="optimizer-output-card__toggle"
            aria-expanded={isExpanded}
          >
            <h2 className={titleClass}>{title}</h2>
            <span className="optimizer-output-card__toggle-trail">
              {isLoading && !isExpanded ? (
                <span className="optimizer-output-card__header-badge">Updating…</span>
              ) : null}
              <span className="optimizer-output-card__chevron-btn" aria-hidden>
                <ChevronDown
                  className={`optimizer-output-card__chevron h-4 w-4 ${isExpanded ? 'is-expanded' : ''}`}
                />
              </span>
            </span>
          </button>
        ) : (
          <h2 className={titleClass}>{title}</h2>
        )}
        <div
          className="optimizer-output-card__copy shrink-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <CopyButton
            text={display}
            disabled={isLoading || !display}
            variant={isLandingPanel ? 'landing' : 'default'}
          />
        </div>
      </div>

      {isExpanded ? (
        <div className={useCollapsible ? 'optimizer-output-card__body-wrap' : undefined}>{bodyBlock}</div>
      ) : null}
    </div>
  );
}

export const OutputCard = memo(OutputCardInner);
