import { useState } from "react";
import type { EncounterGeneration, GeneratedEncounterEntry } from "@shared/dto/ai";
import CommonButton from "@/components/ui/buttons/CommonButton";
import { challengeRatingLabel } from "@/utils/dndMath";
import CreatureDetailsModal from "./CreatureDetailsModal";

type EncounterResultCardProps = {
  generation: EncounterGeneration;
  isGenerating: boolean;
  isLanding: boolean;
  isLanded: boolean;
  landingError: string | null;
  onConfirm: () => void;
  onRegenerate: () => void;
};

const DEVIATION_TOLERANCE = 0.15;

const describeDeviation = (ratio: number): { label: string; style: string } => {
  if (ratio > DEVIATION_TOLERANCE) {
    return {
      label: `${Math.round(ratio * 100)}% over budget`,
      style: "text-rust-soft",
    };
  }
  if (ratio < -DEVIATION_TOLERANCE) {
    return {
      label: `${Math.round(Math.abs(ratio) * 100)}% under budget`,
      style: "text-dim",
    };
  }
  return { label: "on budget", style: "text-gold-dim" };
};

function EncounterResultCard({
  generation,
  isGenerating,
  isLanding,
  isLanded,
  landingError,
  onConfirm,
  onRegenerate,
}: EncounterResultCardProps) {
  const [openEntry, setOpenEntry] = useState<GeneratedEncounterEntry | null>(null);
  const { output, meta } = generation;
  const { xp, budget } = output;
  const deviation = describeDeviation(xp.deviationRatio);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 pr-1">
        <div className="shrink-0 rounded-md border border-gold-dim/50 bg-surface-light/30 p-3">
          <span className="font-fantasy text-[10px] uppercase tracking-[0.2em] text-gold-dim">
            Read aloud
          </span>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
            {output.readAloud}
          </p>
        </div>

        <ul className="flex shrink-0 flex-col gap-2">
          {output.entries.map((entry) => (
            <li key={entry.slug}>
              <button
                type="button"
                onClick={() => setOpenEntry(entry)}
                className="w-full rounded-md border border-rule bg-surface/50 p-3 text-left transition-colors hover:border-hover hover:bg-surface-light/30"
              >
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-fantasy text-base text-gold">
                    {entry.count > 1 ? `${entry.count} × ` : ""}
                    {entry.name}
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-faint">
                    CR {challengeRatingLabel(entry.challengeRating) ?? "?"} ·{" "}
                    {entry.xpEach * entry.count} XP
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-dim">{entry.note}</p>
              </button>
            </li>
          ))}
        </ul>

        <div className="shrink-0 rounded-md border border-rule bg-surface/40 p-3">
          <span className="font-fantasy text-[10px] uppercase tracking-[0.2em] text-gold-dim">
            Tactics
          </span>
          <p className="mt-2 text-xs leading-relaxed text-dim">{output.tacticalNote}</p>
        </div>

        <dl className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-1 rounded-md border border-rule bg-surface-light/10 p-3 text-xs">
          <dt className="text-faint">Creatures</dt>
          <dd className="text-right text-ink">{xp.creatureCount}</dd>
          <dt className="text-faint">Raw XP</dt>
          <dd className="text-right text-ink">{xp.rawXp}</dd>
          <dt className="text-faint">Adjusted (×{xp.multiplier})</dt>
          <dd className="text-right text-ink">{xp.adjustedXp}</dd>
          <dt className="text-faint">{budget.difficulty} threshold</dt>
          <dd className="text-right text-ink">{xp.thresholdXp}</dd>
          <dt className="text-faint">Deviation</dt>
          <dd className={`text-right ${deviation.style}`}>{deviation.label}</dd>
        </dl>

        {landingError && (
          <div className="shrink-0 rounded-md border border-rust/60 bg-rust/10 p-3">
            <p className="text-sm text-rust-soft">{landingError}</p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-rule pt-3">
        <CommonButton
          onClick={onRegenerate}
          variant="secondary"
          size="sm"
          disabled={isGenerating || isLanding}
        >
          {isGenerating ? "Rolling..." : "Regenerate"}
        </CommonButton>
        <CommonButton
          onClick={onConfirm}
          variant="accept"
          size="sm"
          disabled={isLanding || isLanded || isGenerating}
        >
          {isLanded ? "Added" : isLanding ? "Adding..." : `Add ${xp.creatureCount}`}
        </CommonButton>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-faint">
          {meta.provider} · {meta.model}
        </span>
      </div>

      {openEntry ? (
        <CreatureDetailsModal entry={openEntry} onClose={() => setOpenEntry(null)} />
      ) : null}
    </div>
  );
}

export default EncounterResultCard;
