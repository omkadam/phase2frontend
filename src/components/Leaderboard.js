import React, { useEffect, useState } from "react";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/leaderboard");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="p-4 max-h-[75vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">🏆 XP Leaderboard</h2>
      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users yet</p>
      ) : (
        users.map((user, index) => (
          <div
            key={user.userId || index} // ✅ Safe fallback key
            className="flex justify-between items-center bg-white shadow p-3 rounded-lg mb-3"
          >
            <div>
              <div className="font-semibold text-lg">
                #{index + 1} {user.name || user.username || "Anonymous"}
              </div>
              <div className="text-sm text-gray-500">@{user.username}</div>
            </div>
            <div className="font-bold text-orange-600 text-lg">⚡ {user.xp}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default Leaderboard;
