import { useState } from "react";
import type { ApiError } from "../../services/api/errors";
import { useCreateCampaignMutation } from "../../queries/campaigns";
import { useAuth } from "../../hooks/useAuth";
import CommonButton from "../ui/buttons/CommonButton";
import CommonInput from "../ui/inputs/CommonInput";

function CreateNewCampaign() {
  const { user } = useAuth();
  const createCampaign = useCreateCampaignMutation();
  const [nameError, setNameError] = useState<string | null>(null);
  const [createCampaignError, setCreateCampaignError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setCreateCampaignError("You must be logged in to create a campaign");
      return;
    }
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const setting = formData.get("setting") as string;
    const imageUrl = formData.get("imageUrl") as string;
    if (!name) {
      setNameError("Campaign name is required");
      return;
    }

    createCampaign.mutate(
      { name, description, setting, imageUrl },
      {
        onSuccess: () => {
          form.reset();
          setNameError(null);
          setCreateCampaignError(null);
        },
        onError: (error) => {
          setCreateCampaignError((error as ApiError).data.error.message);
        },
      }
    );
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
        <CommonButton type="submit" disabled={createCampaign.isPending}>
          {createCampaign.isPending ? "Creating..." : "Create Campaign"}
        </CommonButton>
        {createCampaignError && <p className="text-rust text-sm">{createCampaignError}</p>}
      </form>
    </div>
  );
}

export default CreateNewCampaign;
