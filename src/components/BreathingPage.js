import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useRive } from "@rive-app/react-canvas";

const BreathingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(60); // 1 min timer

  const seriesSlug = "pause-with-5-breaths"; // ✅ change this dynamically if needed

  // Initialize Rive animation
  const { RiveComponent } = useRive({
    src: "/chatur_breath-new.riv", // Make sure this file is in your public folder
    autoplay: true,
    stateMachines: "State Machine 1", // Default state machine name, adjust if different
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds === 0 && user) {
      // ✅ Refill hearts to 5 when timer ends
      fetch(`https://sochu.online/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setHearts: 5 }),
      }).then(() => {
        navigate(`/learn/${seriesSlug}`);
      });
    }
  }, [seconds, user, navigate, seriesSlug]);

  return (
    <div className="min-h-screen w-full relative bg-[#FF8DD2]">
      {/* Full screen Rive animation */}
      <div className="absolute inset-0 w-full h-full">
        <RiveComponent />
      </div>
      

    </div>
  );
};

export default BreathingPage;