'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Copy,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';

import { AppBar } from '@/components/AppBar';
import { LibraryPromptDetail } from '@/components/library/LibraryPromptDetail';
import { MindTuneShell } from '@/components/MindTuneShell';
import { btnPrimary, btnSecondary } from '@/lib/ui/classes';
import { getSessionUser } from '@/lib/client/authSession';
import { getSupabaseClient } from '@/lib/client/supabase';
import type { Mode } from '@/lib/types';

import { requestNewOptimizerPrompt } from '@/lib/recentDrawer';
import {
  FILTER_MODES,
  collectionDescription,
  collectionIcon,
  groupByCollection,
  libraryStats,
  modeCardPillClass,
  modeLabel,
  promptCardTitle,
  promptSnippet,
  promptTokens,
  promptUpdatedLabel,
  stashReoptimize,
  type SavedPrompt,
  toAppMode,
} from './library-utils';

export default function LibraryPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<Mode | 'all'>('all');
  const [collectionFocus, setCollectionFocus] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { user } = await getSessionUser(supabase);
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('pp_saved_prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPrompts((data ?? []) as SavedPrompt[]);
      setLoading(false);
    }

    void load();
  }, []);

  const stats = useMemo(() => libraryStats(prompts), [prompts]);

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.collection ?? '').toLowerCase().includes(q) ||
        p.original_prompt.toLowerCase().includes(q) ||
        p.optimized_prompt.toLowerCase().includes(q);
      const matchesMode = modeFilter === 'all' || toAppMode(p.mode) === modeFilter;
      const name = p.collection?.trim() || 'Ungrouped';
      const matchesCollection = !collectionFocus || name === collectionFocus;
      return matchesSearch && matchesMode && matchesCollection;
    });
  }, [prompts, search, modeFilter, collectionFocus]);

  const collections = useMemo(() => groupByCollection(filtered), [filtered]);

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.from('pp_saved_prompts').delete().eq('id', id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    if (selectedPrompt?.id === id) setSelectedPrompt(null);
  };

  const copyOptimized = async (prompt: SavedPrompt) => {
    await navigator.clipboard.writeText(prompt.optimized_prompt);
    setCopiedId(prompt.id);
    window.setTimeout(() => setCopiedId(null), 900);
  };

  if (loading) {
    return (
      <MindTuneShell>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-zinc-400">Loading library…</p>
        </div>
      </MindTuneShell>
    );
  }

  if (!userId) {
    return (
      <MindTuneShell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="landing-panel max-w-md p-8 text-center">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-sky-400" strokeWidth={1} />
            <h2 className="mb-4 text-2xl font-semibold text-zinc-50">Your library</h2>
            <p className="mb-6 text-zinc-400">Sign up to save tuned prompts into collections and open them anytime.</p>
            <div className="flex items-center justify-center gap-3">
              <button type="button" onClick={() => router.push('/')} className={`${btnSecondary} inline-flex items-center gap-2`}>
                <ArrowLeft size={14} /> Back
              </button>
              <button type="button" onClick={() => router.push('/?auth=signup')} className={btnPrimary}>
                Sign up
              </button>
            </div>
          </div>
        </div>
      </MindTuneShell>
    );
  }

  const selectedCollectionName = selectedPrompt
    ? selectedPrompt.collection?.trim() || 'Ungrouped'
    : '';

  return (
    <MindTuneShell>
      <AppBar active="library" />
      <main className="landing-content-wide relative z-10 py-7 md:py-9">
        <header className="mb-6 border-b border-zinc-800/80 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">Library</h1>
        </header>

        <div className="library-stats-grid mb-5">
          <div className="library-stat-card">
            <p className="library-stat-label">Active sets</p>
            <p className="library-stat-value">
              {stats.collectionCount} <span className="library-stat-unit">Collections</span>
            </p>
          </div>
          <div className="library-stat-card">
            <p className="library-stat-label">Tuned prompts</p>
            <p className="library-stat-value">
              <span className="text-sky-400">{stats.promptCount}</span>{' '}
              <span className="library-stat-unit">Items</span>
            </p>
          </div>
        </div>

        <div className="library-filter-row mb-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModeFilter('all')}
            className={`library-filter-pill ${modeFilter === 'all' ? 'library-filter-pill-active' : ''}`}
          >
            All
            <span className="library-filter-count">{prompts.length}</span>
          </button>
          {FILTER_MODES.map((mode) => {
            const count = prompts.filter((p) => toAppMode(p.mode) === mode.value).length;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => setModeFilter(modeFilter === mode.value ? 'all' : mode.value)}
                className={`library-filter-pill library-filter-pill-muted ${
                  modeFilter === mode.value
                    ? `library-filter-pill-mode-active library-filter-pill-mode-active--${mode.value}`
                    : ''
                }`}
              >
                <span className={`library-mode-dot library-mode-dot--${mode.value}`} />
                {mode.label}
                {count > 0 ? <span className="text-zinc-500">{count}</span> : null}
              </button>
            );
          })}
          {collectionFocus ? (
            <button
              type="button"
              onClick={() => setCollectionFocus(null)}
              className="library-filter-pill library-filter-pill-muted text-sky-300"
            >
              Collection: {collectionFocus} ×
            </button>
          ) : null}
        </div>

        <div className="library-search-wrap mb-8">
          <Search className="library-search-icon" size={18} strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved prompts..."
            className="library-search-input"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
            <p className="text-zinc-500">
              {search || modeFilter !== 'all' || collectionFocus
                ? 'No matching prompts in this view.'
                : 'No saved prompts yet. Tune a prompt on the workspace and save it into a collection.'}
            </p>
            {!search && modeFilter === 'all' && !collectionFocus ? (
              <button type="button" onClick={() => router.push('/')} className={`${btnPrimary} mt-4`}>
                Go to workspace
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-10">
            {collections.map(([collectionName, items]) => {
              const Icon = collectionIcon(collectionName);
              return (
                <section key={collectionName} className="library-collection-section">
                  <div className="library-collection-header">
                    <div className="library-collection-title">
                      <span className="library-collection-icon">
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-heading text-lg font-semibold text-zinc-50">{collectionName}</span>
                          <span className="library-preset-badge">
                            {items.length} {items.length === 1 ? 'Preset' : 'Presets'}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm text-zinc-500">{collectionDescription(collectionName, items)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="library-card-grid">
                    {items.map((prompt) => {
                      const title = promptCardTitle(prompt, collectionName);
                      return (
                        <article
                          key={prompt.id}
                          className="library-prompt-card"
                          onClick={() => setSelectedPrompt(prompt)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedPrompt(prompt);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="mb-3 flex items-start justify-between gap-2">
                            <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${modeCardPillClass(prompt.mode)}`}>
                              {modeLabel(prompt.mode)}
                            </span>
                          </div>
                          <h3 className="font-heading text-base font-semibold leading-snug text-zinc-100">{title}</h3>
                          <div className="library-snippet-box mt-3">
                            <p className="line-clamp-3 font-mono text-xs leading-relaxed text-zinc-400">
                              {promptSnippet(prompt.optimized_prompt)}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                            <span>{promptUpdatedLabel(prompt.created_at)}</span>
                            <span>{promptTokens(prompt)} tokens</span>
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-3">
                            <button
                              type="button"
                              className="library-reoptimize-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                stashReoptimize(prompt);
                                router.push('/');
                              }}
                            >
                              <Sparkles size={14} />
                              Re-optimize
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="library-icon-btn"
                                title="Copy optimized prompt"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void copyOptimized(prompt);
                                }}
                              >
                                <Copy size={15} />
                                {copiedId === prompt.id ? 'Copied' : null}
                              </button>
                              <span className="library-icon-btn cursor-default text-sky-400/90" title="Saved in library">
                                <BookmarkCheck size={15} />
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })}

                    <button
                      type="button"
                      className="library-append-card"
                      onClick={() => {
                        window.sessionStorage.setItem('pp_save_collection_hint', collectionName);
                        requestNewOptimizerPrompt();
                      }}
                    >
                      <Plus size={22} className="text-zinc-500" />
                      <p className="mt-2 font-heading text-sm font-semibold text-zinc-200">Append new prompt</p>
                      <p className="mt-1 text-xs text-zinc-500">Save a tuned iteration into this collection.</p>
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {selectedPrompt ? (
        <LibraryPromptDetail
          prompt={selectedPrompt}
          collectionName={selectedCollectionName}
          onClose={() => setSelectedPrompt(null)}
          onDelete={(id) => void handleDelete(id)}
        />
      ) : null}
    </MindTuneShell>
  );
}
