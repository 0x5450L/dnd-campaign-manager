import { useContext } from "react";
import { CampaignsContext } from "../context/campaignsContext/CampaignsContext";

export const useCampaigns = () => {
  const context = useContext(CampaignsContext);
  if (!context) {
    throw new Error("useCampaigns must be used within CampaignsProvider");
  }
  return context;
};