import { useEffect, useState } from "react";

function HomePage() {
  const [health, setHealth] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [loginData, setLoginData] = useState<{ email: string; name: string; id: string } | null>(null);

  const userInfo = () => {
    return (
      loginData && (
        <ul className="flex flex-col items-start justify-center fit-content mg-auto">
          <li className="text-sm text-gray-500">
            Email: <span className="text-gray-600">{loginData.email}</span>
          </li>
          <li className="text-sm text-gray-500">
            Name: <span className="text-gray-600">{loginData.name}</span>
          </li>
          <li className="text-sm text-gray-500">
            ID: <span className="text-purple-600">{loginData.id}</span>
          </li>
        </ul>
      )
    );
  };

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        console.log("healthData", data);
        setHealth(data.message);
        setUserCount(data.userCount);
      });
  }, []);

  useEffect(() => {
    fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", password: "test" }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("loginData", data);
        setLoginData(data.user);
      });
  }, []);

  return (
    <div>
      <p>Health: {health}</p>
      <p>User Count: {userCount}</p>

      {userInfo()}
    </div>
  );
}

export default HomePage;
