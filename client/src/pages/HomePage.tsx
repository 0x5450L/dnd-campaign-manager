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
    <div>
      <h1>Home Page</h1>
      {user && (
        <div className="userInfo">
          <ul className="flex flex-col items-start justify-center fit-content mg-auto">
            <li className="text-sm text-gray-500">
              Email: <span className="text-gray-600">{user.email}</span>
            </li>
            <li className="text-sm text-gray-500">
              Name: <span className="text-gray-600">{user.name}</span>
            </li>
            <li className="text-sm text-gray-500">
              ID: <span className="text-purple-600">{user.id}</span>
            </li>
          </ul>

          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
