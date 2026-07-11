import type { CharacterAttackDTO } from "../../../../../../../types/characters/characters";
import { formatSigned } from "../../../../../../../utils/dndMath";
import EditableNumber from "../../blocks/EditableNumber";
import EditableText from "../EditableText";
import { PlusIcon, CloseIcon } from "../../blocks/icons";

type AttacksBlockProps = {
  attacks: CharacterAttackDTO[];
  editable: boolean;
  onChange: (attacks: CharacterAttackDTO[]) => void;
};

const newAttackId = () => `att-${Math.random().toString(36).slice(2, 10)}`;

export const AttacksBlock = ({
  attacks,
  editable,
  onChange,
}: AttacksBlockProps) => {
  const patchAttack = (id: string, patch: Partial<CharacterAttackDTO>) => {
    onChange(attacks.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAttack = (id: string) => {
    onChange(attacks.filter((a) => a.id !== id));
  };

  const addAttack = () => {
    onChange([
      ...attacks,
      {
        id: newAttackId(),
        name: "New attack",
        damage: "1d6",
        attackBonus: 0,
        notes: null,
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
          Attacks
        </span>
        {editable && (
          <button
            type="button"
            onClick={addAttack}
            aria-label="Add attack"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-rule text-faint transition-colors hover:border-hover hover:text-ink"
          >
            <PlusIcon />
          </button>
        )}
      </div>

      {attacks.length === 0 ? (
        <span className="rounded border border-rule/60 bg-bg/30 px-2 py-2 text-center font-fantasy text-sm sm:text-base text-faint">
          No attacks
        </span>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {attacks.map((attack) => (
            <li
              key={attack.id}
              className="flex flex-col gap-1 rounded border border-rule bg-bg/40 px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                <EditableText
                  value={attack.name}
                  editable={editable}
                  onCommit={(name) => patchAttack(attack.id, { name })}
                  ariaLabel="Attack name"
                  className="min-w-0 flex-1 font-fantasy text-sm sm:text-base text-ink"
                />
                <span className="text-xs sm:text-sm uppercase tracking-widest text-faint">
                  atk
                </span>
                {editable ? (
                  <EditableNumber
                    value={attack.attackBonus}
                    editable
                    onCommit={(attackBonus) =>
                      patchAttack(attack.id, { attackBonus })
                    }
                    ariaLabel="Attack bonus"
                    className="w-10 rounded border border-rule/60 font-fantasy text-sm sm:text-base text-ink focus:border-hover"
                  />
                ) : (
                  <span className="w-10 text-center font-fantasy text-sm sm:text-base text-ink">
                    {formatSigned(attack.attackBonus)}
                  </span>
                )}
                <span className="text-xs sm:text-sm uppercase tracking-widest text-faint">
                  dmg
                </span>
                <EditableText
                  value={attack.damage}
                  editable={editable}
                  onCommit={(damage) => patchAttack(attack.id, { damage })}
                  ariaLabel="Attack damage"
                  className={`w-24 px-2 text-center font-fantasy text-sm sm:text-base text-ink ${
                    editable
                      ? "rounded border border-rule/60 focus:border-hover"
                      : ""
                  }`}
                />
                {editable && (
                  <button
                    type="button"
                    onClick={() => removeAttack(attack.id)}
                    aria-label={`Remove ${attack.name}`}
                    className="text-faint transition-colors hover:text-rust"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
              {(editable || (attack.notes && attack.notes.length > 0)) && (
                <EditableText
                  value={attack.notes ?? ""}
                  editable={editable}
                  onCommit={(notes) =>
                    patchAttack(attack.id, {
                      notes: notes.length > 0 ? notes : null,
                    })
                  }
                  allowEmpty
                  placeholder={editable ? "Notes" : undefined}
                  ariaLabel="Attack notes"
                  className="w-full text-xs sm:text-sm italic text-dim placeholder:text-faint"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttacksBlock;
