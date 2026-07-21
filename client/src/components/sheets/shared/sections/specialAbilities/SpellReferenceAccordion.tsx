import { useState } from "react";
import type { SrdSpell } from "@shared/dto/srd";
import { useSrdSpellIndexQuery } from "@/queries/srd";
import { lookupSpell } from "@/utils/srd/spellIndex";

const levelLabel = (level: number): string =>
  level === 0 ? "Cantrip" : `Level ${level}`;

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-1.5">
    <span className="shrink-0 text-faint uppercase tracking-[0.08em]">{label}</span>
    <span className="text-ink">{value}</span>
  </div>
);

export const SpellDetailBody = ({ spell }: { spell: SrdSpell }) => {
  const components = spell.components.join(", ");
  const tags = [
    spell.concentration ? "Concentration" : null,
    spell.ritual ? "Ritual" : null,
  ].filter((tag): tag is string => tag !== null);

  return (
    <div className="flex flex-col gap-2 border-t border-rule/50 px-2 py-2 text-[11px] leading-relaxed">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <MetaRow label="Cast" value={spell.castingTime} />
        <MetaRow label="Range" value={spell.range} />
        <MetaRow label="Duration" value={spell.duration} />
        {components !== "" && <MetaRow label="Comp" value={components} />}
      </div>

      {spell.material && (
        <p className="text-dim">
          <span className="text-faint uppercase tracking-[0.08em]">Material </span>
          {spell.material}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-gold/40 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-gold"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="whitespace-pre-line text-ink">{spell.description}</p>

      {spell.higherLevel && (
        <p className="whitespace-pre-line text-dim">
          <span className="text-faint uppercase tracking-[0.08em]">At higher levels </span>
          {spell.higherLevel}
        </p>
      )}
    </div>
  );
};

type SpellReferenceAccordionProps = {
  name: string;
};

export const SpellReferenceAccordion = ({ name }: SpellReferenceAccordionProps) => {
  const [open, setOpen] = useState(false);
  const { data: index } = useSrdSpellIndexQuery();
  const spell = index ? lookupSpell(index, name) : null;

  if (!spell) {
    return null;
  }

  const school = spell.school ? ` · ${spell.school}` : "";

  return (
    <div className="rounded border border-rule/60 bg-surface/40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-[11px] uppercase tracking-[0.1em] text-gold cursor-pointer transition-colors hover:text-gold/80"
      >
        <span className="text-faint">{open ? "▾" : "▸"}</span>
        <span>
          SRD · {levelLabel(spell.level)}
          {school}
        </span>
      </button>
      {open && <SpellDetailBody spell={spell} />}
    </div>
  );
};

export default SpellReferenceAccordion;
