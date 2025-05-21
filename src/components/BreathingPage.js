import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const BreathingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(60); // 1 min timer

  const seriesSlug = "pause-with-5-breaths"; // ✅ change this dynamically if needed

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds === 0 && user) {
      // ✅ Refill hearts to 5 when timer ends
      fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setHearts: 5 }),
      }).then(() => {
        navigate(`/learn/${seriesSlug}`);
      });
    }
  }, [seconds, user, navigate, seriesSlug]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-center px-6 py-12">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">🧘‍♂️ Just Breathe...</h1>
      <p className="text-blue-600 text-lg mb-6">Let’s take a short mindful break while your hearts refill.</p>

      <div className="text-6xl font-bold text-blue-800 mb-6 animate-pulse">
        {seconds}s
      </div>

      <p className="text-sm text-gray-500">Refilling hearts... You'll be redirected when it's done.</p>
    </div>
  );
};

export default BreathingPage;
