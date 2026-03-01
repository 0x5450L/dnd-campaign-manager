import { useCallback, useEffect, useState } from "react";
import { getCampaigns } from "../../services/api/campaigns";
import type { Campaign, GetCampaignsResponse } from "../../types/campaigns";
import { CampaignsContext } from "./CampaignsContext";

export const CampaignsProvider = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("dndCampaignManagerJWT");
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [isLoading, setIsLoading] = useState(!!campaigns);
  const [message, setMessage] = useState<string | null>(null);
  const clearMessage = () => {
    setMessage(null);
  };

  const fetchAndUpdateCampaigns = useCallback(async () => {
    if (!token) return;
    getCampaigns()
      .then((data: GetCampaignsResponse) => {
        setCampaigns(data.campaigns);
        setMessage(data.message);
      })
      .catch((error: Error) => {
        console.error("Error fetching campaigns:", error);
        setMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAndUpdateCampaigns();
  }, [fetchAndUpdateCampaigns]);

  return (
    <CampaignsContext.Provider
      value={{ campaigns, setCampaigns, fetchAndUpdateCampaigns, isLoading, message, setMessage, clearMessage }}
    >
      {children}
    </CampaignsContext.Provider>
  );
};
