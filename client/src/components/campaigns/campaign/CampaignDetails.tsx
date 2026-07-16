import type { Campaign } from "@/types/campaigns";

type CampaignDetailsProps = {
  campaign: Campaign;
  isDM: boolean;
  onChange: (next: Campaign) => void;
};

const textareaClass =
  "w-full resize-none rounded-md border border-rule bg-bg/40 px-3 py-2 text-sm text-ink placeholder:text-faint/60 outline-none transition-colors hover:border-hover focus:border-hover disabled:cursor-default disabled:hover:border-rule";

const labelClass =
  "font-fantasy text-xs font-bold uppercase tracking-[0.16em] text-gold-bright";

function CampaignDetails({ campaign, isDM, onChange }: CampaignDetailsProps) {
  const showDescription = !!campaign.description || isDM;
  const showSetting = !!campaign.setting || isDM;

  if (!showDescription && !showSetting) return null;

  return (
    <div className="cs-section-card flex h-full flex-col gap-3 p-4">
      {showDescription && (
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={campaign.description}
            disabled={!isDM}
            onChange={(e) => onChange({ ...campaign, description: e.target.value })}
            placeholder={isDM ? "What's the campaign about?" : ""}
            className={`${textareaClass} flex-1 min-h-[80px]`}
          />
        </div>
      )}

      {showSetting && (
        <div className="flex flex-col gap-1">
          <label htmlFor="setting" className={labelClass}>
            Setting
          </label>
          <textarea
            id="setting"
            name="setting"
            rows={2}
            value={campaign.setting}
            disabled={!isDM}
            onChange={(e) => onChange({ ...campaign, setting: e.target.value })}
            placeholder={isDM ? "Forgotten Realms, Sword Coast, year 1490 DR..." : ""}
            className={textareaClass}
          />
        </div>
      )}
    </div>
  );
}

export default CampaignDetails;
