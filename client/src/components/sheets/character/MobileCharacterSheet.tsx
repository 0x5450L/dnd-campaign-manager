import { useState } from "react";
import type { AbilityName } from "../../../types/characters/characterSheet";
import { MobileHeader } from "../shared/navigation/MobileHeader";
import { MobileTabBar, type MobileTabConfig } from "../shared/navigation/MobileTabBar";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { HitDice } from "./sections/HitDice";
import { DeathSaves } from "./sections/DeathSaves";
import { CombatStats } from "../shared/sections/CombatStats";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { SpellSlots } from "./sections/SpellSlots";
import { AbilityScore } from "../shared/sections/AbilityScore";
import { CharacterLore } from "./sections/CharacterLore";
import { ClassFeatures } from "./sections/ClassFeatures";
import { NotesBlock } from "../shared/sections/NotesBlock";
import { RacialTraits } from "./sections/RacialTraits";
import { Feats } from "./sections/Feats";
import { SheetDetails } from "../shared/sections/SheetDetails";
import { Proficiencies } from "./sections/Proficiencies";

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

type CharacterTab = "combat" | "stats" | "lore";

const CHARACTER_TABS: MobileTabConfig<CharacterTab>[] = [
  { id: "combat", label: "Combat", icon: "⚔" },
  { id: "stats", label: "Stats", icon: "◆" },
  { id: "lore", label: "Lore", icon: "📜" },
];

type MobileCharacterSheetProps = {
  onClose: () => void;
  onForceSave?: () => void;
};

export const MobileCharacterSheet = ({ onClose, onForceSave }: MobileCharacterSheetProps) => {
  const [activeTab, setActiveTab] = useState<CharacterTab>("combat");

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <MobileHeader onClose={onClose} onForceSave={onForceSave} />

      <div className="flex-1 overflow-y-auto p-3 pb-3 flex flex-col gap-3">
        {activeTab === "combat" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-center"><ArmorClass /></div>
              <HitPoints />
              <HitDice />
              <DeathSaves />
            </div>
            <CombatStats />
            <AttacksTable />
            <SpellSlots />
          </>
        )}

        {activeTab === "stats" && (
          <div className="grid grid-cols-2 gap-3">
            {ALL_ABILITIES.map((ability) => (
              <AbilityScore key={ability} ability={ability} />
            ))}
          </div>
        )}

        {activeTab === "lore" && (
          <>
            <CharacterLore />
            <ClassFeatures />
            <RacialTraits />
            <Feats />
            <NotesBlock />
            <SheetDetails title="Details" />
            <Proficiencies />
          </>
        )}
      </div>

      <MobileTabBar tabs={CHARACTER_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
