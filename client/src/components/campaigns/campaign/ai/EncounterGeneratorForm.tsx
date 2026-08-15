import { useState } from "react";
import {
  ENCOUNTER_CONTEXT_MAX_LENGTH,
  ENCOUNTER_DIFFICULTY,
  ENCOUNTER_SIZE_BAND,
  ENCOUNTER_SIZE_BANDS,
  MAX_PARTY_SIZE,
  MIN_PARTY_SIZE,
} from "@dnd/shared/constants/encounter";
import { MAX_LEVEL, MIN_LEVEL } from "@dnd/shared/constants/dndMath";
import type {
  EncounterDifficulty,
  EncounterSizeBand,
} from "@dnd/shared/types/encounter";
import CommonButton from "@/components/ui/buttons/CommonButton";

export type EncounterFormInput = {
  difficulty: EncounterDifficulty;
  sizeBand: EncounterSizeBand;
  partyLevel: number;
  partySize: number;
  context?: string;
};

type EncounterGeneratorFormProps = {
  isGenerating: boolean;
  isDisabled: boolean;
  defaultPartyLevel: number;
  defaultPartySize: number;
  onSubmit: (input: EncounterFormInput) => void;
};

const difficultyOptions: { value: EncounterDifficulty; label: string }[] = [
  { value: ENCOUNTER_DIFFICULTY.Easy, label: "Easy" },
  { value: ENCOUNTER_DIFFICULTY.Medium, label: "Medium" },
  { value: ENCOUNTER_DIFFICULTY.Hard, label: "Hard" },
  { value: ENCOUNTER_DIFFICULTY.Deadly, label: "Deadly" },
];

const bandRange = (band: EncounterSizeBand): string => {
  const { min, max } = ENCOUNTER_SIZE_BANDS[band];
  return min === max ? `${min}` : `${min}–${max}`;
};

const sizeBandOptions: { value: EncounterSizeBand; label: string }[] = [
  { value: ENCOUNTER_SIZE_BAND.Solo, label: "Solo" },
  { value: ENCOUNTER_SIZE_BAND.Pair, label: "Pair" },
  { value: ENCOUNTER_SIZE_BAND.Group, label: "Group" },
  { value: ENCOUNTER_SIZE_BAND.Horde, label: "Horde" },
];

const fieldLabel =
  "font-fantasy text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dim";

const fieldControl =
  "w-full rounded-md border border-rule bg-surface/60 px-3 py-2 text-sm text-ink outline-none transition-colors hover:border-hover focus:border-gold-dim";

function EncounterGeneratorForm({
  isGenerating,
  isDisabled,
  defaultPartyLevel,
  defaultPartySize,
  onSubmit,
}: EncounterGeneratorFormProps) {
  const [difficulty, setDifficulty] = useState<EncounterDifficulty>(
    ENCOUNTER_DIFFICULTY.Medium,
  );
  const [sizeBand, setSizeBand] = useState<EncounterSizeBand>(
    ENCOUNTER_SIZE_BAND.Group,
  );
  const [partyLevel, setPartyLevel] = useState(defaultPartyLevel);
  const [partySize, setPartySize] = useState(defaultPartySize);
  const [context, setContext] = useState("");

  const handleSubmit = () => {
    onSubmit({
      difficulty,
      sizeBand,
      partyLevel,
      partySize,
      context: context.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>Party level</span>
          <input
            type="number"
            min={MIN_LEVEL}
            max={MAX_LEVEL}
            value={partyLevel}
            onChange={(e) => setPartyLevel(Number(e.target.value))}
            className={fieldControl}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>Party size</span>
          <input
            type="number"
            min={MIN_PARTY_SIZE}
            max={MAX_PARTY_SIZE}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className={fieldControl}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as EncounterDifficulty)}
            className={fieldControl}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>Numbers</span>
          <select
            value={sizeBand}
            onChange={(e) => setSizeBand(e.target.value as EncounterSizeBand)}
            className={fieldControl}
          >
            {sizeBandOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface">
                {option.label} · {bandRange(option.value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className={fieldLabel}>Context</span>
        <textarea
          value={context}
          maxLength={ENCOUNTER_CONTEXT_MAX_LENGTH}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Flooded crypt, the party is out of spell slots and looking for a way out"
          className={`${fieldControl} custom-scrollbar h-20 resize-none placeholder:text-faint/50`}
        />
      </label>

      <CommonButton
        onClick={handleSubmit}
        disabled={isGenerating || isDisabled}
        size="md"
      >
        {isGenerating ? "Rousing the bestiary..." : "Roll an encounter"}
      </CommonButton>

      {isDisabled && (
        <p className="text-center text-xs leading-relaxed text-faint">
          Start an encounter first — the result is written into the open one.
        </p>
      )}
    </div>
  );
}

export default EncounterGeneratorForm;
