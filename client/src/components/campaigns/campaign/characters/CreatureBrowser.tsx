import { useEffect, useState } from "react";
import type { SrdCreature } from "@dnd/shared/dto/srd";
import { useSrdCreatureFetcher, useSrdCreatureSearchQuery } from "@/queries/srd";
import Modal from "@/components/ui/Modal";

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

  const { data, isFetching, isError } = useSrdCreatureSearchQuery(debounced);
  const fetchCreature = useSrdCreatureFetcher();
  const results = data?.results ?? [];

  const handleSelect = async (slug: string) => {
    setLoadingSlug(slug);
    try {
      const creature = await fetchCreature(slug);
      onSelectCreature(creature);
    } catch (error) {
      console.error("Failed to load creature:", error);
    } finally {
      setLoadingSlug(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      align="start"
      label="Bestiary"
      title={<h2 className="text-lg font-semibold text-gold-bright">Bestiary</h2>}
    >
      <input
        type="text"
        autoFocus
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search monsters by name…"
        className="w-full rounded-md border border-rule bg-surface px-3 py-2 text-ink placeholder:text-faint focus:border-gold focus:outline-none"
      />

      <div className="custom-scrollbar flex max-h-[55vh] flex-col gap-1.5 overflow-y-auto">
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
    </Modal>
  );
}

export default CreatureBrowser;
