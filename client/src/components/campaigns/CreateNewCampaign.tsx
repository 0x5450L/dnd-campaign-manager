import { useState } from "react";
import { createCampaign } from "../../services/api/campaigns";
import type { ApiError } from "../../services/api/errors";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useAuth } from "../../hooks/useAuth";
import CommonButton from "../ui/buttons/CommonButton";
import CommonInput from "../ui/inputs/CommonInput";

function CreateNewCampaign() {
  const { fetchCampaigns } = useCampaigns();
  const { user } = useAuth();
  const [nameError, setNameError] = useState<string | null>(null);
  const [createCampaignError, setCreateCampaignError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      //TODO: In future, make a unutorized campaign
      setCreateCampaignError("You must be logged in to create a campaign");
      return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const setting = formData.get("setting") as string;
    const imageUrl = formData.get("imageUrl") as string;
    if (!name) {
      setNameError("Campaign name is required");
      return;
    }

    createCampaign(name, description, setting, imageUrl)
      .then(async () => {
        await fetchCampaigns();
        e.target.reset();
        setNameError(null);
        setCreateCampaignError(null);
      })
      .catch((error: ApiError) => {
        setCreateCampaignError(error.data.error.message);
        console.error(error.data.error.message);
      });
  };

  return (
    <div className="bg-surface/50 p-6 rounded-xl border border-rule">
      <h2 className="text-lg font-semibold text-ink mb-4">Create New Campaign</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <CommonInput type="text" name="name" placeholder="Campaign Name *" variant="boxed" />
        {nameError && <p className="text-rust text-sm">{nameError}</p>}
        <CommonInput type="text" name="description" placeholder="Description (optional)" variant="boxed" />
        <CommonInput type="text" name="setting" placeholder="Setting (optional)" variant="boxed" />
        <CommonInput type="text" name="imageUrl" placeholder="Image URL (optional)" variant="boxed" />
        <CommonButton type="submit">Create Campaign</CommonButton>
        {createCampaignError && <p className="text-rust text-sm">{createCampaignError}</p>}
      </form>
    </div>
  );
}

export default CreateNewCampaign;
