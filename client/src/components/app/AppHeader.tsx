import { useNavigate } from "react-router-dom";
import { useMeQuery, useAuthActions } from "../../queries/auth";
import CommonButton from "../ui/buttons/CommonButton";
import InvitesDropdown from "./InvitesDropdown";

function Header() {
  const { data: user } = useMeQuery();
  const { logout } = useAuthActions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-bg/80 border-b border-rule">
      <button
        onClick={() => navigate("/")}
        className="text-lg font-bold text-gold hover:text-gold-bright transition-colors duration-200 cursor-pointer"
      >
        DnD Campaign Manager
      </button>

      {user && (
        <div className="flex  items-center gap-4">
          <InvitesDropdown />
          <span className="text-sm text-dim">{user.displayName}</span>
          <CommonButton onClick={handleLogout} variant="secondary" size="sm" className="hover:text-rust">
            Logout
          </CommonButton>
        </div>
      )}
    </header>
  );
}

export default Header;
