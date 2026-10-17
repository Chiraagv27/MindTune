'use client';



import { Bookmark, BookmarkCheck, Clock, FolderOpen, Plus, Search, Trash2, X } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';



import {

  findLibraryCollectionsForHistory,

  listPromptCollections,

  resolveCollectionName,

  savePromptToLibrary,

} from '@/lib/client/savedPrompts';

import {

  formatRelativeTime,

  historyCardTitle,

  modeDisplayLabel,

  modeDrawerTone,

} from '@/lib/modeStyles';

import { RecentDrawerShareButton } from '@/components/RecentDrawerShareButton';
import { btnGhost } from '@/lib/ui/classes';
import {
  deleteOptimizationHistoryRow,
  fetchOptimizationHistory,
} from '@/lib/client/optimizationHistory';



export interface HistoryItem {

  id: string;

  original_prompt: string;

  optimized_prompt: string;

  mode: string;

  created_at: string;

  prompt_score: number | null;

  explanation?: string;

  changes?: string;

  session_id: string;

  provider?: string;

  model?: string;

}



interface HistoryPanelProps {

  userId: string;

  isOpen: boolean;

  onClose: () => void;

  onSelect: (item: HistoryItem) => void;

  onNewPrompt?: () => void;

}



export function HistoryPanel({ userId, isOpen, onClose, onSelect, onNewPrompt }: HistoryPanelProps) {

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [filter, setFilter] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [collections, setCollections] = useState<string[]>([]);

  const [namingId, setNamingId] = useState<string | null>(null);

  const [collectionDraft, setCollectionDraft] = useState('');

  const [savingId, setSavingId] = useState<string | null>(null);

  const [savedItemId, setSavedItemId] = useState<string | null>(null);

  const [savedCollectionByItemId, setSavedCollectionByItemId] = useState<Record<string, string>>({});

  const [saveError, setSaveError] = useState<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);



  useEffect(() => {

    if (!isOpen) {

      setFilter('');

      return;

    }

    if (!userId) return;



    setIsLoading(true);

    setLoadError(null);

    void fetchOptimizationHistory(userId)

      .then(({ history: rows, error }) => {

        if (error) {

          setLoadError(error);

          setHistory([]);

          return;

        }

        const rowsList = rows as HistoryItem[];
        setHistory(rowsList);
        void findLibraryCollectionsForHistory(userId, rowsList).then(setSavedCollectionByItemId);

      })

      .catch((err) => {

        console.error('Failed to fetch history:', err);

        setLoadError('Could not load recent prompts. Check your connection and try again.');

        setHistory([]);

      })

      .finally(() => setIsLoading(false));



    void listPromptCollections(userId).then(setCollections);

  }, [isOpen, userId]);



  const filteredHistory = useMemo(() => {

    const q = filter.trim().toLowerCase();

    if (!q) return history;

    return history.filter(

      (item) =>

        item.original_prompt.toLowerCase().includes(q) ||

        item.optimized_prompt.toLowerCase().includes(q) ||

        modeDisplayLabel(item.mode).toLowerCase().includes(q),

    );

  }, [history, filter]);



  const handleDelete = async (e: React.MouseEvent, id: string) => {

    e.stopPropagation();

    if (deletingId) return;

    if (!confirm('Are you sure you want to delete this prompt?')) return;



    setDeletingId(id);

    const target = history.find((item) => item.id === id);

    if (!target) return;



    try {

      const deleteError = await deleteOptimizationHistoryRow(userId, target);

      if (deleteError) throw new Error(deleteError);

      setHistory((prev) => prev.filter((item) => item.id !== id));

      setSavedCollectionByItemId((prev) => {

        const next = { ...prev };

        delete next[id];

        return next;

      });

    } catch (err) {

      console.error('Failed to delete history item:', err);

      alert('Failed to delete item');

    } finally {

      setDeletingId(null);

    }

  };



  const beginSaveToLibrary = (e: React.MouseEvent, item: HistoryItem) => {

    e.stopPropagation();

    setSaveError(null);

    setNamingId(item.id);

    setCollectionDraft('');

    void listPromptCollections(userId).then(setCollections);

  };



  const cancelSave = (e: React.MouseEvent) => {

    e.stopPropagation();

    setNamingId(null);

    setCollectionDraft('');

    setSaveError(null);

  };



  const confirmSaveToLibrary = async (e: React.MouseEvent, item: HistoryItem) => {

    e.stopPropagation();

    const nextCollection = resolveCollectionName(collectionDraft, collections);

    if (!nextCollection) {

      setSaveError('Choose a collection or type a new one.');

      return;

    }



    setSavingId(item.id);

    setSaveError(null);



    const { error } = await savePromptToLibrary({

      userId,

      title: item.original_prompt.trim().slice(0, 48) || 'Saved prompt',

      collection: nextCollection,

      originalPrompt: item.original_prompt,

      optimizedPrompt: item.optimized_prompt,

      explanation: item.explanation ?? '',

      mode: item.mode,

      provider: item.provider ?? 'google',

    });



    setSavingId(null);



    if (error) {

      setSaveError(error.message || 'Could not save this prompt.');

      return;

    }



    setNamingId(null);

    setCollectionDraft('');

    setSavedItemId(item.id);

    setSavedCollectionByItemId((prev) => ({ ...prev, [item.id]: nextCollection }));

    if (!collections.some((name) => name.toLowerCase() === nextCollection.toLowerCase())) {

      setCollections((prev) => [...prev, nextCollection].sort((a, b) => a.localeCompare(b)));

    }

    window.setTimeout(() => setSavedItemId(null), 3000);

  };



  const joiningExisting =

    collectionDraft.trim().length > 0 &&

    collections.some((name) => name.toLowerCase() === collectionDraft.trim().toLowerCase());



  const openItem = (item: HistoryItem) => {

    if (namingId === item.id) return;

    onSelect(item);

    onClose();

  };



  return (

    <>

      {isOpen ? (

        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      ) : null}



      <aside

        className={`recent-drawer fixed inset-y-0 right-0 z-50 w-full max-w-[22rem] transform shadow-2xl transition-transform duration-300 ease-in-out sm:max-w-[23.5rem] ${

          isOpen ? 'translate-x-0' : 'translate-x-full'

        }`}

        aria-hidden={!isOpen}

      >

        <div className="recent-drawer-shell">

          <header className="recent-drawer-top">

            <div className="recent-drawer-title-row">

              <span className="recent-drawer-icon-ring" aria-hidden>

                <Clock className="h-3.5 w-3.5" />

              </span>

              <h2 className="recent-drawer-title">Recent Prompts</h2>

              {!isLoading && history.length > 0 ? (

                <span className="recent-drawer-runs-badge">{history.length} runs</span>

              ) : null}

              {onNewPrompt ? (
                <button
                  type="button"
                  onClick={onNewPrompt}
                  className="recent-drawer-new"
                  aria-label="New prompt in optimizer"
                  title="New prompt"
                >
                  <Plus className="h-4 w-4" />
                </button>
              ) : null}

              <button type="button" onClick={onClose} className="recent-drawer-close" aria-label="Close">

                <X className="h-4 w-4" />

              </button>

            </div>



            <div className="recent-drawer-search-wrap">

              <Search className="recent-drawer-search-icon" aria-hidden />

              <input

                type="text"

                value={filter}

                onChange={(e) => setFilter(e.target.value)}

                placeholder="Filter history runs..."

                className="recent-drawer-search"

                aria-label="Filter history runs"

              />

              {filter.trim().length > 0 ? (

                <button

                  type="button"

                  className="recent-drawer-search-clear"

                  aria-label="Clear filter"

                  onClick={() => setFilter('')}

                >

                  <X className="h-3.5 w-3.5" />

                </button>

              ) : null}

            </div>

          </header>



          <div className="recent-drawer-list">

            {isLoading ? (

              <div className="recent-drawer-empty flex flex-col items-center gap-2">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400" />

                <span>Loading history...</span>

              </div>

            ) : filteredHistory.length === 0 ? (

              <div className="recent-drawer-empty">

                {loadError ? (

                  <>

                    {loadError}

                    <br />

                    <span className="text-zinc-500">Tune a prompt while signed in, then reopen Recent.</span>

                  </>

                ) : history.length === 0 ? (

                  <>

                    No recent prompts found.

                    <br />

                    Optimized prompts will appear here.

                  </>

                ) : (

                  <>No runs match your filter.</>

                )}

              </div>

            ) : (

              filteredHistory.map((item) => {

                const tone = modeDrawerTone(item.mode);

                const collectionLabel = savedCollectionByItemId[item.id];

                const isSaved = Boolean(collectionLabel);
                const score =
                  item.prompt_score != null && Number.isFinite(item.prompt_score)
                    ? Math.round(item.prompt_score)
                    : null;

                return (

                  <article

                    key={item.id}

                    role="button"

                    tabIndex={0}

                    onClick={() => openItem(item)}

                    onKeyDown={(e) => {

                      if (e.key === 'Enter' || e.key === ' ') openItem(item);

                    }}

                    className="recent-drawer-card group"

                  >

                    <div className="recent-drawer-card-meta">
                      <span className="recent-drawer-when">{formatRelativeTime(item.created_at)}</span>

                      <div className="recent-drawer-badges">
                        <span className={`recent-drawer-mode-chip recent-drawer-chip--${tone}`}>
                          {modeDisplayLabel(item.mode)}
                        </span>
                        {score != null ? (
                          <span className={`recent-drawer-score-badge recent-drawer-score-badge--${tone}`}>
                            {score}/100
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <h3 className="recent-drawer-card-title">{historyCardTitle(item.original_prompt, 64)}</h3>

                    {collectionLabel ? (
                      <span className="recent-drawer-collection-tag">
                        <FolderOpen className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
                        {collectionLabel}
                      </span>
                    ) : null}

                    {namingId === item.id ? (

                      <div className="recent-drawer-save-panel" onClick={(e) => e.stopPropagation()}>

                        <p className="mb-2 text-xs font-medium text-zinc-400">Save to library collection</p>

                        <input

                          value={collectionDraft}

                          onChange={(e) => setCollectionDraft(e.target.value)}

                          placeholder="Collection name"

                          list="history-prompt-collections"

                          autoFocus

                          className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-500/40"

                        />

                        <datalist id="history-prompt-collections">

                          {collections.map((name) => (

                            <option key={name} value={name} />

                          ))}

                        </datalist>

                        {collections.length > 0 ? (

                          <div className="mt-2 flex flex-wrap gap-1.5">

                            {collections.map((name) => (

                              <button

                                key={name}

                                type="button"

                                onClick={(e) => {

                                  e.stopPropagation();

                                  setCollectionDraft(name);

                                }}

                                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${

                                  collectionDraft.trim().toLowerCase() === name.toLowerCase()

                                    ? 'bg-sky-500/20 text-sky-200'

                                    : 'bg-zinc-800 text-zinc-300'

                                }`}

                              >

                                {name}

                              </button>

                            ))}

                          </div>

                        ) : null}

                        {joiningExisting ? (

                          <p className="mt-2 text-xs text-zinc-500">

                            Adds this prompt to {resolveCollectionName(collectionDraft, collections)}.

                          </p>

                        ) : null}

                        {saveError ? <p className="mt-2 text-xs text-rose-400">{saveError}</p> : null}

                        <div className="mt-2 flex flex-wrap gap-2">

                          <button

                            type="button"

                            disabled={savingId === item.id}

                            onClick={(e) => void confirmSaveToLibrary(e, item)}

                            className={`${btnGhost} text-xs`}

                          >

                            {savingId === item.id ? 'Saving…' : 'Save to library'}

                          </button>

                          <button

                            type="button"

                            onClick={cancelSave}

                            className="text-xs font-medium text-zinc-500 hover:text-zinc-200"

                          >

                            Cancel

                          </button>

                        </div>

                      </div>

                    ) : (

                      <div className="recent-drawer-card-foot">
                        <div className="recent-drawer-card-actions">
                          {isSaved ? (
                            <span
                              className="recent-drawer-icon-btn recent-drawer-icon-btn--active"
                              title={`Saved in ${collectionLabel}`}
                            >
                              <Bookmark className="h-3.5 w-3.5 fill-current" aria-hidden />
                            </span>
                          ) : savedItemId === item.id ? (
                            <span className="recent-drawer-icon-btn recent-drawer-icon-btn--saved">
                              <BookmarkCheck className="h-3.5 w-3.5" aria-hidden />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => beginSaveToLibrary(e, item)}
                              disabled={Boolean(namingId && namingId !== item.id)}
                              className="recent-drawer-icon-btn"
                              title="Save to library collection"
                            >
                              <Bookmark className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {item.session_id ? (
                            <RecentDrawerShareButton sessionId={item.session_id} />
                          ) : null}

                          <button

                            type="button"

                            onClick={(e) => handleDelete(e, item.id)}

                            disabled={deletingId === item.id}

                            className="recent-drawer-icon-btn recent-drawer-icon-btn--danger"

                            title="Delete prompt"

                          >

                            <Trash2 className="h-3.5 w-3.5" />

                          </button>

                        </div>

                      </div>

                    )}

                  </article>

                );

              })

            )}

          </div>

        </div>

      </aside>

    </>

  );

}


