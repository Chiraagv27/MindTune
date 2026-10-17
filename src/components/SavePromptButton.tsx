'use client';

import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

import {
  findSavedPromptForSession,
  listPromptCollections,
  resolveCollectionName,
  savePromptToLibrary,
} from '@/lib/client/savedPrompts';
import { useToast } from '@/components/ui/ToastProvider';

interface SavePromptButtonProps {
  originalPrompt: string;
  optimizedPrompt: string;
  explanation: string;
  mode: string;
  provider: string;
  userId: string | null;
}

export function SavePromptButton({
  originalPrompt,
  optimizedPrompt,
  explanation,
  mode,
  provider,
  userId,
}: SavePromptButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [collection, setCollection] = useState(() => {
    if (typeof window === 'undefined') return '';
    const hint = window.sessionStorage.getItem('pp_save_collection_hint')?.trim();
    if (hint) window.sessionStorage.removeItem('pp_save_collection_hint');
    return hint ?? '';
  });
  const [collections, setCollections] = useState<string[]>([]);
  const [inLibrary, setInLibrary] = useState(false);
  const [savedCollection, setSavedCollection] = useState<string | null>(null);
  const [checkingLibrary, setCheckingLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buttonClass =
    'inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/40 px-3 py-1.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-900/60 disabled:cursor-default disabled:opacity-100';
  const savedButtonClass =
    'inline-flex w-fit cursor-default items-center gap-2 rounded-xl border border-sky-500/35 bg-sky-500/10 px-3 py-1.5 text-sm font-semibold text-sky-300';
  const inputClass =
    'h-10 min-w-[12rem] flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-500/45 focus:ring-2 focus:ring-sky-500/15';

  const canCheckLibrary = Boolean(userId && optimizedPrompt.trim());

  useEffect(() => {
    if (!canCheckLibrary) return;

    let cancelled = false;
    const activeUserId = userId as string;

    void (async () => {
      setCheckingLibrary(true);
      try {
        const { saved, collection: name } = await findSavedPromptForSession({
          userId: activeUserId,
          originalPrompt,
          optimizedPrompt,
          mode,
          provider,
        });
        if (cancelled) return;
        setInLibrary(saved);
        setSavedCollection(name);
      } catch {
        if (cancelled) return;
        setInLibrary(false);
        setSavedCollection(null);
      } finally {
        if (!cancelled) setCheckingLibrary(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCheckLibrary, userId, originalPrompt, optimizedPrompt, mode, provider]);

  useEffect(() => {
    if (!open || !userId) return;
    void listPromptCollections(userId).then(setCollections);
  }, [open, userId]);

  if (!userId) return null;

  const inLibraryActive = canCheckLibrary && inLibrary;
  const activeSavedCollection = canCheckLibrary ? savedCollection : null;

  const matchedCollection = resolveCollectionName(collection, collections);
  const joiningExisting =
    collection.trim().length > 0 &&
    collections.some((name) => name.toLowerCase() === collection.trim().toLowerCase());

  const handleSave = async () => {
    const nextCollection = matchedCollection;
    const nextTitle = title.trim() || originalPrompt.trim().slice(0, 48) || 'Saved prompt';
    if (!nextCollection) {
      setError('Choose a collection or type a new one.');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: saveError } = await savePromptToLibrary({
      userId,
      title: nextTitle,
      collection: nextCollection,
      originalPrompt,
      optimizedPrompt,
      explanation,
      mode,
      provider,
    });

    setSaving(false);
    if (saveError) {
      const message = saveError.message || 'Could not save this prompt.';
      setError(message);
      toast(message, 'error');
      return;
    }

    toast(`Saved to ${nextCollection}`, 'success');
    setInLibrary(true);
    setSavedCollection(nextCollection);
    setOpen(false);
    setTitle('');
    setCollection('');
  };

  if (inLibraryActive && !open) {
    const label = activeSavedCollection ? `Saved in ${activeSavedCollection}` : 'Saved in library';
    return (
      <button type="button" disabled className={savedButtonClass} title={label}>
        <BookmarkCheck size={16} strokeWidth={2} className="text-sky-400" />
        Saved
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={checkingLibrary}
        className={buttonClass}
      >
        <Bookmark size={16} strokeWidth={1.75} />
        {checkingLibrary ? 'Checking…' : 'Save'}
      </button>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
      className="flex w-full max-w-xl flex-col gap-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={collection}
          onChange={(event) => setCollection(event.target.value)}
          placeholder="Collection name"
          list="prompt-collections"
          autoFocus
          className={inputClass}
        />
        <datalist id="prompt-collections">
          {collections.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Prompt name"
          className={inputClass}
        />
        <button type="submit" disabled={saving} className={buttonClass}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
      {collections.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {collections.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCollection(name)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                collection.trim().toLowerCase() === name.toLowerCase()
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
        <p className="text-xs text-sky-400/90">Adds this prompt to {matchedCollection}.</p>
      ) : null}
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </form>
  );
}
