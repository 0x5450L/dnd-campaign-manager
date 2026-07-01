type ProficienciesProps = {
  armorProficiencies: string;
  weaponProficiencies: string;
  toolProficiencies: string;
  onUpdate: (field: string, value: string) => void;
};

export const Proficiencies = ({
  armorProficiencies, weaponProficiencies, toolProficiencies, onUpdate,
}: ProficienciesProps) => {
  return (
    <div className="cs-section-card p-3">
      <div className="cs-section-title">Proficiencies & Equipment</div>

      <div className="flex flex-col gap-3">
        <div>
          <span className="cs-label">Armor</span>
          <div className="cs-input-wrap mt-0.5">
            <input
              type="text"
              value={armorProficiencies}
              onChange={(e) => onUpdate("armorProficiencies", e.target.value)}
              className="cs-input text-xs"
              placeholder="Light, Medium, Shields..."
            />
          </div>
        </div>

        <div>
          <span className="cs-label">Weapons</span>
          <div className="cs-input-wrap mt-0.5">
            <input
              type="text"
              value={weaponProficiencies}
              onChange={(e) => onUpdate("weaponProficiencies", e.target.value)}
              className="cs-input text-xs"
              placeholder="Simple, Martial..."
            />
          </div>
        </div>

        <div>
          <span className="cs-label">Tools</span>
          <div className="cs-input-wrap mt-0.5">
            <input
              type="text"
              value={toolProficiencies}
              onChange={(e) => onUpdate("toolProficiencies", e.target.value)}
              className="cs-input text-xs"
              placeholder="Thieves' tools..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
