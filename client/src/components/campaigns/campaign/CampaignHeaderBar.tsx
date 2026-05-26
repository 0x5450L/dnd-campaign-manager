import { useNavigate } from "react-router-dom";
import type { Campaign } from "../../../types/campaigns";
import CommonButton from "../../ui/buttons/CommonButton";

type CampaignHeaderBarProps = {
  campaign: Campaign;
  isDM: boolean;
  onChange: (next: Campaign) => void;
};

function CampaignHeaderBar({ campaign, isDM, onChange }: CampaignHeaderBarProps) {
  const navigate = useNavigate();
  const name = campaign.name ?? "";
  const nameInvalid = isDM && !name.trim();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CommonButton
        onClick={() => navigate("/campaigns")}
        variant="secondary"
        size="md"
        className="h-11"
      >
        &larr; Campaigns
      </CommonButton>

      <label
        className={`flex h-11 min-w-0 flex-1 items-center border-b-2 px-3 transition-colors ${
          nameInvalid
            ? "border-rust"
            : "border-rule hover:border-hover focus-within:border-hover"
        }`}
      >
        <input
          type="text"
          name="campaign-name"
          value={name}
          disabled={!isDM}
          onChange={(e) => onChange({ ...campaign, name: e.target.value })}
          placeholder="Campaign name"
          className="w-full min-w-0 bg-transparent text-center font-fantasy text-3xl tracking-wide text-gold outline-none placeholder:text-faint/40"
        />
      </label>

      <div className="flex h-11 items-baseline gap-3 rounded-md border border-rule bg-surface/40 px-4 py-2">
        <span className="font-fantasy text-sm font-bold uppercase tracking-[0.2em] text-gold-bright">
          DM
        </span>
        <span className="font-fantasy text-lg text-ink">
          {campaign.dm.displayName}
        </span>
      </div>
    </div>
  );
}

export default CampaignHeaderBar;
