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
    <div className="border border-gray-700 rounded-lg bg-gray-800/30 p-3">
      <div className="text-center text-[10px] uppercase tracking-wider text-gray-500 mb-2">
        Attacks & Spellcasting
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-500 font-normal p-1 text-[10px] uppercase">Name</th>
            <th className="text-center text-gray-500 font-normal p-1 text-[10px] uppercase">Atk Bonus</th>
            <th className="text-center text-gray-500 font-normal p-1 text-[10px] uppercase">Damage/Type</th>
            <th className="text-left text-gray-500 font-normal p-1 text-[10px] uppercase">Notes</th>
            <th className="w-6"></th>
          </tr>
        </thead>
        <tbody>
          {attacks.map((attack) => (
            <tr key={attack.id} className="border-b border-gray-700/50 group">
              <td className="p-0.5">
                <input
                  type="text"
                  value={attack.name}
                  onChange={(e) => onUpdate(attack.id, "name", e.target.value)}
                  className="w-full bg-transparent text-gray-200 outline-none p-1 text-xs"
                  placeholder="Weapon..."
                />
              </td>
              <td className="p-0.5">
                <input
                  type="text"
                  value={attack.attackBonus}
                  onChange={(e) => onUpdate(attack.id, "attackBonus", e.target.value)}
                  className="w-full bg-transparent text-gray-200 text-center outline-none p-1 text-xs"
                  placeholder="+5"
                />
              </td>
              <td className="p-0.5">
                <input
                  type="text"
                  value={attack.damage}
                  onChange={(e) => onUpdate(attack.id, "damage", e.target.value)}
                  className="w-full bg-transparent text-gray-200 text-center outline-none p-1 text-xs"
                  placeholder="1d8+3"
                />
              </td>
              <td className="p-0.5">
                <input
                  type="text"
                  value={attack.notes}
                  onChange={(e) => onUpdate(attack.id, "notes", e.target.value)}
                  className="w-full bg-transparent text-gray-200 outline-none p-1 text-xs"
                  placeholder="..."
                />
              </td>
              <td className="p-0.5">
                <button
                  onClick={() => onRemove(attack.id)}
                  className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
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
        className="mt-2 text-gray-500 hover:text-amber-400 text-xs transition-colors"
      >
        + Add attack
      </button>
    </div>
  );
};
