import { useEffect, useState } from "react";

function HomePage() {
  const [health, setHealth] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealth(data.message);
        setUserCount(data.userCount);
      });
  }, []);

  return (
    <div>
      <p>Health: {health}</p>
      <p>User Count: {userCount}</p>
    </div>
  );
}

export default HomePage;
