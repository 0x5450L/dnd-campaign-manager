type Attack = {
  id: string;
  name: string;
  attackBonus: string;
  damage: string;
  notes: string;
};

type AttacksTableProps = {
  attacks: Attack[];
  onUpdate: (id: string, field: keyof Attack, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
};

export const AttacksTable = ({ attacks, onUpdate, onAdd, onRemove }: AttacksTableProps) => {
  return (
    <div className="cs-section-card p-3">
      <div className="cs-section-title">Attacks & Spellcasting</div>

      <table className="cs-table">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-center">Atk Bonus</th>
            <th className="text-center">Damage/Type</th>
            <th className="text-left">Notes</th>
            <th className="w-6"></th>
          </tr>
        </thead>
        <tbody>
          {attacks.map((attack) => (
            <tr key={attack.id} className="group">
              <td>
                <input
                  type="text"
                  value={attack.name}
                  onChange={(e) => onUpdate(attack.id, "name", e.target.value)}
                  placeholder="Weapon..."
                />
              </td>
              <td>
                <input
                  type="text"
                  value={attack.attackBonus}
                  onChange={(e) => onUpdate(attack.id, "attackBonus", e.target.value)}
                  className="text-center"
                  placeholder="+5"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={attack.damage}
                  onChange={(e) => onUpdate(attack.id, "damage", e.target.value)}
                  className="text-center"
                  placeholder="1d8+3 slashing"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={attack.notes}
                  onChange={(e) => onUpdate(attack.id, "notes", e.target.value)}
                  placeholder="..."
                />
              </td>
              <td>
                <button
                  onClick={() => onRemove(attack.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer"
                  style={{ color: "var(--color-accent-red)" }}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={onAdd}
        className="mt-2 text-xs transition-colors cursor-pointer"
        style={{ color: "var(--color-text-dim)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-gold)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-dim)")}
      >
        + Add attack
      </button>
    </div>
  );
};
