import { useAuth } from "../hooks/useAuth";

function HomePage() {
  const { user } = useAuth();

  const userInfo = () => {
    return (
      user && (
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
      )
    );
  };

  return (
    <div>
      <h1>Home Page</h1>
      {userInfo()}
    </div>
  );
}

export default HomePage;
