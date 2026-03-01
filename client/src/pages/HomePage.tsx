import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-3xl font-bold text-amber-400">DnD Campaign Manager</h1>
      {user && (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col gap-4 min-w-72">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-400">Email: <span className="text-gray-200">{user.email}</span></p>
            <p className="text-sm text-gray-400">Name: <span className="text-gray-200">{user.displayName}</span></p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/campaigns")}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold p-2.5 rounded-lg cursor-pointer transition-colors duration-200"
            >
              Campaigns
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold p-2.5 rounded-lg cursor-pointer transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
