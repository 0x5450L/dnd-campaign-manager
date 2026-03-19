type ProficienciesBlockProps = {
  armorProficiencies: string;
  weaponProficiencies: string;
  toolProficiencies: string;
  onUpdate: (field: string, value: string) => void;
};

export const ProficienciesBlock = ({
  armorProficiencies, weaponProficiencies, toolProficiencies, onUpdate,
}: ProficienciesBlockProps) => {
  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
        Proficiencies & Equipment
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <span className="text-gray-500 text-[10px] uppercase">Armor</span>
          <input
            type="text"
            value={armorProficiencies}
            onChange={(e) => onUpdate("armorProficiencies", e.target.value)}
            className="w-full bg-transparent text-gray-200 text-xs outline-none border-b border-gray-700 pb-1 mt-0.5"
            placeholder="Light, Medium, Shields..."
          />
        </div>
        <div>
          <span className="text-gray-500 text-[10px] uppercase">Weapons</span>
          <input
            type="text"
            value={weaponProficiencies}
            onChange={(e) => onUpdate("weaponProficiencies", e.target.value)}
            className="w-full bg-transparent text-gray-200 text-xs outline-none border-b border-gray-700 pb-1 mt-0.5"
            placeholder="Simple, Martial..."
          />
        </div>
        <div>
          <span className="text-gray-500 text-[10px] uppercase">Tools</span>
          <input
            type="text"
            value={toolProficiencies}
            onChange={(e) => onUpdate("toolProficiencies", e.target.value)}
            className="w-full bg-transparent text-gray-200 text-xs outline-none border-b border-gray-700 pb-1 mt-0.5"
            placeholder="Thieves' tools..."
          />
        </div>
      </div>
    </div>
  );
};
