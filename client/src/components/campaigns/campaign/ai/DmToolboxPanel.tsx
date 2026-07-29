import { useEffect } from "react";
import type { LootFindType, LootRichness } from "@shared/dto/ai";
import { useGenerateLootMutation } from "@/queries/ai";
import { useDmToolboxStore } from "@/state/ai/dmToolboxStore";
import LootGeneratorForm from "./LootGeneratorForm";
import LootResultCard from "./LootResultCard";

type DmToolboxPanelProps = {
  campaignId: string;
};

type LootFormInput = {
  findType: LootFindType;
  richness: LootRichness;
  itemCount: number;
  context?: string;
};

function LootSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="rounded-md border border-rule bg-surface-light/20 p-3">
        <div className="mb-2 h-2 w-20 rounded bg-rule" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full rounded bg-rule/70" />
          <div className="h-3 w-11/12 rounded bg-rule/70" />
          <div className="h-3 w-8/12 rounded bg-rule/70" />
        </div>
      </div>
      {[0, 1, 2].map((row) => (
        <div key={row} className="rounded-md border border-rule bg-surface/40 p-3">
          <div className="mb-2 h-3 w-1/2 rounded bg-rule/70" />
          <div className="h-3 w-full rounded bg-rule/50" />
        </div>
      ))}
    </div>
  );
}

function DmToolboxPanel({ campaignId }: DmToolboxPanelProps) {
  const isOpen = useDmToolboxStore((s) => s.isOpen);
  const close = useDmToolboxStore((s) => s.close);
  const generation = useDmToolboxStore((s) => s.lootGeneration);
  const setLootGeneration = useDmToolboxStore((s) => s.setLootGeneration);

  const generateLoot = useGenerateLootMutation();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const runGeneration = (input: LootFormInput) => {
    generateLoot.mutate(
      { campaignId, ...input },
      { onSuccess: (result) => setLootGeneration(result) },
    );
  };

  const regenerate = () => {
    if (!generation) return;
    generateLoot.mutate(generation.input, {
      onSuccess: (result) => setLootGeneration(result),
    });
  };

  const errorMessage =
    generateLoot.error instanceof Error ? generateLoot.error.message : null;

  return (
    <>
      <div
        aria-hidden
        onClick={close}
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-40 flex w-full max-w-[26rem] flex-col border-r border-rule bg-bg shadow-[8px_0_24px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-rule px-4 py-3">
          <h3 className="font-fantasy text-lg tracking-wide text-gold">DM Toolbox</h3>
          <button
            type="button"
            onClick={close}
            aria-label="Close DM Toolbox"
            className="rounded-md border border-rule px-2 py-1 text-dim transition-colors hover:border-hover hover:text-ink"
          >
            &times;
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
          <div className="shrink-0">
            <h4 className="font-fantasy text-sm uppercase tracking-[0.2em] text-gold-bright">
              Loot generator
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-faint">
              Grounded on this campaign's setting, premise and party. Nothing is saved —
              read it out, keep what you like.
            </p>
          </div>

          <div className="shrink-0">
            <LootGeneratorForm
              isGenerating={generateLoot.isPending}
              onSubmit={runGeneration}
            />
          </div>

          <div className="h-px shrink-0 bg-rule" />

          {generateLoot.isPending ? (
            <div className="custom-scrollbar min-h-0 flex-1">
              <LootSkeleton />
            </div>
          ) : errorMessage ? (
            <div className="shrink-0 rounded-md border border-rust/60 bg-rust/10 p-3">
              <p className="text-sm text-rust-soft">{errorMessage}</p>
            </div>
          ) : generation ? (
            <LootResultCard
              generation={generation}
              isRegenerating={generateLoot.isPending}
              onRegenerate={regenerate}
            />
          ) : (
            <p className="shrink-0 text-center text-xs leading-relaxed text-faint">
              Pick what the party found and roll it up.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

export default DmToolboxPanel;
