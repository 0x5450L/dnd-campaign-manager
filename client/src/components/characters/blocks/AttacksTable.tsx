import { MIN_ATTACKS } from "../../../constants/characterSheet";
import type { Attack } from "../../../types/characters/characterSheet";

type AttacksTableProps = {
  attacks: Attack[];
  onUpdate: (id: string, field: keyof Attack, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
};

export const AttacksTable = ({ attacks, onUpdate, onAdd, onRemove }: AttacksTableProps) => {
  const canRemove = attacks.length > MIN_ATTACKS;

  return (
    <div className="cs-section-card p-3">
      <div className="cs-section-title">Attacks & Spellcasting</div>

      <div className="cs-table">
        {/* Header */}
        <div className="cs-table-header-row">
          <span className="cs-table-header cs-table-col-3 text-left">Name</span>
          <span className="cs-table-header cs-table-col-2 text-center">Atk Bonus</span>
          <span className="cs-table-header cs-table-col-3 text-center">Damage/Type</span>
          <span className="cs-table-header cs-table-col-2 text-left">Notes</span>
          <span className="cs-table-col-action"></span>
        </div>

        {/* Scrollable rows */}
        <div className="cs-table-scroll custom-scrollbar">
          {attacks.map((attack) => (
            <div key={attack.id} className="cs-table-row group">
              <div className="cs-table-col-3">
                <input
                  type="text"
                  value={attack.name}
                  onChange={(e) => onUpdate(attack.id, "name", e.target.value)}
                  placeholder="Weapon..."
                />
              </div>
              <div className="cs-table-col-2">
                <input
                  type="text"
                  value={attack.attackBonus}
                  onChange={(e) => onUpdate(attack.id, "attackBonus", e.target.value)}
                  className="text-center"
                  placeholder="+5"
                />
              </div>
              <div className="cs-table-col-3">
                <input
                  type="text"
                  value={attack.damage}
                  onChange={(e) => onUpdate(attack.id, "damage", e.target.value)}
                  className="text-center"
                  placeholder="1d8+3 slashing"
                />
              </div>
              <div className="cs-table-col-2">
                <input
                  type="text"
                  value={attack.notes}
                  onChange={(e) => onUpdate(attack.id, "notes", e.target.value)}
                  placeholder="..."
                />
              </div>
              <div className="cs-table-col-action">
                {canRemove && (
                  <button
                    onClick={() => onRemove(attack.id)}
                    className="cs-table-remove-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onAdd} className="cs-table-add-btn">
        + Add attack
      </button>
    </div>
  );
};