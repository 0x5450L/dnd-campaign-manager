import { create } from "zustand";
import { persist } from "zustand/middleware";

type CampaignVisitsStore = {
  visitedAt: Record<string, number>;
  markVisited: (campaignId: string) => void;
};

export const useCampaignVisitsStore = create<CampaignVisitsStore>()(
  persist(
    (set) => ({
      visitedAt: {},
      markVisited: (campaignId) =>
        set((state) => ({
          visitedAt: { ...state.visitedAt, [campaignId]: Date.now() },
        })),
    }),
    { name: "dnd-campaign-visits-v1" },
  ),
);
