import { useState } from "react";
import {
  LOOT_CONTEXT_MAX_LENGTH,
  LOOT_FIND_TYPE,
  LOOT_ITEM_COUNT,
  LOOT_RICHNESS,
} from "@shared/constants/ai";
import type { LootFindType, LootRichness } from "@shared/dto/ai";
import CommonButton from "@/components/ui/buttons/CommonButton";

type LootGeneratorFormProps = {
  isGenerating: boolean;
  onSubmit: (input: {
    findType: LootFindType;
    richness: LootRichness;
    itemCount: number;
    context?: string;
  }) => void;
};

const findTypeOptions: { value: LootFindType; label: string }[] = [
  { value: LOOT_FIND_TYPE.Hoard, label: "Hoard" },
  { value: LOOT_FIND_TYPE.Body, label: "On a body" },
  { value: LOOT_FIND_TYPE.Stash, label: "Hidden stash" },
  { value: LOOT_FIND_TYPE.Reward, label: "Reward" },
];

const richnessOptions: { value: LootRichness; label: string }[] = [
  { value: LOOT_RICHNESS.Meager, label: "Meagre" },
  { value: LOOT_RICHNESS.Modest, label: "Modest" },
  { value: LOOT_RICHNESS.Generous, label: "Generous" },
];

const fieldLabel =
  "font-fantasy text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dim";

const fieldControl =
  "w-full rounded-md border border-rule bg-surface/60 px-3 py-2 text-sm text-ink outline-none transition-colors hover:border-hover focus:border-gold-dim";

function LootGeneratorForm({ isGenerating, onSubmit }: LootGeneratorFormProps) {
  const [findType, setFindType] = useState<LootFindType>(LOOT_FIND_TYPE.Hoard);
  const [richness, setRichness] = useState<LootRichness>(LOOT_RICHNESS.Modest);
  const [itemCount, setItemCount] = useState<number>(LOOT_ITEM_COUNT.Default);
  const [context, setContext] = useState("");

  const handleSubmit = () => {
    onSubmit({
      findType,
      richness,
      itemCount,
      context: context.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>Find</span>
          <select
            value={findType}
            onChange={(e) => setFindType(e.target.value as LootFindType)}
            className={fieldControl}
          >
            {findTypeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>Value</span>
          <select
            value={richness}
            onChange={(e) => setRichness(e.target.value as LootRichness)}
            className={fieldControl}
          >
            {richnessOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface">
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className={fieldLabel}>Items · {itemCount}</span>
        <input
          type="range"
          min={LOOT_ITEM_COUNT.Min}
          max={LOOT_ITEM_COUNT.Max}
          value={itemCount}
          onChange={(e) => setItemCount(Number(e.target.value))}
          className="accent-[var(--color-gold)]"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={fieldLabel}>Context</span>
        <textarea
          value={context}
          maxLength={LOOT_CONTEXT_MAX_LENGTH}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Cult shrine under the docks, the party just killed the priest"
          className={`${fieldControl} custom-scrollbar h-20 resize-none placeholder:text-faint/50`}
        />
      </label>

      <CommonButton onClick={handleSubmit} disabled={isGenerating} size="md">
        {isGenerating ? "Consulting the loremaster..." : "Generate loot"}
      </CommonButton>
    </div>
  );
}

export default LootGeneratorForm;
