import CreateNewCampaign from "../components/campaigns/CreateNewCampaign";
import CampaignsList from "../components/campaigns/list/CampaignsList";
import { CampaignsProvider } from "../context/campaignsContext/CampaignsProvider";

function CampaignsPage() {
  return (
    <CampaignsProvider>
      <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-amber-400">Your Campaigns</h1>
        <CreateNewCampaign />
        <CampaignsList />
      </div>
    </CampaignsProvider>
  );
}

export default CampaignsPage;
