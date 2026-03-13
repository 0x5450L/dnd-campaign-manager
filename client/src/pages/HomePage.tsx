import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import CommonButton from "../components/ui/buttons/CommonButton";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-53px)] gap-6">
      {user && (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col gap-4 min-w-72">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-400">Email: <span className="text-gray-200">{user.email}</span></p>
            <p className="text-sm text-gray-400">Name: <span className="text-gray-200">{user.displayName}</span></p>
          </div>

          <CommonButton onClick={() => navigate("/campaigns")}>Campaigns</CommonButton>
        </div>
      )}
    </div>
  );
}

export default HomePage;
