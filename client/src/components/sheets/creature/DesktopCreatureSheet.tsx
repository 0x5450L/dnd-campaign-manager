import type { AbilityName } from "../../../types/characters/characterSheet";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { AbilityScore } from "../shared/sections/AbilityScore";
import { CombatStats } from "../shared/sections/CombatStats";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { NotesBlock } from "../shared/sections/NotesBlock";
import { CreatureHeader } from "./sections/CreatureHeader";
import { CreatureDetails } from "./sections/CreatureDetails";
import { CreatureTraits } from "./sections/CreatureTraits";

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

export const DesktopCreatureSheet = () => (
  <div className="min-h-screen py-4">
    <div className="flex flex-col gap-3 max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-[420px_1fr] lg:grid-rows-[auto_1fr]">
      <CreatureHeader />

      <div className="flex flex-wrap gap-3">
        <ArmorClass />
        <HitPoints />
      </div>

      <div className="contents lg:flex lg:flex-col lg:gap-3">
        <div className="order-5 lg:order-0">
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
            {ALL_ABILITIES.map((ability) => (
              <AbilityScore key={ability} ability={ability} />
            ))}
          </div>
        </div>

        <div className="order-6 lg:order-0">
          <NotesBlock />
        </div>

        <div className="order-7 lg:order-0">
          <CreatureDetails />
        </div>
      </div>

      <div className="contents lg:flex lg:flex-col lg:gap-3">
        <div className="order-3 lg:order-0">
          <CombatStats />
        </div>

        <div className="order-4 lg:order-0">
          <AttacksTable />
        </div>

        <div className="order-8 lg:order-0">
          <CreatureTraits />
        </div>
      </div>
    </div>
  </div>
);
