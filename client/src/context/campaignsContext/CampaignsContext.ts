import { createContext } from "react";
import type { Campaign } from "../../types/campaigns";

type CampaignsContextType = {
  campaigns: Campaign[] | null;
  fetchCampaigns: () => Promise<void>;
  fetchCampaign: (id: string) => Promise<Campaign | null>;
  setCampaigns: (campaigns: Campaign[]) => void;
  isLoading: boolean;
  message: string | null;
  setMessage: (message: string) => void;
  clearMessage: () => void;
  deleteCampaign: (id: string) => Promise<void>;
};

export const CampaignsContext = createContext<CampaignsContextType | null>(null);