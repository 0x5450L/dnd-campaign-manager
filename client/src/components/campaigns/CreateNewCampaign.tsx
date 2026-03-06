import { useState } from "react";
import { createCampaign } from "../../services/api/campaigns";
import type { ApiError } from "../../services/api/errors";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useAuth } from "../../hooks/useAuth";

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
        setCreateCampaignError(error.data.message);
      });
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">Create New Campaign</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Campaign Name *"
          className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500"
        />
        {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500"
        />
        <input
          type="text"
          name="setting"
          placeholder="Setting (optional)"
          className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500"
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL (optional)"
          className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold p-2.5 rounded-lg cursor-pointer transition-colors duration-200"
        >
          Create Campaign
        </button>
        {createCampaignError && <p className="text-red-400 text-sm">{createCampaignError}</p>}
      </form>
    </div>
  );
}

export default CreateNewCampaign;
