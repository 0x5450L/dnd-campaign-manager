import { AppError } from "../../utils/errors";

export const requireCampaignId = (
  value: string | undefined,
  message: string,
): string => {
  if (!value) {
    throw new AppError(400, message);
  }
  return value;
};
