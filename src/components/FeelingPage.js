import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const feelings = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😤", label: "Angry" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😎", label: "Confident" },
];

const FeelingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleFeelingSelect = (feeling) => {
    fetch(`http://localhost:3001/api/feeling/${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feeling }),
    }).then(() => {
      navigate("/learn");
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-orange-50 text-center">
      <h1 className="text-2xl font-bold mb-4 text-orange-700">How are you feeling today?</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {feelings.map((f) => (
          <button
            key={f.label}
            onClick={() => handleFeelingSelect(f.label)}
            className="bg-white border border-orange-300 shadow-sm rounded-xl p-4 text-3xl hover:bg-orange-100"
          >
            {f.emoji}
            <div className="text-xs mt-2 text-gray-600">{f.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeelingPage;
