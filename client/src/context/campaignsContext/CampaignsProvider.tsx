import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteCampaign as deleteCampaignApi,
  getCampaign,
  getCampaigns,
  updateCampaign as updateCampaignApi,
} from "../../services/api/campaigns";
import type { Campaign, GetCampaignsResponse, UpdateCampaignPayload } from "../../types/campaigns";
import { CampaignsContext } from "./CampaignsContext";
import { Outlet, useNavigate } from "react-router-dom";
import { useSSE } from "../../hooks/useSSE";

export const CampaignsProvider = () => {
  const { subscribe } = useSSE();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [isLoading, setIsLoading] = useState(!!campaigns);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const fetchCampaigns = useCallback(async () => {
    const token = localStorage.getItem("dndCampaignManagerJWT");
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
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe("member_joined", () => fetchCampaigns());
    return unsubscribe;
  }, [subscribe, fetchCampaigns]);

  const fetchCampaign = useCallback(async (id: string): Promise<Campaign | null> => {
    const token = localStorage.getItem("dndCampaignManagerJWT");
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
  }, []);

  const deleteCampaign = useCallback(
    async (id: string) => {
      const token = localStorage.getItem("dndCampaignManagerJWT");
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
    },
    [fetchCampaigns, navigate]
  );

  const updateCampaign = useCallback(
    async (id: string, payload: UpdateCampaignPayload) => {
      const token = localStorage.getItem("dndCampaignManagerJWT");
      if (!token) return null;
      setIsLoading(true);
      try {
        const data = await updateCampaignApi(id, payload);
        setMessage(data.message);
        setCampaigns((prev) => prev?.map((c) => (c.id === id ? { ...c, ...data.campaign } : c)) ?? null);
        return data.campaign;
      } catch (error: unknown) {
        console.error("Error updating campaign:", error);
        setMessage((error as Error).message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return (
    <CampaignsContext.Provider value={value}>
      <Outlet />
    </CampaignsContext.Provider>
  );
};
