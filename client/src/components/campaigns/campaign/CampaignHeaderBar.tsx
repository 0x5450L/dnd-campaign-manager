import { useNavigate } from "react-router-dom";
import type { Campaign } from "@/types/campaigns";
import CommonButton from "@/components/ui/buttons/CommonButton";
import { useDmToolboxStore } from "@/state/ai/dmToolboxStore";

type CampaignHeaderBarProps = {
  campaign: Campaign;
  isDM: boolean;
  onChange: (next: Campaign) => void;
};

function CampaignHeaderBar({ campaign, isDM, onChange }: CampaignHeaderBarProps) {
  const navigate = useNavigate();
  const toggleToolbox = useDmToolboxStore((s) => s.toggle);
  const name = campaign.name ?? "";
  const nameInvalid = isDM && !name.trim();

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <CommonButton
        onClick={() => navigate("/campaigns")}
        variant="secondary"
        size="md"
        className="h-11"
      >
        &larr; Campaigns
      </CommonButton>

      <label
        className={`order-last flex h-11 w-full min-w-0 items-center border-b-2 px-3 transition-colors sm:order-none sm:w-auto sm:flex-1 ${
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
          className="w-full min-w-0 truncate bg-transparent text-center font-fantasy text-2xl tracking-wide text-gold outline-none placeholder:text-faint/40 sm:text-3xl"
        />
      </label>

      {isDM && (
        <CommonButton
          onClick={toggleToolbox}
          variant="secondary"
          size="md"
          className="h-11"
        >
          DM Toolbox
        </CommonButton>
      )}

      <div className="flex h-11 min-w-0 items-baseline gap-2 rounded-md border border-rule bg-surface/40 px-3 py-2 sm:gap-3 sm:px-4">
        <span className="shrink-0 font-fantasy text-sm font-bold uppercase tracking-[0.2em] text-gold-bright">
          DM
        </span>
        <span className="truncate font-fantasy text-lg text-ink">
          {campaign.dm.displayName}
        </span>
      </div>
    </div>
  );
}

export default CampaignHeaderBar;
