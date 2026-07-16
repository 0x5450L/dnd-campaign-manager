import { useEffect, useState } from "react";
import { useLiveSession } from "@/hooks/useLiveSession";
import type {
  CreateParticipantPayload,
  EncounterParticipantDTO,
  ParticipantType,
} from "@/types/encounter";
import type { SrdCreature } from "@shared/dto/srd";
import { srdCreatureToParticipant } from "@/utils/srd/creatureParticipantMapper";
import CommonButton from "@/components/ui/buttons/CommonButton";
import CreatureBrowser from "../characters/CreatureBrowser";
import { CloseIcon } from "./participantCard/blocks/icons";
import ParticipantEditorBody from "./participantCard/modal/ParticipantEditorBody";

type AddParticipantModalProps = {
  onClose: () => void;
};

const ADDABLE_TYPES: { value: ParticipantType; label: string }[] = [
  { value: "monster", label: "Monster" },
  { value: "npc", label: "NPC" },
];

const blankParticipant = (type: ParticipantType): EncounterParticipantDTO => ({
  id: "",
  encounterId: "",
  characterId: null,
  type,
  name: "",
  sortOrder: 0,
  maxHp: 10,
  currentHp: 10,
  tempHp: 0,
  armorClass: 12,
  attacks: [],
  conditions: [],
  isVisible: true,
  acHidden: false,
  typeHidden: false,
  usesShield: false,
  abilityScores: null,
  spellAbility: null,
  proficiencyBonus: null,
  spellSlots: null,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  speed: null,
  senses: null,
  challengeRating: null,
  damageVulnerabilities: null,
  damageResistances: null,
  damageImmunities: null,
  conditionImmunities: null,
  abilities: null,
  resources: null,
  createdAt: "",
  updatedAt: "",
});

export const AddParticipantModal = ({ onClose }: AddParticipantModalProps) => {
  const { addParticipant } = useLiveSession();
  const [draft, setDraft] = useState<EncounterParticipantDTO>(() => blankParticipant("monster"));
  const [isBestiaryOpen, setIsBestiaryOpen] = useState(false);

  const updateDraft = (fields: Partial<EncounterParticipantDTO>) =>
    setDraft((current) => ({ ...current, ...fields }));

  const handlePickCreature = (creature: SrdCreature) => {
    setDraft((current) => ({ ...current, ...srdCreatureToParticipant(creature) }));
    setIsBestiaryOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isBestiaryOpen) setIsBestiaryOpen(false);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, isBestiaryOpen]);

  const canSubmit = draft.name.trim().length > 0 && draft.maxHp >= 1;

  const submit = () => {
    if (!canSubmit) return;
    const payload: CreateParticipantPayload = {
      type: draft.type,
      name: draft.name.trim(),
      sortOrder: draft.sortOrder,
      maxHp: draft.maxHp,
      currentHp: draft.currentHp,
      armorClass: draft.armorClass,
      tempHp: draft.tempHp,
      conditions: draft.conditions,
      isVisible: draft.isVisible,
      acHidden: draft.acHidden,
      typeHidden: draft.typeHidden,
      abilityScores: draft.abilityScores,
      spellAbility: draft.spellAbility,
      proficiencyBonus: draft.proficiencyBonus,
      spellSlots: draft.spellSlots,
      attacks: draft.attacks as CreateParticipantPayload["attacks"],
      speed: draft.speed,
      senses: draft.senses,
      challengeRating: draft.challengeRating,
      damageVulnerabilities: draft.damageVulnerabilities,
      damageResistances: draft.damageResistances,
      damageImmunities: draft.damageImmunities,
      conditionImmunities: draft.conditionImmunities,
      abilities: draft.abilities,
      resources: draft.resources,
    };
    addParticipant(payload);
    setDraft(blankParticipant("monster"));
  };

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="custom-scrollbar relative flex max-h-[85vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-md border border-rule bg-surface p-4 shadow-xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <input
            autoFocus
            value={draft.name}
            onChange={(e) => updateDraft({ name: e.target.value })}
            placeholder="New participant"
            aria-label="Participant name"
            className="w-full truncate rounded border-b border-rule bg-transparent font-fantasy text-xl sm:text-2xl font-bold text-gold-bright placeholder:text-faint focus:border-hover focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-rule text-faint transition-colors hover:border-hover hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex gap-2">
          {ADDABLE_TYPES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateDraft({ type: option.value })}
              className={`flex-1 rounded-md border px-3 py-2 font-fantasy text-sm uppercase tracking-widest transition-colors ${
                draft.type === option.value
                  ? "border-gold bg-gold/10 text-gold-bright"
                  : "border-rule text-dim hover:border-hover hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {draft.type === "monster" && (
          <button
            type="button"
            onClick={() => setIsBestiaryOpen(true)}
            className="rounded-md border border-dashed border-rule px-3 py-2 font-fantasy text-sm uppercase tracking-widest text-dim transition-colors hover:border-gold hover:text-gold-bright"
          >
            Prefill from bestiary
          </button>
        )}

        <ParticipantEditorBody
          draft={draft}
          updateDraft={updateDraft}
          canEditOwn
          canManage
        />

        <div className="flex justify-end gap-2">
          <CommonButton onClick={onClose} variant="decline" size="sm">
            Cancel
          </CommonButton>
          <CommonButton onClick={submit} variant="accept" size="sm" disabled={!canSubmit}>
            Add
          </CommonButton>
        </div>
      </div>
    </div>

    <CreatureBrowser
      isOpen={isBestiaryOpen}
      onClose={() => setIsBestiaryOpen(false)}
      onSelectCreature={handlePickCreature}
    />
    </>
  );
};

export default AddParticipantModal;
