import type { AbilityName } from "../../../types/characters/characterSheet";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { AbilityScore } from "../shared/sections/AbilityScore";
import { CombatStats } from "../shared/sections/CombatStats";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { NotesBlock } from "../shared/sections/NotesBlock";
import { CreatureHeader } from "./sections/CreatureHeader";
import { CreatureDetails } from "./sections/CreatureDetails";
import { SpecialAbilities } from "../shared/sections/specialAbilities/SpecialAbilities";

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

export const DesktopCreatureSheet = () => (
  <div className="min-h-screen py-4">
    <div className="flex flex-col gap-3 max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-[420px_1fr] lg:items-start lg:gap-3">
      <div className="flex flex-col gap-3">
        <CreatureHeader />

        <div className="flex flex-wrap gap-3">
          <ArmorClass />
          <HitPoints />
        </div>

        <CombatStats />

        <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
          {ALL_ABILITIES.map((ability) => (
            <AbilityScore key={ability} ability={ability} />
          ))}
        </div>

        <NotesBlock />
      </div>

      <div className="flex flex-col gap-3">
        <AttacksTable />
        <CreatureDetails />
        <SpecialAbilities />
      </div>
    </div>
  </div>
);
