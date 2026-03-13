import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CommonButton from "../ui/buttons/CommonButton";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900/80 border-b border-gray-700">
      <button
        onClick={() => navigate("/")}
        className="text-lg font-bold text-amber-400 hover:text-amber-300 transition-colors duration-200 cursor-pointer"
      >
        DnD Campaign Manager
      </button>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user.displayName}</span>
          <CommonButton onClick={handleLogout} variant="secondary" size="sm" className="hover:!text-red-400">
            Logout
          </CommonButton>
        </div>
      )}
    </header>
  );
}

export default Header;
