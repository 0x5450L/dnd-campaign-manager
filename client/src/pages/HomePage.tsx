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
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Home Page</h1>
      {user && (
        <div className="userInfo flex flex-col items-start justify-center fit-content mg-auto">
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

          <button onClick={handleLogout} className="bg-green-500 text-white p-2 rounded-md cursor-pointer">Logout</button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
