import { useParams, useNavigate } from "react-router-dom";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useAuth } from "../../hooks/useAuth";

function CampaignPage() {
  const { id } = useParams();
  const { campaigns, deleteCampaign } = useCampaigns();
  const { user } = useAuth();
  const navigate = useNavigate();

  const campaign = campaigns?.find((c) => c.id === id);

  const handleDeleteCampaign = () => {
    if (!id) return;
    deleteCampaign(id);
  };

  if (!campaign) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-400">Campaign not found.</p>
        <button
          onClick={() => navigate("/campaigns")}
          className="text-amber-300 hover:text-amber-100 underline mt-2 cursor-pointer"
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  const isDM = user?.id === campaign.dmId;

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/campaigns")}
          className="text-gray-400 hover:text-amber-300 transition-colors duration-200 cursor-pointer"
        >
          &larr; Back
        </button>
        {isDM && (
          <button
            onClick={handleDeleteCampaign}
            className="bg-red-900/50 hover:bg-red-800 text-red-300 text-sm px-4 py-2 rounded-lg border border-red-800 cursor-pointer transition-colors duration-200"
          >
            Delete Campaign
          </button>
        )}
      </div>

      {/* Campaign Info */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h1 className="text-2xl font-bold text-amber-400">{campaign.name}</h1>
        <p className="text-sm text-gray-400 mt-1">DM: {campaign.dm.displayName}</p>

        {campaign.description && (
          <p className="text-gray-300 mt-4">{campaign.description}</p>
        )}

        {campaign.setting && (
          <div className="mt-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Setting</span>
            <p className="text-gray-300 mt-1">{campaign.setting}</p>
          </div>
        )}

        {campaign.imageUrl && (
          <div className="mt-4">
            <img
              src={campaign.imageUrl}
              alt={campaign.name}
              className="rounded-lg max-h-48 object-cover border border-gray-700"
            />
          </div>
        )}
      </div>

      {/* Members */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">
          Members ({campaign.members.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {campaign.members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between bg-gray-700/30 px-4 py-2 rounded-lg"
            >
              <span className="text-gray-300">{member.user.displayName}</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  member.role === "DM"
                    ? "bg-amber-600/20 text-amber-300"
                    : "bg-blue-600/20 text-blue-300"
                }`}
              >
                {member.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CampaignPage;
