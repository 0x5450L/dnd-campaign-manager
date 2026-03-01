import { createContext } from "react";
import type { Campaign } from "../../types/campaigns";

type CampaignsContextType = {
  campaigns: Campaign[] | null;
  fetchAndUpdateCampaigns: () => Promise<void>;
  setCampaigns: (campaigns: Campaign[]) => void;
  isLoading: boolean;
  message: string | null;
  setMessage: (message: string) => void;
  clearMessage: () => void;
};

export const CampaignsContext = createContext<CampaignsContextType | null>(null);