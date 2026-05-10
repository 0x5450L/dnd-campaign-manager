import type { Campaign } from "../../../types/campaigns";

type CampaignMembersListProps = {
  members: Campaign["members"];
};

function CampaignMembersList({ members }: CampaignMembersListProps) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-3">Members ({members.length})</h2>
      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between bg-gray-700/30 px-4 py-2 rounded-lg">
            <span className="text-gray-300">{member.user.displayName}</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                member.role === "dm" ? "bg-amber-600/20 text-amber-300" : "bg-blue-600/20 text-blue-300"
              }`}
            >
              {member.role}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CampaignMembersList;
