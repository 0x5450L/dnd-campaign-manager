import { useNavigate } from "react-router-dom";
import { useMeQuery } from "../queries/auth";
import CommonButton from "../components/ui/buttons/CommonButton";

function HomePage() {
  const { data: user } = useMeQuery();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-53px)] gap-6">
      {user && (
        <div className="bg-surface/50 p-6 rounded-xl border border-rule flex flex-col gap-4 min-w-72">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-dim">Email: <span className="text-ink">{user.email}</span></p>
            <p className="text-sm text-dim">Name: <span className="text-ink">{user.displayName}</span></p>
          </div>

          <CommonButton onClick={() => navigate("/campaigns")}>Campaigns</CommonButton>
        </div>
      )}
    </div>
  );
}

export default HomePage;
