import { useCallback, useEffect, useState } from "react";
import { deleteCampaign as deleteCampaignApi, getCampaigns } from "../../services/api/campaigns";
import type { Campaign, GetCampaignsResponse } from "../../types/campaigns";
import { CampaignsContext } from "./CampaignsContext";
import { Outlet, useNavigate } from "react-router-dom";

export const CampaignsProvider = () => {
  const token = localStorage.getItem("dndCampaignManagerJWT");
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [isLoading, setIsLoading] = useState(!!campaigns);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
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

  const deleteCampaign = async (id: string) => {
    if (!token) return;
    deleteCampaignApi(id)
      .then(async () => {
        await fetchAndUpdateCampaigns();
        navigate(`/campaigns`);
      })
      .catch((error: Error) => {
        console.error("Error deleting campaign:", error);
        setMessage(error.message);
      });
  };

  useEffect(() => {
    fetchAndUpdateCampaigns();
  }, [fetchAndUpdateCampaigns]);

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        setCampaigns,
        fetchAndUpdateCampaigns,
        isLoading,
        message,
        setMessage,
        clearMessage,
        deleteCampaign,
      }}
    >
      <Outlet />
    </CampaignsContext.Provider>
  );
};
