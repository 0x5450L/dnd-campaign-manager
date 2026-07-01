import { useEffect, useState } from "react";
import type { SrdCreature } from "../../../../../../shared/dto/srd";
import { useSrdCreatureSearchQuery } from "../../../../queries/srd";
import { getSrdCreature } from "../../../../services/api/srd";

type CreatureBrowserProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectCreature: (creature: SrdCreature) => void;
};

const formatCr = (cr: number): string => {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
};

function CreatureBrowser({ isOpen, onClose, onSelectCreature }: CreatureBrowserProps) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(handle);
  }, [term]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const { data, isFetching, isError } = useSrdCreatureSearchQuery(debounced);
  const results = data?.results ?? [];

  const handleSelect = async (slug: string) => {
    setLoadingSlug(slug);
    try {
      const creature = await getSrdCreature(slug);
      onSelectCreature(creature);
    } catch (error) {
      console.error("Failed to load creature:", error);
    } finally {
      setLoadingSlug(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Bestiary"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-lg border border-rule bg-bg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-2 border-b border-rule px-4 py-3">
          <h2 className="text-lg font-semibold text-gold-bright">Bestiary</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bestiary"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-dim transition-colors duration-150 hover:bg-surface-light/60 hover:text-ink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </header>

        <div className="px-4 pt-3">
          <input
            type="text"
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search monsters by name…"
            className="w-full rounded-md border border-rule bg-surface px-3 py-2 text-ink placeholder:text-faint focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex max-h-[55vh] flex-col gap-1.5 overflow-y-auto px-4 py-3">
          {debounced.trim() === "" ? (
            <p className="py-8 text-center text-sm text-faint">
              Type a name to search the bestiary.
            </p>
          ) : isFetching ? (
            <p className="py-8 text-center text-sm text-dim">Searching…</p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-rust">
              Failed to reach the bestiary. Try again.
            </p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-faint">
              No monsters found for “{debounced}”.
            </p>
          ) : (
            results.map((creature) => (
              <button
                key={creature.slug}
                type="button"
                disabled={loadingSlug !== null}
                onClick={() => handleSelect(creature.slug)}
                className="flex items-center justify-between gap-3 rounded-md border border-rule/60 bg-surface px-3 py-2 text-left transition-colors duration-150 hover:border-gold hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="font-medium text-ink">{creature.name}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-dim">
                  {creature.type && <span className="capitalize">{creature.type}</span>}
                  <span className="rounded bg-bg px-1.5 py-0.5 text-gold">
                    {loadingSlug === creature.slug ? "…" : `CR ${formatCr(creature.challengeRating)}`}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatureBrowser;
