import { useState } from "react";
import { createCampaign } from "../../services/api/campaigns";
import type { ApiError } from "../../services/api/errors";

function CreateNewCampaign() {
  const [nameError, setNameError] = useState<string | null>(null);
  const [createCampaignError, setCreateCampaignError] = useState<string | null>(null);
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      .then((data) => {
        console.log("Campaign created successfully", data);
      })
      .catch((error: ApiError) => {
        setCreateCampaignError(error.data.message);
      });
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Campaign Name" />
        {nameError && <p className="text-red-500">{nameError}</p>}
        <input type="text" name="description" placeholder="Campaign Description" />
        <input type="text" name="setting" placeholder="Campaign Setting" />
        <input type="text" name="imageUrl" placeholder="Campaign Image URL" />
        <button type="submit">Create Campaign</button>
        {createCampaignError && <p className="text-red-500">{createCampaignError}</p>}
      </form>
    </div>
  );
}

export default CreateNewCampaign;
