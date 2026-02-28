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
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Home Page</h1>
      {user && (
        <div className="userInfo flex flex-col items-start justify-center fit-content mg-auto gap-4">
          <ul className="flex flex-col items-start justify-center fit-content mg-auto gap-2">
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

          <div className="flex flex-row items-center justify-center align-senter gap-2 w-full">
            <button
              onClick={() => navigate("/campaigns")}
              className="bg-purple-500 text-white p-2 rounded-md cursor-pointer hover:bg-purple-600 transition-bg duration-300"
            >
              Campaigns
            </button>

            <button
              onClick={handleLogout}
              className="bg-green-500 text-white p-2 rounded-md cursor-pointer hover:bg-green-600 transition-bg duration-300"
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
