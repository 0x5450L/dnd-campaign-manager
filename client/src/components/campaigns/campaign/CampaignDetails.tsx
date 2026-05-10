import type { Campaign } from "../../../types/campaigns";
import CommonInput from "../../ui/inputs/CommonInput";

type CampaignDetailsProps = {
  campaign: Campaign;
  isDM: boolean;
  onChange: (next: Campaign) => void;
};

function CampaignDetails({ campaign, isDM, onChange }: CampaignDetailsProps) {
  return (
    <div className="flex flex-col gap-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <CommonInput
        type="text"
        name="name"
        value={campaign.name}
        disabled={!isDM}
        onChange={(value) => onChange({ ...campaign, name: value })}
        inputClassName="text-2xl font-bold text-amber-400"
        validator={(value) => {
          if (!value?.trim()) {
            return { errorMessage: "name is required", validatedValue: value };
          }
          return { errorMessage: null, validatedValue: value };
        }}
      />

      <p className="text-sm text-gray-400 mt-1">DM: {campaign.dm.displayName}</p>

      {(campaign.description || isDM) && (
        <CommonInput
          type="text"
          name="description"
          value={campaign.description}
          disabled={!isDM}
          onChange={(value) => onChange({ ...campaign, description: value })}
        >
          Description
        </CommonInput>
      )}

      {(campaign.setting || isDM) && (
        <CommonInput
          type="text"
          name="setting"
          value={campaign.setting}
          disabled={!isDM}
          onChange={(value) => onChange({ ...campaign, setting: value })}
        >
          Setting
        </CommonInput>
      )}

      {(campaign.imageUrl || isDM) && (
        <CommonInput
          type="text"
          name="imageUrl"
          value={campaign.imageUrl}
          disabled={!isDM}
          onChange={(value) => onChange({ ...campaign, imageUrl: value })}
        >
          Image URL
        </CommonInput>
      )}
    </div>
  );
}

export default CampaignDetails;
