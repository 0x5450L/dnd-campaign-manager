import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useAuth } from "../../hooks/useAuth";
import { useSSE } from "../../hooks/useSSE";
import type { Campaign } from "../../types/campaigns";
import CommonButton from "../../components/ui/buttons/CommonButton";
import CreateInvite from "../../components/campaigns/campaign/CreateInvite";
import CampaignHeaderActions from "../../components/campaigns/campaign/CampaignHeaderActions";
import CampaignDetails from "../../components/campaigns/campaign/CampaignDetails";
import CampaignMembersList from "../../components/campaigns/campaign/CampaignMembersList";
import CampaignCharactersController from "../../components/campaigns/campaign/characters/controller/CampaignCharactersController";

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
      <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
        {message ? (
          <p className="text-red-400">{message}</p>
        ) : (
          <p className="text-gray-400">Campaign not found.</p>
        )}
        <CommonButton onClick={() => navigate("/campaigns")} variant="secondary" size="sm">
          Back to campaigns
        </CommonButton>
      </div>
    );
  }

  return (
    <CampaignCharactersController
      campaignId={campaign.id}
      dmId={campaign.dmId}
      currentUserId={user?.id ?? null}
    >
      <div className="min-h-[calc(100vh-53px)] h-100% max-w-3xl mx-auto p-6 flex flex-col gap-6">
        <CampaignHeaderActions
          isDM={isDM}
          hasChanges={hasChanges}
          onSave={handleSave}
          onDeleteCampaign={handleDeleteCampaign}
        />

        {isLoading ? (
          <p className="text-amber-400 m-auto">Loading campaign...</p>
        ) : (
          <>
            <CampaignDetails campaign={campaign} isDM={isDM} onChange={setCampaign} />
            <CampaignMembersList members={campaign.members} />
            <CreateInvite campaignId={campaign.id} />
          </>
        )}
      </div>
    </CampaignCharactersController>
  );
}

export default CampaignPage;
