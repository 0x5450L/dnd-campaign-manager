import { useState } from "react";
import type { AbilityName } from "../../../types/characters/characterSheet";
import { MobileHeader } from "../shared/navigation/MobileHeader";
import { MobileTabBar, type MobileTabConfig } from "../shared/navigation/MobileTabBar";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { CombatStats } from "../shared/sections/CombatStats";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { AbilityScore } from "../shared/sections/AbilityScore";
import { NotesBlock } from "../shared/sections/NotesBlock";
import { CreatureHeader } from "./sections/CreatureHeader";
import { CreatureDetails } from "./sections/CreatureDetails";
import { CreatureTraits } from "./sections/traits/CreatureTraits";

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

type CreatureTab = "combat" | "stats" | "details";

const CREATURE_TABS: MobileTabConfig<CreatureTab>[] = [
  { id: "combat", label: "Combat", icon: "⚔" },
  { id: "stats", label: "Stats", icon: "◆" },
  { id: "details", label: "Details", icon: "📜" },
];

type MobileCreatureSheetProps = {
  onClose: () => void;
  onForceSave?: () => void;
};

export const MobileCreatureSheet = ({ onClose, onForceSave }: MobileCreatureSheetProps) => {
  const [activeTab, setActiveTab] = useState<CreatureTab>("combat");

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <MobileHeader onClose={onClose} onForceSave={onForceSave} />

      <div className="flex-1 overflow-y-auto p-3 pb-3 flex flex-col gap-3">
        {activeTab === "combat" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-center"><ArmorClass /></div>
              <HitPoints />
            </div>
            <CombatStats />
            <AttacksTable />
          </>
        )}

        {activeTab === "stats" && (
          <div className="grid grid-cols-2 gap-3">
            {ALL_ABILITIES.map((ability) => (
              <AbilityScore key={ability} ability={ability} />
            ))}
          </div>
        )}

        {activeTab === "details" && (
          <>
            <CreatureHeader />
            <CreatureDetails />
            <CreatureTraits />
            <NotesBlock />
          </>
        )}
      </div>

      <MobileTabBar tabs={CREATURE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
