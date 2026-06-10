import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useAuth } from "../../hooks/useAuth";
import { useSSE } from "../../hooks/useSSE";
import type { Campaign } from "../../types/campaigns";
import CommonButton from "../../components/ui/buttons/CommonButton";
import CampaignDetails from "../../components/campaigns/campaign/CampaignDetails";
import CampaignActionsPanel from "../../components/campaigns/campaign/CampaignActionsPanel";
import CampaignHeaderBar from "../../components/campaigns/campaign/CampaignHeaderBar";
import PartyRow from "../../components/campaigns/campaign/PartyRow";
import CampaignCharactersController from "../../components/campaigns/campaign/characters/controller/CampaignCharactersController";
import { LiveSessionProvider } from "../../context/liveSessionContext/LiveSessionProvider";
import SessionPanel from "../../components/campaigns/campaign/session/SessionPanel";

function CampaignPage() {
  const { id } = useParams();
  const { deleteCampaign, fetchCampaign, updateCampaign, message, fetchCampaigns, isLoading } = useCampaigns();
  const { subscribe } = useSSE();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [originalCampaign, setOriginalCampaign] = useState<Campaign | null>(null);

  const isDM = user?.id === campaign?.dmId;

  const hasChanges = !!(
    campaign &&
    originalCampaign &&
    (campaign.name !== originalCampaign.name ||
      campaign.description !== originalCampaign.description ||
      campaign.setting !== originalCampaign.setting ||
      campaign.imageUrl !== originalCampaign.imageUrl)
  );

  useEffect(() => {
    if (!id) return;
    fetchCampaign(id)
      .then((data) => {
        setCampaign(data);
        setOriginalCampaign(data);
      })
      .catch((error) => console.error("Error fetching campaign:", error));
  }, [id, fetchCampaign]);

  useEffect(() => {
    const unsubscribe = subscribe("member_joined", (data: unknown) => {
      if ((data as { campaignId: string }).campaignId !== id) return;
      fetchCampaign(id as string).then((data) => {
        if (!data) return;
        setCampaign(data);
        setOriginalCampaign(data);
      });
    });
    return unsubscribe;
  }, [id, subscribe, fetchCampaign]);

  const handleSave = async () => {
    if (!campaign || !hasChanges) return;
    const updated = await updateCampaign(campaign.id, {
      name: campaign.name,
      description: campaign.description,
      setting: campaign.setting,
      imageUrl: campaign.imageUrl,
    });
    if (updated) {
      setOriginalCampaign({ ...campaign, ...updated });
    }
    fetchCampaigns();
  };

  const handleDeleteCampaign = () => {
    if (id) deleteCampaign(id);
  };

  if (!campaign) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
        {message ? <p className="text-rust">{message}</p> : <p className="text-dim">Campaign not found.</p>}
        <CommonButton onClick={() => navigate("/campaigns")} variant="secondary" size="sm">
          &larr; Campaigns
        </CommonButton>
      </div>
    );
  }

  return (
    <CampaignCharactersController campaignId={campaign.id} dmId={campaign.dmId} currentUserId={user?.id ?? null}>
      <LiveSessionProvider campaign={campaign}>
        <div className="mx-auto flex min-h-[calc(100vh-53px)] w-full max-w-7xl flex-col gap-3 p-3 sm:p-4">
          <CampaignHeaderBar campaign={campaign} isDM={isDM} onChange={setCampaign} />

          {isLoading ? (
            <p className="m-auto text-gold-bright">Loading campaign...</p>
          ) : (
            <>
              <SessionPanel isDM={isDM} />
              
              <PartyRow members={campaign.members} dmId={campaign.dmId} isDM={isDM} />

              <div className="grid items-stretch gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <CampaignDetails campaign={campaign} isDM={isDM} onChange={setCampaign} />
                <CampaignActionsPanel
                  campaignId={campaign.id}
                  isDM={isDM}
                  hasChanges={hasChanges}
                  onSave={handleSave}
                  onDeleteCampaign={handleDeleteCampaign}
                />
              </div>
            </>
          )}
        </div>
      </LiveSessionProvider>
    </CampaignCharactersController>
  );
}

export default CampaignPage;
