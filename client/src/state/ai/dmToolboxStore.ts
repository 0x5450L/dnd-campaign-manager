import { create } from "zustand";
import type { EncounterGeneration, LootGeneration } from "@dnd/shared/dto/ai";

export type DmTool = "loot" | "encounter";

type DmToolboxStore = {
  isOpen: boolean;
  activeTool: DmTool;
  lootGeneration: LootGeneration | null;
  encounterGeneration: EncounterGeneration | null;
  landedGenerationId: string | null;
  open: (tool?: DmTool) => void;
  close: () => void;
  toggle: () => void;
  setActiveTool: (tool: DmTool) => void;
  setLootGeneration: (generation: LootGeneration | null) => void;
  setEncounterGeneration: (generation: EncounterGeneration | null) => void;
  markGenerationLanded: (generationId: string) => void;
};

export const useDmToolboxStore = create<DmToolboxStore>((set) => ({
  isOpen: false,
  activeTool: "loot",
  lootGeneration: null,
  encounterGeneration: null,
  landedGenerationId: null,
  open: (tool = "loot") => set({ isOpen: true, activeTool: tool }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setLootGeneration: (generation) => set({ lootGeneration: generation }),
  setEncounterGeneration: (generation) =>
    set({ encounterGeneration: generation }),
  markGenerationLanded: (generationId) =>
    set({ landedGenerationId: generationId }),
}));
