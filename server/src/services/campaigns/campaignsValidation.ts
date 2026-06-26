import { AppError } from "../../utils/errors";

export const requireCampaignName = (name: string | undefined): string => {
  if (!name) {
    throw new AppError(400, "Campaign name is required");
  }
  return name;
};
