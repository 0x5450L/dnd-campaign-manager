import type { LootFindType, LootRichness } from "@dnd/shared/dto/ai";
import { useGenerateEncounterMutation, useGenerateLootMutation } from "@/queries/ai";
import { useBulkCreateParticipantsMutation } from "@/queries/encounters";
import { useActiveEncounter } from "@/hooks/liveSession/useActiveEncounter";
import { useCampaignPartyProfile } from "@/hooks/useCampaignPartyProfile";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useDmToolboxStore, type DmTool } from "@/state/ai/dmToolboxStore";
import EncounterGeneratorForm, {
  type EncounterFormInput,
} from "./EncounterGeneratorForm";
import EncounterResultCard from "./EncounterResultCard";
import LootGeneratorForm from "./LootGeneratorForm";
import LootResultCard from "./LootResultCard";
import { useOverlayLayer } from "@/hooks/useOverlayLayer";

type DmToolboxPanelProps = {
  campaignId: string;
};

type LootFormInput = {
  findType: LootFindType;
  richness: LootRichness;
  itemCount: number;
  context?: string;
};

const TOOL_TABS: { value: DmTool; label: string }[] = [
  { value: "loot", label: "Loot" },
  { value: "encounter", label: "Encounter" },
];

const TOOL_BLURB: Record<DmTool, string> = {
  loot: "Grounded on this campaign's setting, premise and party. Nothing is saved — read it out, keep what you like.",
  encounter:
    "The XP budget is worked out here, the model only picks from creatures that fit it. Nothing is written into the encounter until you confirm.",
};

function GeneratorSkeleton() {
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
  const activeTool = useDmToolboxStore((s) => s.activeTool);
  const setActiveTool = useDmToolboxStore((s) => s.setActiveTool);
  const lootGeneration = useDmToolboxStore((s) => s.lootGeneration);
  const setLootGeneration = useDmToolboxStore((s) => s.setLootGeneration);
  const encounterGeneration = useDmToolboxStore((s) => s.encounterGeneration);
  const setEncounterGeneration = useDmToolboxStore((s) => s.setEncounterGeneration);
  const landedGenerationId = useDmToolboxStore((s) => s.landedGenerationId);
  const markGenerationLanded = useDmToolboxStore((s) => s.markGenerationLanded);

  const sessionId = useLiveSessionStore((s) => s.session?.id);
  const { encounter } = useActiveEncounter();
  const party = useCampaignPartyProfile(campaignId);

  const generateLoot = useGenerateLootMutation();
  const generateEncounter = useGenerateEncounterMutation();
  const landParticipants = useBulkCreateParticipantsMutation(sessionId);

  useOverlayLayer(close, { enabled: isOpen, lockScroll: true });

  const runLootGeneration = (input: LootFormInput) => {
    generateLoot.mutate(
      { campaignId, ...input },
      { onSuccess: (result) => setLootGeneration(result) },
    );
  };

  const regenerateLoot = () => {
    if (!lootGeneration) return;
    generateLoot.mutate(
      {
        ...lootGeneration.input,
        excludeSlugs: lootGeneration.output.items.map((item) => item.slug),
      },
      { onSuccess: (result) => setLootGeneration(result) },
    );
  };

  const runEncounterGeneration = (input: EncounterFormInput) => {
    if (!encounter) return;
    generateEncounter.mutate(
      { campaignId, encounterId: encounter.id, ...input },
      { onSuccess: (result) => setEncounterGeneration(result) },
    );
  };

  const regenerateEncounter = () => {
    if (!encounterGeneration) return;
    generateEncounter.mutate(
      {
        ...encounterGeneration.input,
        excludeSlugs: encounterGeneration.output.entries.map((entry) => entry.slug),
      },
      { onSuccess: (result) => setEncounterGeneration(result) },
    );
  };

  const confirmEncounter = () => {
    if (!encounterGeneration) return;
    const { participants } = encounterGeneration.output;
    if (participants.length === 0) return;
    landParticipants.mutate(
      { encounterId: encounterGeneration.input.encounterId, participants },
      { onSuccess: () => markGenerationLanded(encounterGeneration.meta.id) },
    );
  };

  const lootError =
    generateLoot.error instanceof Error ? generateLoot.error.message : null;
  const encounterError =
    generateEncounter.error instanceof Error
      ? generateEncounter.error.message
      : null;
  const landingError =
    landParticipants.error instanceof Error
      ? landParticipants.error.message
      : null;

  const isLoot = activeTool === "loot";
  const isPending = isLoot ? generateLoot.isPending : generateEncounter.isPending;
  const activeError = isLoot ? lootError : encounterError;

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
          <div className="flex shrink-0 gap-1 rounded-md border border-rule bg-surface/40 p-1">
            {TOOL_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTool(tab.value)}
                className={`flex-1 rounded px-3 py-1.5 font-fantasy text-xs uppercase tracking-[0.16em] transition-colors ${
                  activeTool === tab.value
                    ? "bg-surface-light/40 text-gold-bright"
                    : "text-dim hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="shrink-0 text-xs leading-relaxed text-faint">
            {TOOL_BLURB[activeTool]}
          </p>

          <div className="shrink-0">
            {isLoot ? (
              <LootGeneratorForm
                isGenerating={generateLoot.isPending}
                onSubmit={runLootGeneration}
              />
            ) : (
              <EncounterGeneratorForm
                key={`${party.partyLevel}:${party.partySize}`}
                isGenerating={generateEncounter.isPending}
                isDisabled={!encounter}
                defaultPartyLevel={party.partyLevel}
                defaultPartySize={party.partySize}
                onSubmit={runEncounterGeneration}
              />
            )}
          </div>

          <div className="h-px shrink-0 bg-rule" />

          {isPending ? (
            <div className="custom-scrollbar min-h-0 flex-1">
              <GeneratorSkeleton />
            </div>
          ) : activeError ? (
            <div className="shrink-0 rounded-md border border-rust/60 bg-rust/10 p-3">
              <p className="text-sm text-rust-soft">{activeError}</p>
            </div>
          ) : isLoot && lootGeneration ? (
            <LootResultCard
              generation={lootGeneration}
              isRegenerating={generateLoot.isPending}
              onRegenerate={regenerateLoot}
            />
          ) : !isLoot && encounterGeneration ? (
            <EncounterResultCard
              generation={encounterGeneration}
              isGenerating={generateEncounter.isPending}
              isLanding={landParticipants.isPending}
              isLanded={landedGenerationId === encounterGeneration.meta.id}
              landingError={landingError}
              onConfirm={confirmEncounter}
              onRegenerate={regenerateEncounter}
            />
          ) : (
            <p className="shrink-0 text-center text-xs leading-relaxed text-faint">
              {isLoot
                ? "Pick what the party found and roll it up."
                : "Set the party and the shape of the fight, then fill the encounter."}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

export default DmToolboxPanel;
