import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  initialLiveSessionState,
  liveSessionReducer,
  type LiveSessionAction,
  type LiveSessionState,
} from "./liveSessionReducer";

type LiveSessionStore = LiveSessionState & {
  activeCampaignId: string | null;
  dispatch: (action: LiveSessionAction) => void;
  setActiveCampaign: (campaignId: string) => void;
};

export const useLiveSessionStore = create<LiveSessionStore>()(
  persist(
    (set) => ({
      ...initialLiveSessionState,
      activeCampaignId: null,
      dispatch: (action) => set((state) => liveSessionReducer(state, action)),
      setActiveCampaign: (campaignId) =>
        set((state) => {
          if (state.activeCampaignId === campaignId) return state;
          if (state.isAttendee) return state;
          return {
            ...liveSessionReducer(state, { type: "RESET" }),
            activeCampaignId: campaignId,
          };
        }),
    }),
    {
      name: "dnd-active-campaign-v1",
      partialize: (state) => ({ activeCampaignId: state.activeCampaignId }),
    },
  ),
);
