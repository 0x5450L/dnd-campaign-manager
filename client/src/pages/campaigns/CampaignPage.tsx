import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCampaignQuery,
  useDeleteCampaignMutation,
  useUpdateCampaignMutation,
} from "../../queries/campaigns";
import { useLeaveCampaignMutation } from "../../queries/members";
import { useAuth } from "../../hooks/useAuth";
import { useNotificationStore } from "../../state/notifications/notificationStore";
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotificationStore((s) => s.notify);

  const { data: serverCampaign, isLoading, isError, error } = useCampaignQuery(id);
  const updateCampaign = useUpdateCampaignMutation();
  const deleteCampaign = useDeleteCampaignMutation();
  const leaveCampaign = useLeaveCampaignMutation();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [syncedStamp, setSyncedStamp] = useState<string | null>(null);

  const stamp = serverCampaign ? `${serverCampaign.id}:${serverCampaign.updatedAt}` : null;
  if (serverCampaign && stamp !== syncedStamp) {
    setCampaign(serverCampaign);
    setSyncedStamp(stamp);
  }

  const isDM = user?.id === campaign?.dmId;

  const hasChanges = !!(
    campaign &&
    serverCampaign &&
    (campaign.name !== serverCampaign.name ||
      campaign.description !== serverCampaign.description ||
      campaign.setting !== serverCampaign.setting ||
      campaign.imageUrl !== serverCampaign.imageUrl)
  );

  const handleSave = () => {
    if (!campaign || !hasChanges) return;
    updateCampaign.mutate(
      {
        id: campaign.id,
        payload: {
          name: campaign.name,
          description: campaign.description,
          setting: campaign.setting,
          imageUrl: campaign.imageUrl,
        },
      },
      {
        onError: (err) => notify((err as Error).message, "error"),
      }
    );
  };

  const handleDeleteCampaign = () => {
    if (!id) return;
    deleteCampaign.mutate(id, {
      onSuccess: () => navigate("/campaigns"),
      onError: (err) => notify((err as Error).message, "error"),
    });
  };

  const handleLeaveCampaign = () => {
    if (!id) return;
    leaveCampaign.mutate(id, {
      onSuccess: () => navigate("/campaigns"),
      onError: (err) => notify((err as Error).message, "error"),
    });
  };

  if (isLoading && !campaign) {
    return <p className="m-auto text-gold-bright">Loading campaign...</p>;
  }

  if (!campaign) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
        {isError ? (
          <p className="text-rust">{(error as Error).message}</p>
        ) : (
          <p className="text-dim">Campaign not found.</p>
        )}
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

          <SessionPanel isDM={isDM} />

          <PartyRow members={serverCampaign?.members ?? campaign.members} dmId={campaign.dmId} isDM={isDM} campaignId={campaign.id} />

          <div className="grid items-stretch gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <CampaignDetails campaign={campaign} isDM={isDM} onChange={setCampaign} />
            <CampaignActionsPanel
              campaignId={campaign.id}
              isDM={isDM}
              hasChanges={hasChanges}
              onSave={handleSave}
              onDeleteCampaign={handleDeleteCampaign}
              onLeaveCampaign={handleLeaveCampaign}
            />
          </div>
        </div>
      </LiveSessionProvider>
    </CampaignCharactersController>
  );
}

export default CampaignPage;
