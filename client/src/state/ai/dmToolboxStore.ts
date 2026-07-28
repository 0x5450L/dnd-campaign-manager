import { create } from "zustand";
import type { LootGeneration } from "@shared/dto/ai";

export type DmTool = "loot";

type DmToolboxStore = {
  isOpen: boolean;
  activeTool: DmTool;
  lootGeneration: LootGeneration | null;
  open: (tool?: DmTool) => void;
  close: () => void;
  toggle: () => void;
  setLootGeneration: (generation: LootGeneration | null) => void;
};

export const useDmToolboxStore = create<DmToolboxStore>((set) => ({
  isOpen: false,
  activeTool: "loot",
  lootGeneration: null,
  open: (tool = "loot") => set({ isOpen: true, activeTool: tool }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setLootGeneration: (generation) => set({ lootGeneration: generation }),
}));
