import { useCallback, useEffect, useState } from "react";
import { deleteCampaign as deleteCampaignApi, getCampaign, getCampaigns, updateCampaign as updateCampaignApi } from "../../services/api/campaigns";
import type { Campaign, GetCampaignsResponse, UpdateCampaignPayload } from "../../types/campaigns";
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

  const fetchCampaigns = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
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

  const fetchCampaign = useCallback(async (id: string): Promise<Campaign | null> => {
    if (!token) return null;
    setIsLoading(true);
    try {
      const data = await getCampaign(id);
      setMessage(data.message);
      return data.campaign;
    } catch (error: unknown) {
      console.error("Error fetching campaign:", error);
      setMessage((error as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteCampaign = async (id: string) => {
    if (!token) return;
    deleteCampaignApi(id)
      .then(async () => {
        await fetchCampaigns();
        navigate(`/campaigns`);
      })
      .catch((error: Error) => {
        console.error("Error deleting campaign:", error);
        setMessage(error.message);
      });
  };

  const updateCampaign = useCallback(async (id: string, payload: UpdateCampaignPayload) => {
    if (!token) return null;
    setIsLoading(true);
    try {
      const data = await updateCampaignApi(id, payload);
      setMessage(data.message);
      const campaignToUpdate = campaigns?.find((campaign) => campaign.id === id);
      if (campaignToUpdate) {
        const updatedCampaign = { ...campaignToUpdate, ...data.campaign };
        setCampaigns(campaigns!.map((campaign) => campaign.id === id ? updatedCampaign : campaign));
      }
      return data.campaign;
    } catch (error: unknown) {
      console.error("Error updating campaign:", error);
      setMessage((error as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        setCampaigns,
        fetchCampaigns,
        fetchCampaign,
        updateCampaign,
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
