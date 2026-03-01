import { useParams } from "react-router-dom";
import { useCampaigns } from "../../hooks/useCampaigns";

function CampaignPage() {
  const { id } = useParams();
  const { deleteCampaign } = useCampaigns();

  const handleDeleteCampaign = () => {
    if (!id) return;
    deleteCampaign(id);
  };
  return (
    <div>
      <h1>Campaign Page</h1>
      <button onClick={handleDeleteCampaign}>Delete Campaign</button>
    </div>
  );
}

export default CampaignPage;
