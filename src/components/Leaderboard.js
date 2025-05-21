import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState("leaderboard");
  const navigate = useNavigate();
  const { seriesSlug } = useParams();

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

  const handleFooterClick = (page) => {
    setSelected(page);
    navigate(`/${page}`);
  };

  return (
    <div className="p-4 max-h-[75vh] overflow-y-auto bg-gray-100 ">
      <div className="text-center mb-4">
        <div className="flex flex-col items-center justify-center mb-2">
          <img
            src="/leaderboardv2.svg" // Replace with your medal icon
            alt="Medal"
            className="w-24 h-24"
          />
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <p className="text-sm text-gray-500">See where you stand among other learners in the community.</p>
        </div>
        <hr className="border-gray-300 my-2" />
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users yet</p>
      ) : (
        <div className="space-y-2">
          {users.map((user, index) => (
            <div
              key={user.userId || index}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold text-blue-600">{index + 1}</div>
                <div className="rounded-full bg-purple-500 w-10 h-10 flex items-center justify-center text-white text-lg font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <div className="text-lg font-medium">{user.name || "Anonymous"}</div>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-800">{user.xp} XP</div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-6 z-50"> 
        <div className="flex justify-around items-center text-gray-600">
          <button
            onClick={() => handleFooterClick("learn")}
            className={`flex flex-col items-center ${
              selected === "broadcasts" ? "text-blue-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "learn"
                  ? "/sochumenuselectednew.png"
                  : "/sochumenuunselectednew.png"
              }
              alt="Broadcast"
              className="h-14 w-14"
            />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={() => handleFooterClick("leaderboard")}
            className={`flex flex-col items-center ${
              selected === "leaderboard" ? "text-yellow-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "leaderboard"
                  ? "/manjumenuselectednew.png"
                  : "/manjumenuunselectednew.png"
              }
              alt="Leaderboard"
              className="h-14 w-14"
            />
            <span className="text-xs">Leaderboard</span>
          </button>

          <button
            onClick={() => handleFooterClick("broadcasts")}
            className={`flex flex-col items-center ${
              selected === "entertainment" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "broadcasts"
                  ? "/rajumenuselectednew.png"
                  : "/rajumenuunselectednew.png"
              }
              alt="Entertainment"
              className="h-14 w-14"
            />
            <span className="text-xs">Entertainment</span>
          </button>

          <button
            onClick={() => handleFooterClick("setting")}
            className={`flex flex-col items-center ${
              selected === "learn" ? "text-pink-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "setting"
                  ? "/anjumenuunselectednew.png"
                  : "/anjumenuselectednew.png"
              }
              alt="Learn"
              className="h-14 w-14"
            />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
