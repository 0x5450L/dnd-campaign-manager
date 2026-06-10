import CreateNewCampaign from "../../components/campaigns/CreateNewCampaign";
import CampaignsList from "../../components/campaigns/list/CampaignsList";

function CampaignsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gold">Your Campaigns</h1>
      <CreateNewCampaign />
      <CampaignsList />
    </div>
  );
}

export default CampaignsPage;
