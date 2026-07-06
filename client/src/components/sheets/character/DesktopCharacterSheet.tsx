import type { AbilityName } from "../../../types/characters/characterSheet";
import { CharacterLore } from "./sections/CharacterLore";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { HitDice } from "./sections/HitDice";
import { DeathSaves } from "./sections/DeathSaves";
import { AbilityScore } from "../shared/sections/AbilityScore";
import { CombatStats } from "../shared/sections/CombatStats";
import { ClassFeatures } from "./sections/ClassFeatures";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { SpellSlots } from "./sections/SpellSlots";
import { NotesBlock } from "../shared/sections/NotesBlock";
import { RacialTraits } from "./sections/RacialTraits";
import { Feats } from "./sections/Feats";
import { SheetDetails } from "../shared/sections/SheetDetails";
import { Proficiencies } from "./sections/Proficiencies";

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

export const DesktopCharacterSheet = () => (
  <div className="min-h-screen py-4">
    <div className="flex flex-col gap-3 max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-[420px_1fr] lg:grid-rows-[auto_1fr]">
      <CharacterLore />

      <div className="flex flex-wrap gap-3">
        <ArmorClass />
        <HitPoints />
        <HitDice />
        <DeathSaves />
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
      </div>

      <div className="contents lg:flex lg:flex-col lg:gap-3">
        <div className="flex flex-col gap-3 order-3 sm:flex-row sm:items-stretch lg:order-0">
          <CombatStats />
          <ClassFeatures />
        </div>

        <div className="order-4 lg:order-0">
          <AttacksTable />
        </div>

        <div className="order-4 lg:order-0">
          <SpellSlots />
        </div>

        <div className="grid grid-cols-1 gap-3 order-7 sm:grid-cols-2 lg:order-0">
          <RacialTraits />
          <Feats />
        </div>

        <div className="order-8 lg:order-0">
          <SheetDetails title="Details" />
        </div>

        <div className="order-9 lg:order-0">
          <Proficiencies />
        </div>
      </div>
    </div>
  </div>
);
